package verifier

import (
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"regexp"
	"testing"
)

const (
	infura = "https://mainnet.infura.io/v3/b0f6ca46883b4a409b757b1ac341133e"
)

func Test_Regex(t *testing.T) {
	addressHex := "0xce36b01ba06d226df97046937390eaa2b33d1082"
	addressRegex := regexp.MustCompile("^0x[0-9a-fA-F]{40}$")
	valid := addressRegex.MatchString(addressHex)

	assert.Equal(t, true, valid)
}

// TestVerifier_IsSmartContract_True - result should be true
func TestVerifier_IsSmartContract_True(t *testing.T) {
	addressHex := "0x5119b5e3a7bff084732a7ec41efed8aa0c4cd6d4"

	ethClient, err := ethclient.Dial(infura)
	if err != nil {
		panic(err)
	}

	myVerifier := NewVerifier(ethClient)
	result, err := myVerifier.IsSmartContract(addressHex)
	assert.NoError(t, err)
	assert.Equal(t, true, result)
}

// TestVerifier_IsSmartContract_False - result should be false
func TestVerifier_IsSmartContract_False(t *testing.T) {
	addressHex := "0xce36b01ba06d226df97046937390eaa2b33d1082"

	ethClient, err := ethclient.Dial(infura)
	if err != nil {
		panic(err)
	}

	myVerifier := NewVerifier(ethClient)
	result, err := myVerifier.IsSmartContract(addressHex)
	assert.NoError(t, err)
	assert.Equal(t, false, result)
}

// TestVerifier_VerifySignature_True - the result should be true
func TestVerifier_VerifySignature_True(t *testing.T) {
	address := "0x90113Ccd7143D53630B1BE6c952C66D1D6d2E254"
	msg := "This is the message that you're looking for"
	sig := "0x9552c642bfbe65792b6434b798b4dfee773a326e1bebe28184af4ded62df207526452a7aefe7ad52e0a40cfb7f8568f4ff7c4999dcc2dc19c35925fddaa7339c1c"

	ethClient, err := ethclient.Dial(infura)
	require.NoError(t, err)

	myVerifier := NewVerifier(ethClient)
	result, err := myVerifier.VerifySignature(sig, msg, address)
	require.NoError(t, err)
	require.Equal(t, true, result)
}

// TestVerifier_VerifySignature_False - the result should be false
func TestVerifier_VerifySignature_False(t *testing.T) {
	address := "0x20113Ccd7143D53630B1BE6c952C66D1D6d2E254"
	msg := "This is the message that you're looking for"
	sig := "0x9552c642bfbe65792b6434b798b4dfee773a326e1bebe28184af4ded62df207526452a7aefe7ad52e0a40cfb7f8568f4ff7c4999dcc2dc19c35925fddaa7339c1c"

	ethClient, err := ethclient.Dial(infura)
	require.NoError(t, err)

	myVerifier := NewVerifier(ethClient)
	result, err := myVerifier.VerifySignature(sig, msg, address)
	require.NoError(t, err)
	require.Equal(t, false, result)
}
