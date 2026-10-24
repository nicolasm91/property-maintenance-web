import { fireEvent, render, screen } from '@testing-library/react';
import { useApi } from './api.ts';
import TradesEditor from './TradesEditor.tsx';

vi.mock('./api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

describe('TradesEditor', () => {
  const api = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
  });

  it('replaces the trades', async () => {
    const user = { id: 't1', role: 'tradesman', trades: ['plumber', 'mason'] };
    api.mockResolvedValue(user);
    const onSaved = vi.fn();
    render(<TradesEditor trades={['plumber']} onSaved={onSaved} />);

    fireEvent.click(screen.getByLabelText('Albañil'));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar oficios' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Oficios guardados.');
    expect(api).toHaveBeenCalledWith('PUT', '/me/trades', { trades: ['plumber', 'mason'] });
    expect(onSaved).toHaveBeenCalledWith(user);
  });
});
