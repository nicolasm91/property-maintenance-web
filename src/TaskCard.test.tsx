import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useApi } from './api.ts';
import TaskCard from './TaskCard.tsx';
import type { Task } from './tasks.ts';

vi.mock('./api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

const person = (id: string, name: string) => ({ id, name, middleName: null, lastName: 'García' });

const task: Task = {
  id: 'k1',
  title: 'Pérdida en la canilla',
  description: 'Gotea la canilla de la cocina',
  trade: 'plumber',
  status: 'assigned',
  scheduledAt: '2026-11-02T13:00:00.000Z',
  completedAt: null,
  cancelledAt: null,
  property: {
    id: 'p1',
    address: { street: 'Av. Corrientes', number: '1234', postalCode: 'C1043', intersection: 'Talcahuano' },
  },
  createdBy: person('c1', 'Ana'),
  tradesman: person('t1', 'Luis'),
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-01T12:00:00.000Z',
};

describe('TaskCard', () => {
  const api = vi.fn();
  const onChange = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
    api.mockResolvedValue({});
  });

  describe('for the tradesman', () => {
    it('shows who the client is and completes the task', async () => {
      render(<TaskCard task={task} role="tradesman" onChange={onChange} />);

      expect(screen.getByText('Cliente: Ana García')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Completar' }));

      await waitFor(() => expect(onChange).toHaveBeenCalled());
      expect(api).toHaveBeenCalledWith('POST', '/tasks/k1/complete');
    });

    it('rejects the task with an optional reason', async () => {
      render(<TaskCard task={task} role="tradesman" onChange={onChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }));
      fireEvent.change(screen.getByLabelText('Motivo (opcional)'), { target: { value: ' Queda lejos ' } });
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));

      await waitFor(() => expect(onChange).toHaveBeenCalled());
      expect(api).toHaveBeenCalledWith('POST', '/tasks/k1/reject', { reason: 'Queda lejos' });
    });

    it('rejects without a reason', async () => {
      render(<TaskCard task={task} role="tradesman" onChange={onChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }));
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));

      await waitFor(() => expect(api).toHaveBeenCalledWith('POST', '/tasks/k1/reject', {}));
    });

    it('has no actions on a completed task', () => {
      render(<TaskCard task={{ ...task, status: 'completed' }} role="tradesman" onChange={onChange} />);

      expect(screen.queryByRole('button', { name: 'Completar' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Rechazar' })).not.toBeInTheDocument();
    });
  });

  describe('for the direct client', () => {
    it('cancels the task with a reason', async () => {
      render(<TaskCard task={task} role="directClient" onChange={onChange} />);

      expect(screen.getByText('Profesional: Luis García')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Completar' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'Lo arreglé yo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }));

      await waitFor(() => expect(onChange).toHaveBeenCalled());
      expect(api).toHaveBeenCalledWith('POST', '/tasks/k1/cancel', { reason: 'Lo arreglé yo' });
    });

    it.each(['completed', 'cancelled', 'rejected'] as const)('cannot cancel a %s task', (status) => {
      render(<TaskCard task={{ ...task, status }} role="directClient" onChange={onChange} />);

      expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    });

    it('shows the API error', async () => {
      api.mockRejectedValue(new Error('Task k1 is completed'));
      render(<TaskCard task={task} role="directClient" onChange={onChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'Lo arreglé yo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Task k1 is completed');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('shows the history', async () => {
    api.mockResolvedValue([
      {
        id: 'e1',
        type: 'rejected',
        actor: person('t1', 'Luis'),
        tradesmanId: 't1',
        reason: 'Queda lejos',
        occurredAt: '2026-11-01T15:00:00.000Z',
      },
    ]);
    render(<TaskCard task={task} role="directClient" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ver historial' }));

    expect(await screen.findByRole('list', { name: 'Historial' })).toHaveTextContent(
      /Rechazada · .* · Luis García · Queda lejos/,
    );
    expect(api).toHaveBeenCalledWith('GET', '/tasks/k1/events');
  });
});
