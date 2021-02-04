import React, { useState } from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import Home from './components/Home';

const App = () => {

  return (
    <Provider store={store}>
      <Home/>
    </Provider>
  );
}

export default App;
