import { useAuth0 } from '@auth0/auth0-react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ApiError, useApi } from './api.ts';
import { directClient, newManager, tradesman } from './test-utils.tsx';
import UserApp from './UserApp.tsx';

vi.mock('@auth0/auth0-react');
vi.mock('./api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

const auth0 = (state: Partial<ReturnType<typeof useAuth0>>) =>
  vi.mocked(useAuth0).mockReturnValue({
    isLoading: false,
    isAuthenticated: true,
    user: { sub: 'google-oauth2|1', email: 'ana@example.com' },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    getAccessTokenSilently: vi.fn(),
    ...state,
  } as unknown as ReturnType<typeof useAuth0>);

const renderApp = () =>
  render(
    <MemoryRouter>
      <UserApp />
    </MemoryRouter>,
  );

describe('UserApp', () => {
  const api = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
    api.mockImplementation((_method: string, path: string) => Promise.resolve(path === '/tasks' ? [] : directClient));
  });

  it('signs in with Google', () => {
    const loginWithRedirect = vi.fn();
    auth0({ isAuthenticated: false, loginWithRedirect });

    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar con Google' }));

    expect(loginWithRedirect).toHaveBeenCalledWith({ authorizationParams: { connection: 'google-oauth2' } });
  });

  it('opens on the home page, with the navigation of the profile type', async () => {
    auth0({});

    renderApp();

    expect(await screen.findByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument();
    const nav = screen.getAllByRole('list').find((list) => within(list).queryByText('Reservar'))!;
    expect(within(nav).getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Mis tareas' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Agenda' })).not.toBeInTheDocument();
  });

  it('shows a tradesman their own sections', async () => {
    auth0({});
    api.mockImplementation((_method: string, path: string) => Promise.resolve(path === '/tasks' ? [] : tradesman));

    renderApp();

    expect(await screen.findByRole('link', { name: 'Agenda' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mis oficios' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Reservar' })).not.toBeInTheDocument();
  });

  it('asks a new property manager to create their administration', async () => {
    auth0({});
    api.mockResolvedValue(newManager);

    renderApp();

    expect(await screen.findByText('Empezá creando tu administración')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear administración/ })).toHaveAttribute('href', '/administracion');
  });

  it('onboards a user without profile, refreshes their token, and opens the home page', async () => {
    const getAccessTokenSilently = vi.fn();
    auth0({ getAccessTokenSilently });
    api.mockImplementation((method: string, path: string) => {
      if (path === '/me' && method === 'GET') return Promise.reject(new ApiError(404, 'Onboarding not completed'));
      return Promise.resolve(path === '/tasks' ? [] : tradesman);
    });

    renderApp();
    fireEvent.click(await screen.findByLabelText('Profesional de oficio'));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'García' } });
    fireEvent.click(screen.getByLabelText('Plomero'));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith('POST', '/me', expect.objectContaining({ profileType: 'tradesman' }));
    expect(getAccessTokenSilently).toHaveBeenCalledWith({ cacheMode: 'off' });
  });

  it('sends a platform owner to the admin panel instead of onboarding', () => {
    auth0({ user: { sub: 'auth0|owner' } });

    renderApp();

    expect(screen.getByRole('link', { name: 'Ir al panel' })).toHaveAttribute('href', '/admin');
    expect(api).not.toHaveBeenCalled();
  });

  it('shows other errors', async () => {
    auth0({});
    api.mockRejectedValue(new ApiError(500, 'Internal server error'));

    renderApp();

    expect(await screen.findByRole('alert')).toHaveTextContent('Internal server error');
  });
});
