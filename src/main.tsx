import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CcApp from './cc/App';
import { ErrorBoundary } from './cc/components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <CcApp />
    </ErrorBoundary>
  </StrictMode>,
);
