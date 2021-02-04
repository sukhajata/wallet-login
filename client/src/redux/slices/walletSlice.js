import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  address: '',
  error: '',
  name: '',
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState: initialState,
  reducers: {
    setAddress(state, action) {
      state.address = action.payload;
    },
    setConnected(state, action) {
      state.connected = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setName(state, action) {
      state.name = action.payload;
    },
  }
});

export const { 
  setAddress, 
  setConnected,
  setError,
  setName,
} = walletSlice.actions;

export default walletSlice.reducer;

