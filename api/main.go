package main

import (
	"encoding/json"
	"fmt"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/rs/cors"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/sukhajata/wallet-login/api/verifier"
	"github.com/urfave/negroni"
)

var (
	myVerifier verifier.Verifier
)

// signatureVerificationRequest - a signature validation request
type signatureVerificationRequest struct {
	Signature string `json:"signature"`
	Message string `json:"message"`
	Address string `json: "address"`
}

// isSmartContractRequest - a request to see if an address is a smart contract
type isSmartContractRequest struct {
	Address string `json:"address"`
}


type smartContractVerificationRequest struct {
	Address string `json:"address"`
	Message string `json:"message"`
	Signature string `json:"signature"`
}


func postVerifySignatureHandler(w http.ResponseWriter, req *http.Request) {
	//decode the request body into a signatureVerificationRequest
	decoder := json.NewDecoder(req.Body)
	var request signatureVerificationRequest
	err := decoder.Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	valid, err := myVerifier.VerifySignature(request.Signature, request.Message, request.Address)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte(fmt.Sprintf(`{ valid: %t }`, valid)))
}

func postIsSmartContractHandler(w http.ResponseWriter, req *http.Request) {
	//decode the request body
	decoder := json.NewDecoder(req.Body)
	var request isSmartContractRequest
	err := decoder.Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println(request)

	isSmartContract, err := myVerifier.IsSmartContract(request.Address)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//w.Write([]byte(fmt.Sprintf(`{ isSmartContract: %t }`, isSmartContract)))
	fmt.Fprintf(w, `{ isSmartContract: %t }`, isSmartContract)
}


func postVerifySmartContractHandler(w http.ResponseWriter, req *http.Request) {
	//decode the request body into a signatureVerificationRequest
	decoder := json.NewDecoder(req.Body)
	var request smartContractVerificationRequest
	err := decoder.Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hash := crypto.Keccak256Hash([]byte(request.Message))
	isSmartContract, err := myVerifier.VerifySmartContractWallet(request.Address, hash, []byte(request.Signature))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write([]byte(fmt.Sprintf(`{ isSmartContract: %t }`, isSmartContract)))
}

func main() {
	ethClient, err := ethclient.Dial("https://mainnet.infura.io/v3/b0f6ca46883b4a409b757b1ac341133e")
	if err != nil {
		panic(err)
	}
	myVerifier = verifier.NewVerifier(ethClient)

	router := mux.NewRouter()

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedHeaders:   []string{"X-Requested-With", "Content-Type"},
		AllowedMethods:   []string{"GET", "POST", "HEAD", "OPTIONS"},
		//Debug: true,
	})

	router.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		fmt.Fprintf(w, "Welcome to the home page!")
	})

	router.HandleFunc("/verify-signature", postVerifySignatureHandler).Methods("POST")
	router.HandleFunc("/is-smart-contract", postIsSmartContractHandler).Methods("POST")
	router.HandleFunc("/verify-smart-contract", postVerifySmartContractHandler).Methods("POST")

	n := negroni.New()
	n.Use(negroni.NewRecovery())
	n.Use(c)

	n.UseHandler(router)

	n.Run(":5000")

}