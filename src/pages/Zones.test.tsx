import { fireEvent, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { useApi } from '../api.ts';
import { catalogResponse, comuna1, renderPage, tradesman } from '../test-utils.tsx';
import Zones from './Zones.tsx';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

describe('Zones', () => {
  const api = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
  });

  it('adds and removes localities, then saves the service area', async () => {
    const updated = { ...tradesman };
    api.mockImplementation((method: string, path: string) =>
      Promise.resolve(method === 'PUT' ? updated : catalogResponse(path)),
    );
    const setUser = vi.fn();
    renderPage(<Zones />, { user: tradesman, setUser });

    expect(screen.getByText('Comuna 1, Ciudad Autónoma de Buenos Aires')).toBeInTheDocument();
    await screen.findByRole('option', { name: 'Buenos Aires' });
    fireEvent.change(screen.getByLabelText('Provincia'), { target: { value: '02' } });
    fireEvent.change(await screen.findByLabelText('Buscar localidad'), { target: { value: 'comuna 2' } });
    expect(screen.queryByLabelText('Comuna 1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Comuna 2'));
    fireEvent.click(screen.getByRole('button', { name: `Quitar ${comuna1.name}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar zonas' }));

    await waitFor(() => expect(setUser).toHaveBeenCalledWith(updated));
    expect(api).toHaveBeenCalledWith('PUT', '/me/municipalities', { municipalityIds: ['022014'] });
    expect(toast.success).toHaveBeenCalledWith('Zonas guardadas.');
  });
});
