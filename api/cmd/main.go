package main

import (
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/sukhajata/wallet-login/api/internal/verifier"
	"github.com/sukhajata/wallet-login/api/rest"
)

func main() {
	ethClient, err := ethclient.Dial("https://mainnet.infura.io/v3/b0f6ca46883b4a409b757b1ac341133e")
	if err != nil {
		panic(err)
	}
	myVerifier := verifier.NewVerifier(ethClient)

	rest.NewHTTPServer(myVerifier)
}