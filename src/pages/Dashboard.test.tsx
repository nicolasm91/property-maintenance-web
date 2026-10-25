import { screen } from '@testing-library/react';
import { useApi } from '../api.ts';
import { renderPage, tradesman } from '../test-utils.tsx';
import Dashboard from './Dashboard.tsx';

vi.mock('../api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

const person = { id: 'c1', name: 'Ana', middleName: null, lastName: 'García' };
const address = { street: 'Av. Corrientes', number: '1234', postalCode: 'C1043', intersection: 'Talcahuano' };
const taskOn = (id: string, scheduledAt: string, status: string) => ({
  id,
  title: `Trabajo ${id}`,
  description: '',
  trade: 'plumber',
  status,
  scheduledAt,
  completedAt: null,
  cancelledAt: null,
  property: { id: 'p1', address },
  createdBy: person,
  tradesman: null,
  createdAt: scheduledAt,
  updatedAt: scheduledAt,
});

describe('Dashboard', () => {
  const api = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
  });

  it("summarizes a tradesman's upcoming and completed work", async () => {
    const future = new Date(Date.now() + 7 * 24 * 3_600_000).toISOString();
    const past = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString();
    api.mockResolvedValue([taskOn('1', future, 'assigned'), taskOn('2', past, 'completed')]);

    renderPage(<Dashboard />, { user: tradesman });

    expect(await screen.findByText('Trabajo 1')).toBeInTheDocument();
    expect(screen.queryByText('Trabajo 2')).not.toBeInTheDocument();
    expect(screen.getByText('Próximas').closest('[data-slot=card]')).toHaveTextContent('1');
    expect(screen.getByText('Completadas').closest('[data-slot=card]')).toHaveTextContent('1');
  });

  it('asks a tradesman without trades to choose them', async () => {
    api.mockResolvedValue([]);

    renderPage(<Dashboard />, { user: { ...tradesman, trades: [] } });

    expect(await screen.findByText('Nada agendado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Configuralos' })).toHaveAttribute('href', '/oficios');
  });
});
