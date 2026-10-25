import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useApi } from '../api.ts';
import type { AdminUser } from './adminUser.ts';
import AdminUsers from './AdminUsers.tsx';

vi.mock('../api.ts', async (importOriginal) => ({ ...(await importOriginal<object>()), useApi: vi.fn() }));

const base = { middleName: null, organization: null, homes: 0, tasks: 0, createdAt: '2026-10-24T12:00:00.000Z' };
const users: AdminUser[] = [
  {
    ...base,
    id: 'u1',
    email: 'ana@example.com',
    name: 'Ana',
    lastName: 'García',
    role: 'directClient',
    homes: 1,
    tasks: 2,
  },
  { ...base, id: 'u2', email: 'luis@example.com', name: 'Luis', lastName: 'Pérez', role: 'tradesman', tasks: 2 },
  {
    ...base,
    id: 'u3',
    email: 'eva@example.com',
    name: 'Eva',
    lastName: 'Ruiz',
    role: 'propertyManager',
    organization: { id: 'a1', name: 'Ruiz Administraciones' },
  },
];

describe('AdminUsers', () => {
  const api = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useApi).mockReturnValue(api);
    api.mockImplementation((method: string) => Promise.resolve(method === 'GET' ? users : null));
  });

  const rows = () => within(screen.getByRole('list')).getAllByRole('listitem');

  it('lists every user with counts by profile type', async () => {
    render(<AdminUsers email="owner@example.com" onSignOut={vi.fn()} />);

    expect(await screen.findByText('Ana García')).toBeInTheDocument();
    expect(rows()).toHaveLength(3);
    expect(screen.getByText('Total').previousSibling).toHaveTextContent('3');
    expect(screen.getByText('Ruiz Administraciones')).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith('GET', '/admin/users');
  });

  it('filters by profile type and search', async () => {
    render(<AdminUsers email="owner@example.com" onSignOut={vi.fn()} />);
    await screen.findByText('Ana García');

    fireEvent.click(screen.getByRole('button', { name: 'Profesionales' }));
    expect(rows()).toHaveLength(1);
    expect(screen.getByText('Luis Pérez')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'ruiz adm' } });
    expect(rows()).toHaveLength(1);
    expect(screen.getByText('Eva Ruiz')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'nadie' } });
    expect(screen.getByText('Ningún usuario coincide con la búsqueda.')).toBeInTheDocument();
  });

  it('deletes a user after confirming', async () => {
    render(<AdminUsers email="owner@example.com" onSignOut={vi.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Borrar a Ana García' }));
    const dialog = screen.getByRole('dialog', { name: '¿Borrar a Ana García?' });
    expect(dialog).toHaveTextContent('2 tareas');
    expect(dialog).toHaveTextContent('Su casa.');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Borrar usuario' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Borraste a Ana García.');
    expect(api).toHaveBeenCalledWith('DELETE', '/admin/users/u1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument();
  });

  it('keeps the user when cancelling', async () => {
    render(<AdminUsers email="owner@example.com" onSignOut={vi.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Borrar a Luis Pérez' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(api).not.toHaveBeenCalledWith('DELETE', expect.anything());
    expect(screen.getByText('Luis Pérez')).toBeInTheDocument();
  });

  it('shows why a delete failed and keeps the dialog open', async () => {
    api.mockImplementation((method: string) =>
      method === 'GET' ? Promise.resolve(users) : Promise.reject(new Error('User u2 not found')),
    );
    render(<AdminUsers email="owner@example.com" onSignOut={vi.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Borrar a Luis Pérez' }));
    fireEvent.click(screen.getByRole('button', { name: 'Borrar usuario' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('User u2 not found'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
