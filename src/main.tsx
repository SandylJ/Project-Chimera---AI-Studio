import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CcApp from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Safety: unregister any stale service workers / caches from earlier builds.
// (In dev there shouldn't be any, but defensively clean.)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  }).catch(() => {});
}
if ('caches' in window) {
  caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
}

// Expose a console helper: in DevTools type __resetGame() to wipe save + reload.
(window as any).__resetGame = () => {
  try { localStorage.removeItem('cc_save_v1'); } catch {}
  location.reload();
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <CcApp />
    </ErrorBoundary>
  </StrictMode>,
);
