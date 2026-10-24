import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { ApiError, useApi } from './api.ts';
import Onboarding from './Onboarding.tsx';
import Profile from './Profile.tsx';
import type { OnboardRequest, User } from './user.ts';

type State =
  | { status: 'loading' }
  | { status: 'onboarding' }
  | { status: 'ready'; user: User }
  | { status: 'error'; message: string };

export default function Home() {
  const { getAccessTokenSilently } = useAuth0();
  const api = useApi();
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
  };

  switch (state.status) {
    case 'loading':
      return <p>Cargando…</p>;
    case 'onboarding':
      return <Onboarding onSubmit={onboard} />;
    case 'ready':
      return <Profile user={state.user} />;
    case 'error':
      return <p role="alert">No se pudo cargar tu perfil: {state.message}</p>;
  }
}
