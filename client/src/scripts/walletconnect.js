import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3, { providers } from 'web3'; 
import { isSmartContractWallet, verifySmartContractWallet, verifySignature } from './api';
import { SmartWalletUtils } from '@argent/smartwallet-utils';

const provider = new WalletConnectProvider({
  infuraId: "b0f6ca46883b4a409b757b1ac341133e", //"27e484dcd9e3efcfd25a83a78777cdf1",
});

const web3 = new Web3(
  provider//new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/b0f6ca46883b4a409b757b1ac341133e")
);

export const connectWithWalletConnect = async (successCallback, errorCallback) => {
  //  Create WalletConnect Provider

  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    requestSign(accounts[0], successCallback, errorCallback);
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    console.log(chainId);
  });

  // Subscribe to session disconnection
  provider.on("disconnect", (code, reason) => {
    console.log(code, reason);
  });

  //  Enable session (triggers QR Code modal)
  try {
    const result = await provider.enable();
    console.log(result);

  } catch (err) {
    errorCallback(err);
  }
  /*
  const result = provider
    .enable()
    .then(accounts => {
      onConnectAccount(accounts[0]);
      handleAccountsChanged(accounts[0]);
    })
    .catch(err => onError(err));*/
  
}

export const requestSign = async (address, successCallback, errorCallback) => {
  try {

    console.log(web3);
    const message = "Hi from Wallet Login Example. Please sign this message so we can verify that you are the owner of this wallet";
    //const messageHash = utils.sha3(message);
    const signature = await web3.eth.personal.sign(message, address);
    console.log(signature);

    /*
    const signature = await web3.eth.sign(message, accounts[0]);
    console.log('signature', signature);
    console.log('signature length', signature.length);*/
  
    let result = await verifySignature(message, signature, address);
    console.log('verify signature', result);

    let argentResult = await checkArgentSignature(address, message, signature);
    console.log('Argent check', argentResult);
    //const hash = web3.eth.accounts.hashMessage(message);
    
    /*result = await isSmartContractWallet(accounts[0]);
    if (result.isSmartContract) {
      result = await verifySmartContractWallet(accounts[0], hash, signature);
    }*/

    successCallback(address, result);

  } catch(err) {
    errorCallback(err);
  }

}

const checkArgentSignature = async (address, message, signature) => {
  const hexMessage = web3.eth.accounts.hashMessage(message);
  
  const swu = new SmartWalletUtils(provider, address);
  const walletHelper = await swu.getWalletHelper();

  const isValid = await walletHelper.isValidSignature(hexMessage, signature);
  return isValid;
}

export const logout = async () => {
  await provider.disconnect();
}
