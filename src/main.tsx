import { Auth0Provider } from '@auth0/auth0-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { config } from './config.ts';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={config.auth0Domain}
      clientId={config.auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: config.auth0Audience,
      }}
      // Keeps the session across page reloads; the in-memory default would log
      // the user out on every refresh.
      cacheLocation="localstorage"
      useRefreshTokens
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
);
