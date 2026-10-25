import { fireEvent, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { ApiError, useApi } from '../api.ts';
import { todayInPlatform } from '../dates.ts';
import { directClient, renderPage } from '../test-utils.tsx';
import Booking from './Booking.tsx';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

const tradesman = {
  id: 't1',
  name: 'Luis',
  middleName: null,
  lastName: 'Pérez',
  trades: ['plumber'],
  contractorId: null,
};
const slot = '2026-11-02T13:00:00.000Z';

describe('Booking', () => {
  const api = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
    api.mockImplementation((_method: string, path: string) => {
      if (path.startsWith('/tradesmen?')) return Promise.resolve([tradesman]);
      if (path.includes('/availability')) return Promise.resolve([slot]);
      return Promise.resolve({ id: 'k1', title: 'Pérdida en la canilla' });
    });
  });

  const book = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Plomero' }));
    fireEvent.click(await screen.findByRole('button', { name: /Luis Pérez/ }));
    fireEvent.click(await screen.findByRole('button', { name: '10:00' }));
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Pérdida en la canilla' } });
    fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Gotea la canilla de la cocina' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reservar' }));
  };

  it("books a free slot for the client's home and goes to their tasks", async () => {
    renderPage(<Booking />, { user: directClient });

    await book();

    expect(await screen.findByText('navigated')).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith('GET', '/tradesmen?trade=plumber');
    expect(api).toHaveBeenCalledWith('GET', `/tradesmen/t1/availability?date=${todayInPlatform()}`);
    expect(api).toHaveBeenCalledWith('POST', '/tasks', {
      tradesmanId: 't1',
      propertyId: 'p1',
      trade: 'plumber',
      title: 'Pérdida en la canilla',
      description: 'Gotea la canilla de la cocina',
      scheduledAt: slot,
    });
    expect(toast.success).toHaveBeenCalledWith('Reservaste el turno: Pérdida en la canilla.');
  });

  it('explains when the slot was taken in the meantime, and reloads the slots', async () => {
    api.mockImplementation((method: string, path: string) => {
      if (method === 'POST') return Promise.reject(new ApiError(409, 'The tradesman already has that slot taken'));
      return Promise.resolve(path.startsWith('/tradesmen?') ? [tradesman] : [slot]);
    });
    renderPage(<Booking />, { user: directClient });

    await book();

    expect(await screen.findByRole('alert')).toHaveTextContent('Ese turno ya no está disponible');
    expect(api.mock.calls.filter(([, path]) => String(path).includes('/availability'))).toHaveLength(2);
  });

  it('says when nobody works in that trade', async () => {
    api.mockResolvedValue([]);
    renderPage(<Booking />, { user: directClient });

    fireEvent.click(screen.getByRole('button', { name: 'Albañil' }));

    expect(await screen.findByText('No hay profesionales disponibles para ese oficio.')).toBeInTheDocument();
  });
});
