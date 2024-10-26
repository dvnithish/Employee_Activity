import React from 'react';
import ReactDOM from 'react-dom';
import Router from './Router';
import './index.css'; // Import the context provider


ReactDOM.render(
  
  <React.StrictMode>
      <Router />
  </React.StrictMode>,
  document.getElementById('root')
);
