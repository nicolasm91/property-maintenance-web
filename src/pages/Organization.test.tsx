import { useAuth0 } from '@auth0/auth0-react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { useApi } from '../api.ts';
import { newContractor, newManager, renderPage } from '../test-utils.tsx';
import Organization from './Organization.tsx';

vi.mock('@auth0/auth0-react');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

describe('Organization', () => {
  const api = vi.fn();
  const getAccessTokenSilently = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
    vi.mocked(useAuth0).mockReturnValue({ getAccessTokenSilently } as unknown as ReturnType<typeof useAuth0>);
  });

  it('creates the administration, then refreshes the token that carries it', async () => {
    const created = { ...newManager, administration: { id: 'a1', name: 'Admin Ana' }, administrationRole: 'admin' };
    api.mockResolvedValue(created);
    const setUser = vi.fn();
    renderPage(<Organization />, { user: newManager, setUser });

    fireEvent.change(screen.getByLabelText('Nombre de la administración'), { target: { value: ' Admin Ana ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear administración' }));

    await waitFor(() => expect(setUser).toHaveBeenCalledWith(created));
    expect(api).toHaveBeenCalledWith('POST', '/me/administration', { name: 'Admin Ana' });
    expect(getAccessTokenSilently).toHaveBeenCalledWith({ cacheMode: 'off' });
    expect(toast.success).toHaveBeenCalledWith('Creaste Admin Ana.');
  });

  it("creates a contractor's Company without refreshing the token", async () => {
    api.mockResolvedValue({ ...newContractor, company: { id: 'k1', name: 'Sosa SRL' } });
    const setUser = vi.fn();
    renderPage(<Organization />, { user: newContractor, setUser });

    fireEvent.change(screen.getByLabelText('Nombre de la empresa'), { target: { value: 'Sosa SRL' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear empresa' }));

    await waitFor(() => expect(setUser).toHaveBeenCalled());
    expect(api).toHaveBeenCalledWith('POST', '/me/company', { name: 'Sosa SRL' });
    expect(getAccessTokenSilently).not.toHaveBeenCalled();
  });

  it('shows an existing administration', () => {
    renderPage(<Organization />, {
      user: { ...newManager, administration: { id: 'a1', name: 'Admin Ana' }, administrationRole: 'admin' },
    });

    expect(screen.getAllByText('Admin Ana').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Crear administración' })).not.toBeInTheDocument();
  });

  it('shows why it could not be created', async () => {
    api.mockRejectedValue(new Error('This property manager already has an administration'));
    renderPage(<Organization />, { user: newManager });

    fireEvent.change(screen.getByLabelText('Nombre de la administración'), { target: { value: 'Admin Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear administración' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('already has an administration');
  });
});
