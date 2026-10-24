import { useAuth0 } from '@auth0/auth0-react';
import Home from './Home.tsx';

export default function App() {
  const { isLoading, isAuthenticated, error, loginWithRedirect, logout } = useAuth0();

  if (isLoading) {
    return (
      <main>
        <p>Cargando…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main>
        <h1>Property Maintenance</h1>
        {error && <p role="alert">No se pudo iniciar sesión: {error.message}</p>}
        <button onClick={() => void loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })}>
          Ingresar con Google
        </button>
      </main>
    );
  }

  return (
    <main>
      <Home />
      <button className="secondary" onClick={() => void logout({ logoutParams: { returnTo: window.location.origin } })}>
        Salir
      </button>
    </main>
  );
}
