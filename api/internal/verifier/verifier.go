package verifier

import (
	"context"
	"encoding/hex"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/sukhajata/wallet-login/api/internal/erc1271"
	"regexp"
)

type Verifier interface {
	VerifySignature(signature string, message string, addressHex string) (bool, error)
	IsSmartContract(addressHex string) (bool, error)
	VerifySmartContractWallet(addressHex string, hash [32]byte, signature []byte) (bool, error)
}

type verifier struct {
	ethClient *ethclient.Client
	addressRegex *regexp.Regexp
}

func NewVerifier(ethClient *ethclient.Client) Verifier {
	return &verifier{
		ethClient: ethClient,
		addressRegex: regexp.MustCompile("^0x[0-9a-fA-F]{40}$"),
	}
}

var (
	ERC_1271_MAGIC_VALUE = [4]byte{ 0x16, 0x26, 0xba, 0x7e }
)

// VerifySignature - check that the given signature was signed by the owner of the given address
func (v *verifier) VerifySignature(signature string, message string, addressHex string) (bool, error) {
	// check that address is valid
	valid := v.addressRegex.MatchString(addressHex)
	if !valid {
		return false, fmt.Errorf("%s is not a valid hex address", addressHex)
	}

	// add prefix to message and then hash to mimic behavior of eth_sign
	msg := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)
	hash := crypto.Keccak256Hash([]byte(msg))

	// convert signature to bytes, removing 0x prefix
	sig, err := hex.DecodeString(signature[2:])
	if err != nil {
		return false, err
	}

	// check recovery id
	// https://github.com/ethereum/go-ethereum/blob/55599ee95d4151a2502465e0afc7c47bd1acba77/internal/ethapi/api.go#L442
	if sig[64] != 27 && sig[64] != 28 {
		return false, nil
	}
	sig[64] -= 27

	// recover public key from signature
	publicKeyECDSA, err := crypto.SigToPub(hash.Bytes(), sig)
	if err != nil {
		return false, err
	}

	// derive the address from the public key
	derivedAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	// compare the derived address with the address passed into the function
	address := common.HexToAddress(addressHex)
	matches := derivedAddress == address
	
	return matches, nil
}

// IsSmartContract - check whether an address is a smart contract
func (v *verifier) IsSmartContract(addressHex string) (bool, error){
	// check that address is valid
	valid := v.addressRegex.MatchString(addressHex)
	if !valid {
		return false, fmt.Errorf("%s is not a valid hex address", addressHex)
	}

	// check if there is any code at the address
	address := common.HexToAddress(addressHex)
	bytecode, err := v.ethClient.CodeAt(context.Background(), address, nil) // nil is latest block
	if err != nil {
		return false, err
	}

	isContract := len(bytecode) > 0

	return isContract, nil
}

// VerifySmartContractWallet - check that a signature was signed by the smart contract wallet at the given address
func (v *verifier) VerifySmartContractWallet(addressHex string, hash [32]byte, signature []byte) (bool, error) {
	// check that address is valid
	valid := v.addressRegex.MatchString(addressHex)
	if !valid {
		return false, fmt.Errorf("%s is not a valid hex address", addressHex)
	}

	address := common.HexToAddress(addressHex)

	// create an instance of a contract which implements ERC1271, at the given address
	// https://eips.ethereum.org/EIPS/eip-1271
	instance, err := erc1271.NewErc1271(address, v.ethClient)
	if err != nil {
		return false, err
	}

	opts := &bind.CallOpts{
		Pending:     false,
		BlockNumber: nil,
		Context:     context.Background(),
	}

	// call the function on the contract
	result, err := instance.IsValidSignature(opts, hash, signature)
	if err != nil {
		return false, err
	}

	return result == ERC_1271_MAGIC_VALUE, nil

}