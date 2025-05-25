import './index.css';
import './buttons.css';
import './inputs.css';

import { HashRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppWrapper from './AppWrapper';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <HashRouter >
    <AppWrapper />
  </HashRouter>
  // </StrictMode>,
);
