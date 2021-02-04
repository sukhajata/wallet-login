//import keccak256 from 'keccak256';
import Web3, { providers } from 'web3'; 
import { isSmartContractWallet, verifySmartContractWallet, verifySignature } from './api';
import ethUtil from 'ethereumjs-util';
import sigUtil from 'eth-sig-util';

export const signInMetamask = async (successCallback, errorCallback) => {
  if (typeof window.ethereum === 'undefined') {
    errorCallback('Metamask is not installed');
    return;
  }

  if (window.ethereum.isMetaMask) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    //await requestSign(accounts[0], successCallback, errorCallback);
    const message = 'Hello, please sign this message!';
    const signature = await signTypedData(accounts, message);
    console.log(signature);
    //const signature = await requestSign(accounts[0], successCallback, errorCallback);
    const result = await verifySignature(message, signature, accounts[0]);
    console.log(result.valid);
    

  } else {
    throw 'Non metamask browser';
  }

}

  const handleAccountsChanged = (accounts) => {
    let currentAccount = null;

    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
      console.log(currentAccount);
      // Do any other work!
    }
  }

  const handleChainChanged = (_chainId) => {
    //console.log(_chainId);

    // reload the page
    window.location.reload();
  }

  const requestSign = async (address, onSuccess, onError) => {
    /*console.log('current provider', window.web3.currentProvider);
    const result = await window.ethereum.request({ 
      method: 'eth_sign',
      params: [address, 'Please sign'] 
    });
    alert('Thanks');
    console.log(result);*/
    var web3 = new Web3(
      window.web3.currentProvider//new providers.HttpProvider('https://mainnet.infura.io/v3/b0f6ca46883b4a409b757b1ac341133e')
    );
    
    const message = "Hi from Wallet Connect Example. Please sign this message to verify that you are the owner of this wallet.";
    const result = await window.ethereum.request({
      method: 'eth_sign',
      params: [address, message],
    });

    return result;
  }

  const signTypedData = async (accounts, msg) => {
    const chainId = 1;

    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Example Wallet Login',
        version: '1',
        chainId,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        sender: {
          name: 'Example Wallet Login',
          //wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        recipient: {
          //name: 'Bob',
          //wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: msg,
      },
    }

    try {
      const result = await window.ethereum.request({
        method: 'eth_signTypedData_v3',
        params: [accounts[0], JSON.stringify(typedData)],
      })
      return result;
    } catch (err) {
      console.error(err)
    }
  }
/*
  const requestSign = (address, onSuccess, onError) => {
    var web3 = new Web3(
      new providers.HttpProvider('https://mainnet.infura.io/v3/b0f6ca46883b4a409b757b1ac341133e')
    );

    var text = terms;
    var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'));
    // var msg = '0x1' // hexEncode(text)
    console.log(msg);
    var from = web3.eth.accounts[0];
    if (!from) return connect()
  
    console.log('CLICKED, SENDING PERSONAL SIGN REQ')
    var params = [msg, from]
    var method = 'personal_sign'
  
    web3.currentProvider.sendAsync({
      method,
      params,
      from,
    }, (err, result) => {
      if (err) {
        console.log(err);
        return onError(err.message);
      }
      if (result.error) {
        console.log(result.error);
        return onError(result.error);
      }
      console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))
  
      console.log('recovering...')
      const msgParams = { data: msg }
      msgParams.sig = result.result
      console.dir({ msgParams })
      const recovered = sigUtil.recoverPersonalSignature(msgParams)
      console.dir({ recovered })
  
      if (recovered === from ) {
        console.log('SigUtil Successfully verified signer as ' + from)
        window.alert('SigUtil Successfully verified signer as ' + from)
      } else {
        console.dir(recovered)
        console.log('SigUtil Failed to verify signer when comparing ' + recovered.result + ' to ' + from)
        console.log('Failed, comparing %s to %s', recovered, from)
      }

    });
  }
  */
  
  

  const connectMetamask = () => {
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  }