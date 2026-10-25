import { useAuth0 } from '@auth0/auth0-react';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router';
import { isPasswordAccount } from './admin/adminUser.ts';
import { ApiError, useApi } from './api.ts';
import FullScreen from './components/FullScreen.tsx';
import { Button } from './components/ui/button.tsx';
import { Skeleton } from './components/ui/skeleton.tsx';
import AppShell from './layout/AppShell.tsx';
import Booking from './pages/Booking.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Onboarding from './pages/Onboarding.tsx';
import Organization from './pages/Organization.tsx';
import Profile from './pages/Profile.tsx';
import SignIn from './pages/SignIn.tsx';
import Tasks from './pages/Tasks.tsx';
import Trades from './pages/Trades.tsx';
import { SessionContext } from './session.tsx';
import type { OnboardRequest, User } from './user.ts';

type State =
  | { status: 'loading' }
  | { status: 'onboarding' }
  | { status: 'ready'; user: User }
  | { status: 'error'; message: string };

export default function UserApp() {
  const { isLoading, isAuthenticated, user: account, logout } = useAuth0();
  const signOut = () => void logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) {
    return <Loading />;
  }
  if (!isAuthenticated) {
    return <SignIn />;
  }
  // Platform owners never onboard: send them to their own view.
  if (isPasswordAccount(account?.sub)) {
    return (
      <FullScreen>
        <ShieldCheck className="size-10 text-primary" />
        <h1 className="text-xl font-semibold">Cuenta de administración</h1>
        <p className="text-muted-foreground">Esta cuenta es para el panel de administración.</p>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin">Ir al panel</Link>
          </Button>
          <Button variant="outline" onClick={signOut}>
            Salir
          </Button>
        </div>
      </FullScreen>
    );
  }
  return <OnboardedApp signOut={signOut} />;
}

function OnboardedApp({ signOut }: { signOut: () => void }) {
  const { getAccessTokenSilently } = useAuth0();
  const api = useApi();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    api<User>('GET', '/me')
      .then((user) => setState({ status: 'ready', user }))
      .catch((error: unknown) =>
        setState(
          error instanceof ApiError && error.status === 404
            ? { status: 'onboarding' }
            : { status: 'error', message: error instanceof Error ? error.message : 'Error inesperado' },
        ),
      );
  }, [api]);

  const onboard = async (request: OnboardRequest) => {
    const user = await api<User>('POST', '/me', request);
    // The current token has no profile claims yet: get a new one, which the
    // Post-Login Action fills from the profile the API just saved.
    await getAccessTokenSilently({ cacheMode: 'off' });
    setState({ status: 'ready', user });
    void navigate('/', { replace: true });
  };

  switch (state.status) {
    case 'loading':
      return <Loading />;
    case 'onboarding':
      return <Onboarding onSubmit={onboard} onSignOut={signOut} />;
    case 'error':
      return (
        <FullScreen>
          <p role="alert" className="text-destructive">
            No se pudo cargar tu perfil: {state.message}
          </p>
          <Button variant="outline" onClick={signOut}>
            Salir
          </Button>
        </FullScreen>
      );
    case 'ready': {
      const { user } = state;
      return (
        <SessionContext.Provider
          value={{ user, setUser: (next) => setState({ status: 'ready', user: next }), signOut }}
        >
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="perfil" element={<Profile />} />
              {user.role === 'directClient' && <Route path="reservar" element={<Booking />} />}
              {user.role === 'directClient' && <Route path="tareas" element={<Tasks />} />}
              {user.role === 'tradesman' && <Route path="agenda" element={<Tasks />} />}
              {user.role === 'tradesman' && <Route path="oficios" element={<Trades />} />}
              {user.role === 'propertyManager' && <Route path="administracion" element={<Organization />} />}
              {user.role === 'contractor' && <Route path="empresa" element={<Organization />} />}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </SessionContext.Provider>
      );
    }
  }
}

function Loading() {
  return (
    <FullScreen>
      <Skeleton className="size-12 rounded-xl" />
      <Skeleton className="h-4 w-40" />
      <span className="sr-only">Cargando…</span>
    </FullScreen>
  );
}
