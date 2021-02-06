import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3'; 
import { isSmartContractWallet, verifySmartContractWallet, verifySignature } from './api';

const provider = new WalletConnectProvider({
  infuraId: "b0f6ca46883b4a409b757b1ac341133e", //"27e484dcd9e3efcfd25a83a78777cdf1",
});

const web3 = new Web3(
  provider
);

export const connectWithWalletConnect = async (successCallback, errorCallback) => {
  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    console.log(accounts);
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
    //await provider.disconnect();
    let result = await provider.enable();
    console.log(result);

  } catch (err) {
    errorCallback(err);
  }
  
}

export const requestSign = async (address, successCallback, errorCallback) => {
  try {

    console.log(web3);
    const message = "Hi from Wallet Login Example. Please sign this message so we can verify that you are the owner of this wallet";
    const signature = await web3.eth.personal.sign(message, address);
    console.log(signature);

    let isSmartContract = await isSmartContractWallet(address);
    let valid;
    if (isSmartContract) {
      valid = await verifySmartContractWallet(address, message, signature);
    } else {
      valid = await verifySignature(message, signature, address);
    }

    console.log(valid);
    if (valid) {
      successCallback(address);
    } else {
      errorCallback('Failed to verify signature');
    }


  } catch(err) {
    errorCallback(err);
  }

}


export const logout = async () => {
  await provider.disconnect();
}
