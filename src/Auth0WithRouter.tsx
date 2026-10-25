import { Auth0Provider, type AppState } from '@auth0/auth0-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { config } from './config.ts';

// Inside the router, so the sign-in callback can navigate (e.g. back to /admin)
// with the router noticing; Auth0's default only rewrites the URL.
export default function Auth0WithRouter({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return (
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
      onRedirectCallback={(appState?: AppState) => void navigate(appState?.returnTo ?? '/', { replace: true })}
    >
      {children}
    </Auth0Provider>
  );
}
