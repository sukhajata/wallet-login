package rest

import (
	"encoding/json"
	"fmt"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/rs/cors"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/sukhajata/wallet-login/api/internal/verifier"
	"github.com/urfave/negroni"
)

type HTTPServer struct {
	myVerifier verifier.Verifier
}

// signatureVerificationRequest - a signature validation request
type signatureVerificationRequest struct {
	Signature string `json:"signature"`
	Message string `json:"message"`
	Address string `json:"address"`
}

// isSmartContractRequest - a request to see if an address is a smart contract
type isSmartContractRequest struct {
	Address string `json:"address"`
}

func (s *HTTPServer) postVerifySignatureHandler(w http.ResponseWriter, req *http.Request) {
	//decode the request body into a signatureVerificationRequest
	decoder := json.NewDecoder(req.Body)
	var request signatureVerificationRequest
	err := decoder.Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	valid, err := s.myVerifier.VerifySignature(request.Signature, request.Message, request.Address)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = w.Write([]byte(fmt.Sprintf("%t", valid)))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (s *HTTPServer) postIsSmartContractHandler(w http.ResponseWriter, req *http.Request) {
	//decode the request body
	decoder := json.NewDecoder(req.Body)
	var request isSmartContractRequest
	err := decoder.Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println(request)

	isSmartContract, err := s.myVerifier.IsSmartContract(request.Address)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = w.Write([]byte(fmt.Sprintf("%t", isSmartContract)))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}


func (s *HTTPServer) postVerifySmartContractHandler(w http.ResponseWriter, req *http.Request) {
	//decode the request body into a signatureVerificationRequest
	decoder := json.NewDecoder(req.Body)
	var request signatureVerificationRequest
	err := decoder.Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println(request)

	hash := crypto.Keccak256Hash([]byte(request.Message))
	valid, err := s.myVerifier.VerifySmartContractWallet(request.Address, hash, []byte(request.Signature))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = w.Write([]byte(fmt.Sprintf("%t", valid)))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func NewHTTPServer(myVerifier verifier.Verifier) {
	s := &HTTPServer{
		myVerifier: myVerifier,
	}

	router := mux.NewRouter()

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedHeaders:   []string{"X-Requested-With", "Content-Type"},
		AllowedMethods:   []string{"GET", "POST", "HEAD", "OPTIONS"},
	})

	router.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		_, err := fmt.Fprintf(w, "Welcome to the home page!")
		if err != nil {
			fmt.Println(err)
		}
	})

	router.HandleFunc("/verify-signature", s.postVerifySignatureHandler).Methods("POST")
	router.HandleFunc("/is-smart-contract", s.postIsSmartContractHandler).Methods("POST")
	router.HandleFunc("/verify-smart-contract", s.postVerifySmartContractHandler).Methods("POST")

	n := negroni.New()
	n.Use(negroni.NewRecovery())
	n.Use(c)

	n.UseHandler(router)

	n.Run(":5000")

}
