import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.tsx';
import Auth0WithRouter from './Auth0WithRouter.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0WithRouter>
        <App />
        <Toaster position="top-right" richColors />
      </Auth0WithRouter>
    </BrowserRouter>
  </StrictMode>,
);
