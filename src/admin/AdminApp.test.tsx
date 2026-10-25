import { useAuth0 } from '@auth0/auth0-react';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminApp from './AdminApp.tsx';

vi.mock('@auth0/auth0-react');
vi.mock('./AdminUsers.tsx', () => ({ default: ({ email }: { email: string }) => <p>users of {email}</p> }));

const auth0 = (state: Partial<ReturnType<typeof useAuth0>>) =>
  vi.mocked(useAuth0).mockReturnValue({
    isLoading: false,
    isAuthenticated: false,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    ...state,
  } as unknown as ReturnType<typeof useAuth0>);

describe('AdminApp', () => {
  it('signs in with username and password, coming back to /admin', () => {
    const loginWithRedirect = vi.fn();
    auth0({ loginWithRedirect });

    render(<AdminApp />);
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar con usuario y contraseña' }));

    expect(loginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: { connection: 'Username-Password-Authentication' },
      appState: { returnTo: '/admin' },
    });
  });

  it('shows the users to a password account', () => {
    auth0({ isAuthenticated: true, user: { sub: 'auth0|owner', email: 'owner@example.com' } });

    render(<AdminApp />);

    expect(screen.getByText('users of owner@example.com')).toBeInTheDocument();
  });

  it('turns away a Google account', () => {
    auth0({ isAuthenticated: true, user: { sub: 'google-oauth2|1', email: 'ana@example.com' } });

    render(<AdminApp />);

    expect(screen.getByRole('alert')).toHaveTextContent('Entraste con Google');
    expect(screen.queryByText(/users of/)).not.toBeInTheDocument();
  });
});
