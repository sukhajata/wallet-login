import { combineReducers } from 'redux';

import walletReducer from '../slices/walletSlice';

export default combineReducers({
  wallet: walletReducer,
});