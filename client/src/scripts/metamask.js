import { isSmartContractWallet, verifySmartContractWallet, verifySignature } from './api';

export const signInMetamask = async (successCallback, errorCallback) => {
  if (typeof window.ethereum === 'undefined') {
    errorCallback('Metamask is not installed');
    return;
  }

  if (window.ethereum.isMetaMask) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      //console.log(accounts[0]);
      
      const message = "Hi from Wallet Connect Example. Please sign this message to verify that you are the owner of this wallet.";
      //const { signature, typedData } = await signTypedData(accounts[0], message);
      const signature = await requestSign(accounts[0], message);
      //console.log(signature);
  

      const isSmartContract = await isSmartContractWallet(accounts[0]);
      //console.log(isSmartContract);
      let valid;
      if (isSmartContract) {
        valid = await verifySmartContractWallet(accounts[0], message, signature);
      } else {
        valid = await verifySignature(message, signature, accounts[0]);
      }

      //console.log(valid);
      if (valid) {
        successCallback(accounts[0]);
      } else {
        errorCallback('Failed to verify signature');
      }

    } catch (err) {
      errorCallback(err.message);
    }

  } else {
    errorCallback('Metamask not available');
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

  const requestSign = async (address, message) => {    
    const result = await window.ethereum.request({
      method: 'personal_sign',
      params: [address, message],
    });

    return result;
  }

  const signTypedData = async (address, msg) => {
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
              { name: 'wallet', type: 'address' }
          ],
          Mail: [
              { name: 'from', type: 'Person' },
              { name: 'to', type: 'Person' },
              { name: 'contents', type: 'string' }
          ],
      },
      primaryType: 'Mail',
      domain: {
          name: 'Ether Mail',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
          from: {
              name: 'Cow',
              wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
              name: 'Bob',
              wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
      },
  };

  /*  const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Content: [
          { name: 'info', type: 'string' },
        ]
      },
      primaryType: 'EIP712Domain',
      domain: {
        name: 'Example Wallet Login',
        version: '1',
        chainId,
        verifyingContract: address,
      },
      message: {
        info: msg,
      }
    }*/

    const signature = await window.ethereum.request({
      method: 'eth_signTypedData_v3',
      params: [address, JSON.stringify(typedData)],
    });

    return { signature, typedData };
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