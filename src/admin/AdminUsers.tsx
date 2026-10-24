import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../api.ts';
import { PROFILE_LABELS, PROFILE_TYPES, type ProfileType } from '../user.ts';
import { type AdminUser, ROLE_PLURALS } from './adminUser.ts';
import ConfirmDelete from './ConfirmDelete.tsx';

interface Props {
  email: string;
  onSignOut: () => void;
}

const createdAt = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: 'numeric',
  month: 'short',
});

const initials = (user: AdminUser) => `${user.name[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

const fullName = (user: AdminUser) => [user.name, user.middleName, user.lastName].filter(Boolean).join(' ');

const matches = (user: AdminUser, search: string) =>
  [user.email, user.name, user.middleName ?? '', user.lastName, user.organization?.name ?? '']
    .join(' ')
    .toLowerCase()
    .includes(search.toLowerCase());

export default function AdminUsers({ email, onSignOut }: Props) {
  const api = useApi();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<ProfileType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    api<AdminUser[]>('GET', '/admin/users')
      .then(setUsers)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Error inesperado'));
  }, [api]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const counts = useMemo(() => {
    const byRole = Object.fromEntries(PROFILE_TYPES.map((type) => [type, 0])) as Record<ProfileType, number>;
    for (const user of users ?? []) {
      byRole[user.role] += 1;
    }
    return byRole;
  }, [users]);

  const visible = (users ?? []).filter((user) => (role === 'all' || user.role === role) && matches(user, search));

  const remove = async (user: AdminUser) => {
    await api('DELETE', `/admin/users/${user.id}`);
    setUsers((current) => current?.filter((other) => other.id !== user.id) ?? null);
    setDeleting(null);
    setNotice(`Borraste a ${fullName(user)}.`);
  };

  return (
    <div className="admin">
      <header className="admin-header">
        <div>
          <span className="admin-badge">Superadmin</span>
          <h1>Usuarios</h1>
        </div>
        <div className="admin-session">
          <span>{email}</span>
          <button className="secondary" onClick={onSignOut}>
            Salir
          </button>
        </div>
      </header>

      <div className="admin-stats">
        <div className="admin-stat">
          <strong>{users?.length ?? '–'}</strong>
          <span>Total</span>
        </div>
        {PROFILE_TYPES.map((type) => (
          <div key={type} className={`admin-stat role-${type}`}>
            <strong>{users ? counts[type] : '–'}</strong>
            <span>{ROLE_PLURALS[type]}</span>
          </div>
        ))}
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          aria-label="Buscar"
          placeholder="Buscar por nombre, email u organización"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="admin-filters" role="group" aria-label="Filtrar por perfil">
          {(['all', ...PROFILE_TYPES] as const).map((option) => (
            <button
              key={option}
              className={role === option ? 'chip active' : 'chip'}
              aria-pressed={role === option}
              onClick={() => setRole(option)}
            >
              {option === 'all' ? 'Todos' : ROLE_PLURALS[option]}
            </button>
          ))}
        </div>
      </div>

      {error && <p role="alert">No se pudieron cargar los usuarios: {error}</p>}
      {!users && !error && <p>Cargando…</p>}
      {users && visible.length === 0 && (
        <div className="admin-empty">
          <p>{users.length === 0 ? 'Todavía no hay usuarios.' : 'Ningún usuario coincide con la búsqueda.'}</p>
        </div>
      )}

      {visible.length > 0 && (
        <ul className="admin-users">
          {visible.map((user) => (
            <li key={user.id} className="admin-user">
              <span className={`avatar role-${user.role}`} aria-hidden="true">
                {initials(user)}
              </span>
              <div className="admin-user-main">
                <strong>{fullName(user)}</strong>
                <span>{user.email}</span>
              </div>
              <div className="admin-user-meta">
                <span className={`role-badge role-${user.role}`}>{PROFILE_LABELS[user.role]}</span>
                {user.organization && <span>{user.organization.name}</span>}
                <span>
                  {user.tasks} {user.tasks === 1 ? 'tarea' : 'tareas'}
                  {user.role === 'directClient' && ` · ${user.homes} ${user.homes === 1 ? 'casa' : 'casas'}`}
                  {` · alta ${createdAt.format(new Date(user.createdAt))}`}
                </span>
              </div>
              <button className="danger" aria-label={`Borrar a ${fullName(user)}`} onClick={() => setDeleting(user)}>
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}

      {deleting && <ConfirmDelete user={deleting} onConfirm={remove} onCancel={() => setDeleting(null)} />}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </div>
  );
}
