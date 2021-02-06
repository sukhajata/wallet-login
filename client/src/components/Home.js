import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Loading from './Loading';
import { useSelector, useDispatch } from 'react-redux';
import { setAddress, setConnected, setError } from '../redux/slices/walletSlice';
import { signInMetamask } from '../scripts/metamask';
import { connectWithWalletConnect } from '../scripts/walletconnect';
import metamaskfox from '../metamask-fox.svg';
import walletconnectlogo from '../wallet-connect.png';

const Home = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loginDisabled, setLoginDisabled] = useState(false);
  const connected = useSelector(state => state.wallet.connected);
  const address = useSelector(state => state.wallet.address);
  const error = useSelector(state => state.wallet.error);
  
  useEffect(() => {
    if (connected || error) {
      setModalOpen(false);
    }
  }, [connected, error]);

  const closeModal = () => {
    setModalOpen(false);
  }

  const handleLoginClick = () => {
    setLoginDisabled(true);
    setModalOpen(true);
  }

  const onConnectMetaMaskClick = async () => {
    setLoading(true);
    await signInMetamask(onSuccess, onError);
  }

  const onConnectWalletConnectClick = async () => {
    setLoading(true);
    connectWithWalletConnect(onSuccess, onError);
  }

  const onSuccess = (account) => {
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

  /*const handleLogoutClick = async () => {
    //await logout();
    dispatch(setConnected(false));
    dispatch(setAddress(''));
    dispatch(setName(''));
  }*/

  const modalBody = (
    <Paper style={{ position: 'absolute', top: 100, left: 100, padding: 50, width: 500, height: 100 }}>
    {loading ? (
      <Loading />
    ):(
      <>
        <Typography variant="h5" style={{ marginBottom: 20 }}>Select wallet</Typography>
        <Grid container direction="row" spacing={1} alignItems="center">
          <Grid item onClick={onConnectMetaMaskClick}>
            <img style={{ height: 50 }}  src={metamaskfox} alt="metamask"/>
          </Grid>
          <Grid item onClick={onConnectMetaMaskClick}>
            <Typography variant="h5" style={{ marginRight: 30 }}>MetaMask</Typography>
          </Grid>
          <Grid item onClick={onConnectWalletConnectClick}>
            <img style={{ height: 50 }} src={walletconnectlogo} alt="wallet connect"/>
          </Grid>
          <Grid item onClick={onConnectWalletConnectClick}>
            <Typography variant="h5">WalletConnect</Typography>
          </Grid>
        </Grid>
      </>
    )}
  </Paper>
  );

  return (
    <div style={{ padding: 30 }}>
      <Button 
        variant="contained" 
        color="primary" 
        disabled={loginDisabled}
        style={{ padding: 10 }} 
        onClick={handleLoginClick}
        >
          Login
      </Button>
      {error && <Typography style={{ paddingTop: 20 }}>{error}</Typography>}
      {address &&
        <Typography style={{ paddingTop: 20 }}>Connected to address {address}</Typography>
      }
      <Modal
        open={modalOpen}
        onClose={closeModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {modalBody}
      </Modal>
    </div>
  );
}

export default Home;
