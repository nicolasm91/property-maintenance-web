import { useAuth0 } from '@auth0/auth0-react';
import AdminApp from './admin/AdminApp.tsx';
import { isPasswordAccount } from './admin/adminUser.ts';
import Home from './Home.tsx';

export default function App() {
  const { isLoading, isAuthenticated, user, error, loginWithRedirect, logout } = useAuth0();

  // Checked after useAuth0: the sign-in callback changes the path to /admin while App stays mounted.
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }

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

  // Platform owners never onboard: send them to their own view.
  if (isPasswordAccount(user?.sub)) {
    return (
      <main>
        <h1>Cuenta de administración</h1>
        <p>Esta cuenta es para el panel de administración.</p>
        <a href="/admin">Ir al panel</a>
        <button
          className="secondary"
          onClick={() => void logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          Salir
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
