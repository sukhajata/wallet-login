import axios from 'axios';

const api = "http://localhost:5000";

const getOptions = () => {
    return {
        headers: {
            accept: "application/json",
        }
    };
};

export const verifySignature = async (message, signature, address) => {
  const url = `${api}/verify-signature`;
  const data = {
    signature,
    message,
    address
  }
  const response = await axios.post(url, data, getOptions());
  return response.data;
}

export const isSmartContractWallet = async (address) => {
  const url = `${api}/is-smart-contract`;
  const data = {
    address,
  }
  const response = await axios.post(url, data, getOptions());
  return response.data;
};

export const verifySmartContractWallet = async (address, hash, signature) => {
  const url = `${api}/verify-smart-contract`;
  const data = {
    address,
    hash,
    signature
  }
  const response = await axios.post(url, data, getOptions());
  return response.data;
};