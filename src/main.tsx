import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CcApp from './cc/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CcApp />
  </StrictMode>,
);
