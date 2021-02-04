import SmartWalletUtils from '@argent/smartwallet-utils';

const Check = () => {
  const hexMessage = web3.eth.accounts.hashMessage(message);
  
  const swu = new SmartWalletUtils(web3Provider, address);
  const walletHelper = await swu.getWalletHelper();
  
  // Check if a message signature is valid
  
  const isValid = await walletHelper.isValidSignature(hexMessage, signature);
  
}
