import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import './styles/authpage.scss';
import './styles/homepage.scss';
import './styles/postpage.scss';
import './styles/likeanimation.scss';
import './styles/modifypostpage.scss';
import './styles/newpostpage.scss';
import './styles/comments.scss';

import App from './components/Homepage/App.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

