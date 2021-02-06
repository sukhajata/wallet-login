import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import WalletSelector from './WalletSelector';
//import { logout } from '../scripts/walletconnect';
import { useSelector, useDispatch } from 'react-redux';
import { setAddress, setConnected, setError, setName } from '../redux/slices/walletSlice';

const Home = () => {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [loginDisabled, setLoginDisabled] = useState(false);
  const connected = useSelector(state => state.wallet.connected);
  const address = useSelector(state => state.wallet.address);
  const error = useSelector(state => state.wallet.error);
  const name = useSelector(state => state.wallet.name);
  
  useEffect(() => {
    if (connected || error) {
      setModalOpen(false);
    }
  }, [connected, error]);

  const handleClose = () => {
    setModalOpen(false);
  }

  const handleLoginClick = () => {
    setLoginDisabled(true);
    setModalOpen(true);
  }

  const handleLogoutClick = async () => {
    //await logout();
    dispatch(setConnected(false));
    dispatch(setAddress(''));
    dispatch(setName(''));
  }

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
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <WalletSelector closeModal={handleClose}/>
      </Modal>
    </div>
  );
}

export default Home;
