package verifier

import (
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"regexp"
	"testing"

	"github.com/ethereum/go-ethereum/crypto"
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
	//addressHex := "0x77f7111B2b211BC504dE66b13F3A8a04cD182842"
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

/*
{
  "address": "0x096CEb79d7D4112d7C86B3Fc24fB6b69Fa52cbD6",
  "msg": "Hi from chainsafe, please sign this message so we can connect you to our app.",
  "sig": "0xd695d1645ad0dad0c69ca59de08619d6cfc76890be841e7012f0a3b52c8b584829f5824c74783c59eec1fa8ba09ba2c18e767ef8356e2eea6cd800bce5907d231b",
  "version": "2"
}
 */
func TestVerifier_VerifySmartContractWallet(t *testing.T) {
	addressHex := "0x77f7111B2b211BC504dE66b13F3A8a04cD182842"
	message := "Follow Niftytown.com!"
	signature := "051912aa60d32687c0e9dc37d335b1bb226c24a31fca40a23cce11e8b417bee11ca668ead2e901ab276eea194e70c4eec71908f10fecc1390f187fb56d7ce2c81bd17faa5de3424c79cfc2dc8b0b074229efedc40cbeac8c835a373589b0b122277bae737503b29ceedf735ab2148523854be4818bb66c13a0b3f28349357678801c"
	hash := crypto.Keccak256Hash([]byte(message))

	ethClient, err := ethclient.Dial(infura)
	if err != nil {
		panic(err)
	}

	myVerifier := NewVerifier(ethClient)
	result, err := myVerifier.VerifySmartContractWallet(addressHex, hash, []byte(signature))

	assert.NoError(t, err)
	assert.Equal(t, true, result)
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