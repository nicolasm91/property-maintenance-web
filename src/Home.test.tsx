import { useAuth0 } from '@auth0/auth0-react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ApiError, useApi } from './api.ts';
import Home from './Home.tsx';
import type { User } from './user.ts';

vi.mock('@auth0/auth0-react');
vi.mock('./api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

const user: User = {
  id: 'u1',
  email: 'ana@example.com',
  name: 'Ana',
  middleName: null,
  lastName: 'García',
  role: 'directClient',
};

describe('Home', () => {
  const api = vi.fn();
  const getAccessTokenSilently = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
    vi.mocked(useAuth0).mockReturnValue({ getAccessTokenSilently } as unknown as ReturnType<typeof useAuth0>);
  });

  it('shows the profile of an onboarded user', async () => {
    api.mockResolvedValue(user);

    render(<Home />);

    expect(await screen.findByRole('heading', { name: 'Hola, Ana García' })).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith('GET', '/me');
  });

  it('onboards a user without profile and refreshes their token', async () => {
    api.mockRejectedValueOnce(new ApiError(404, 'Onboarding not completed')).mockResolvedValueOnce(user);

    render(<Home />);
    fireEvent.click(await screen.findByLabelText('Particular'));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'García' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByRole('heading', { name: 'Hola, Ana García' })).toBeInTheDocument();
    expect(api).toHaveBeenLastCalledWith('POST', '/me', expect.objectContaining({ profileType: 'directClient' }));
    expect(getAccessTokenSilently).toHaveBeenCalledWith({ cacheMode: 'off' });
  });

  it('shows other errors', async () => {
    api.mockRejectedValue(new ApiError(500, 'Internal server error'));

    render(<Home />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Internal server error');
  });
});
