import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import metamaskfox from '../metamask-fox.svg';
import walletconnectlogo from '../wallet-connect.png';
import { useSelector, useDispatch } from 'react-redux';
import { signInMetamask } from '../scripts/metamask';
import { connectWithWalletConnect } from '../scripts/walletconnect';
import { setAddress, setConnected, setError, setName } from '../redux/slices/walletSlice';
import Loading from './Loading';

const WalletSelector = ({ closeModal }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onConnectMetaMaskClick = async () => {
    setLoading(true);
    await signInMetamask(onSuccess, onError);
  }

  const onConnectWalletConnectClick = async () => {
    setLoading(true);
    connectWithWalletConnect(onSuccess, onError);
  }

  const onSuccess = (account, result) => {
    setLoading(false);
    dispatch(setAddress(account));
    dispatch(setConnected(true));
    closeModal();
  }

  const onError = err => {
    console.log(err);
    setLoading(false);
    dispatch(setError(err.toString()));
    closeModal();
  }

  return (
    <Paper style={{ position: 'absolute', top: 100, left: 100, padding: 50, width: 500, height: 100 }}>
      {loading ? (
        <Loading />
      ):(
        <>
          <Typography variant="h5" style={{ marginBottom: 20 }}>Select wallet</Typography>
          <Grid container direction="row" spacing={1} alignItems="center">
            <Grid item onClick={onConnectMetaMaskClick}>
              <img style={{ height: 50 }}  src={metamaskfox}/>
            </Grid>
            <Grid item onClick={onConnectMetaMaskClick}>
              <Typography variant="h5" style={{ marginRight: 30 }}>MetaMask</Typography>
            </Grid>
            <Grid item onClick={onConnectWalletConnectClick}>
              <img style={{ height: 50 }} src={walletconnectlogo}/>
            </Grid>
            <Grid item onClick={onConnectWalletConnectClick}>
              <Typography variant="h5">WalletConnect</Typography>
            </Grid>
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default WalletSelector;