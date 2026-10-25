import { fireEvent, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { useApi } from '../api.ts';
import { renderPage, tradesman } from '../test-utils.tsx';
import Trades from './Trades.tsx';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

describe('Trades', () => {
  const api = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
  });

  it('replaces the trades', async () => {
    const updated = { ...tradesman, trades: ['plumber', 'mason'] };
    api.mockResolvedValue(updated);
    const setUser = vi.fn();
    renderPage(<Trades />, { user: tradesman, setUser });

    fireEvent.click(screen.getByLabelText('Albañil'));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar oficios' }));

    await waitFor(() => expect(setUser).toHaveBeenCalledWith(updated));
    expect(api).toHaveBeenCalledWith('PUT', '/me/trades', { trades: ['plumber', 'mason'] });
    expect(toast.success).toHaveBeenCalledWith('Oficios guardados.');
  });
});
