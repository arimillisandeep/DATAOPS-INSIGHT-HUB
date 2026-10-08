import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// SPA routing fallback for GitHub Pages: deep links (e.g. /pipelines/3) are
// served 404.html, which stores the target path and redirects to the app
// entry. Restore it into the history API so React Router renders the page.
const restoredPath = sessionStorage.getItem('dih:redirect');
if (restoredPath) {
  sessionStorage.removeItem('dih:redirect');
  if (restoredPath !== window.location.pathname + window.location.search) {
    window.history.replaceState(null, '', restoredPath);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
