import { fireEvent, render, screen } from '@testing-library/react';
import { ApiError, useApi } from './api.ts';
import Booking from './Booking.tsx';
import { todayInPlatform } from './dates.ts';
import type { Home } from './user.ts';

vi.mock('./api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

const homes: Home[] = [
  { id: 'p1', address: { street: 'Av. Corrientes', number: '1234', postalCode: 'C1043', intersection: 'Talcahuano' } },
];
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

  const chooseSlot = async () => {
    fireEvent.change(screen.getByLabelText('Oficio'), { target: { value: 'plumber' } });
    fireEvent.change(await screen.findByLabelText('Profesional'), { target: { value: 't1' } });
    fireEvent.click(await screen.findByLabelText('10:00'));
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Pérdida en la canilla' } });
    fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Gotea la canilla de la cocina' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reservar' }));
  };

  it("books a free slot of a tradesman for the client's home", async () => {
    const onBooked = vi.fn();
    render(<Booking homes={homes} onBooked={onBooked} />);

    await chooseSlot();

    expect(await screen.findByRole('status')).toHaveTextContent('reservaste el turno');
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
    expect(onBooked).toHaveBeenCalled();
  });

  it('explains when the slot was taken in the meantime', async () => {
    const onBooked = vi.fn();
    api.mockImplementation((method: string, path: string) => {
      if (method === 'POST') return Promise.reject(new ApiError(409, 'The tradesman already has that slot taken'));
      return Promise.resolve(path.startsWith('/tradesmen?') ? [tradesman] : [slot]);
    });
    render(<Booking homes={homes} onBooked={onBooked} />);

    await chooseSlot();

    expect(await screen.findByRole('alert')).toHaveTextContent('Ese turno ya no está disponible');
    expect(onBooked).not.toHaveBeenCalled();
  });

  it('says when nobody works in that trade', async () => {
    api.mockResolvedValue([]);
    render(<Booking homes={homes} onBooked={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Oficio'), { target: { value: 'mason' } });

    expect(await screen.findByText('No hay profesionales disponibles para ese oficio.')).toBeInTheDocument();
  });
});
