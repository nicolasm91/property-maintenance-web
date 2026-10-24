import { useAuth0 } from '@auth0/auth0-react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App.tsx';

vi.mock('@auth0/auth0-react');
vi.mock('./Home.tsx', () => ({ default: () => <p>home</p> }));

const auth0 = (state: Partial<ReturnType<typeof useAuth0>>) =>
  vi.mocked(useAuth0).mockReturnValue({
    isLoading: false,
    isAuthenticated: false,
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    ...state,
  } as unknown as ReturnType<typeof useAuth0>);

describe('App', () => {
  it('signs in with Google', () => {
    const loginWithRedirect = vi.fn();
    auth0({ loginWithRedirect });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar con Google' }));

    expect(loginWithRedirect).toHaveBeenCalledWith({ authorizationParams: { connection: 'google-oauth2' } });
  });

  it('shows the home page and logout once signed in', () => {
    auth0({ isAuthenticated: true });

    render(<App />);

    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
  });

  it('shows sign-in errors', () => {
    auth0({ error: new Error('access_denied') });

    render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent('access_denied');
  });
});
