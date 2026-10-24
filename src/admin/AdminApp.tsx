import { useAuth0 } from '@auth0/auth0-react';
import AdminUsers from './AdminUsers.tsx';
import { isPasswordAccount, PASSWORD_CONNECTION } from './adminUser.ts';
import './admin.css';

export default function AdminApp() {
  const { isLoading, isAuthenticated, user, error, loginWithRedirect, logout } = useAuth0();
  const signOut = () => void logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) {
    return (
      <main className="admin-gate">
        <p>Cargando…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="admin-gate">
        <div className="admin-card">
          <span className="admin-badge">Superadmin</span>
          <h1>Panel de administración</h1>
          <p>Ingresá con tu usuario y contraseña de administración.</p>
          {error && <p role="alert">No se pudo iniciar sesión: {error.message}</p>}
          <button
            onClick={() =>
              void loginWithRedirect({
                authorizationParams: { connection: PASSWORD_CONNECTION },
                appState: { returnTo: '/admin' },
              })
            }
          >
            Ingresar con usuario y contraseña
          </button>
        </div>
      </main>
    );
  }

  if (!isPasswordAccount(user?.sub)) {
    return (
      <main className="admin-gate">
        <div className="admin-card">
          <h1>Panel de administración</h1>
          <p role="alert">
            Entraste con Google ({user?.email}). El panel solo acepta cuentas de administración con usuario y
            contraseña.
          </p>
          <button onClick={signOut}>Salir</button>
        </div>
      </main>
    );
  }

  return <AdminUsers email={user?.email ?? user?.name ?? ''} onSignOut={signOut} />;
}
