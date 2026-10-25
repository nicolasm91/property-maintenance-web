import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { toast } from 'sonner';
import { ApiError, useApi } from '../api.ts';
import { addDays, firstBookableDay } from '../dates.ts';
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
  ratingAverage: 4.5,
  ratingCount: 12,
};
const slot = '2026-11-02T13:00:00.000Z';

describe('Booking', () => {
  const api = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
    api.mockImplementation((_method: string, path: string) => {
      if (path.startsWith('/tradesmen?')) return Promise.resolve({ items: [tradesman], nextCursor: null });
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
    expect(api).toHaveBeenCalledWith('GET', '/tradesmen?trade=plumber&municipalityId=022007');
    expect(api).toHaveBeenCalledWith('GET', `/tradesmen/t1/availability?date=${firstBookableDay()}`);
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
      return Promise.resolve(path.startsWith('/tradesmen?') ? { items: [tradesman], nextCursor: null } : [slot]);
    });
    renderPage(<Booking />, { user: directClient });

    await book();

    expect(await screen.findByRole('alert')).toHaveTextContent('Ese turno ya no está disponible');
    expect(api.mock.calls.filter(([, path]) => String(path).includes('/availability'))).toHaveLength(2);
  });

  it('opens on the first day a slot can still start, and books on another day', async () => {
    renderPage(<Booking />, { user: directClient });

    fireEvent.click(screen.getByRole('button', { name: 'Plomero' }));
    fireEvent.click(await screen.findByRole('button', { name: /Luis Pérez/ }));
    const days = within(screen.getByRole('group', { name: 'Día' })).getAllByRole('button');
    expect(days).toHaveLength(14);
    expect(days[0]).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(days[2]);

    await waitFor(() =>
      expect(api).toHaveBeenCalledWith('GET', `/tradesmen/t1/availability?date=${addDays(firstBookableDay(), 2)}`),
    );
  });

  it('shows ratings and loads more tradesmen page by page', async () => {
    const second = { ...tradesman, id: 't2', name: 'Juan', lastName: 'López', ratingAverage: null, ratingCount: 0 };
    api.mockImplementation((_method: string, path: string) =>
      Promise.resolve(
        path.includes('cursor=')
          ? { items: [second], nextCursor: null }
          : { items: [tradesman], nextCursor: 'next page' },
      ),
    );
    renderPage(<Booking />, { user: directClient });

    fireEvent.click(screen.getByRole('button', { name: 'Plomero' }));
    expect(await screen.findByLabelText('4.5 de 5, 12 calificaciones')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver más profesionales' }));

    expect(await screen.findByRole('button', { name: /Juan López/ })).toHaveTextContent('Nuevo');
    expect(api).toHaveBeenCalledWith('GET', '/tradesmen?trade=plumber&municipalityId=022007&cursor=next%20page');
    expect(screen.queryByRole('button', { name: 'Ver más profesionales' })).not.toBeInTheDocument();
  });

  it('says when nobody of that trade works in the locality', async () => {
    api.mockResolvedValue({ items: [], nextCursor: null });
    renderPage(<Booking />, { user: directClient });

    fireEvent.click(screen.getByRole('button', { name: 'Albañil' }));

    expect(
      await screen.findByText('No hay profesionales de ese oficio que trabajen en tu localidad.'),
    ).toBeInTheDocument();
  });

  it("can't search for a home without locality", () => {
    renderPage(<Booking />, {
      user: { ...directClient, homes: [{ ...directClient.homes[0], municipality: null }] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Plomero' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Tu casa no tiene localidad cargada');
    expect(api).not.toHaveBeenCalled();
  });
});
