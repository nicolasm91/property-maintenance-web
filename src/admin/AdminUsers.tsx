import { Search, ShieldCheck, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useApi } from '../api.ts';
import UserAvatar from '../components/UserAvatar.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader } from '../components/ui/card.tsx';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../components/ui/empty.tsx';
import { Input } from '../components/ui/input.tsx';
import { Skeleton } from '../components/ui/skeleton.tsx';
import { cn } from '@/lib/utils';
import { fullName, PROFILE_LABELS, PROFILE_TYPES, type ProfileType } from '../user.ts';
import { type AdminUser, ROLE_PLURALS } from './adminUser.ts';
import ConfirmDelete from './ConfirmDelete.tsx';

interface Props {
  email: string;
  onSignOut: () => void;
}

const ROLE_STYLES: Record<ProfileType, string> = {
  propertyManager: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  directClient: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300',
  contractor: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  tradesman: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
};

const createdAt = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: 'numeric',
  month: 'short',
});

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

  useEffect(() => {
    api<AdminUser[]>('GET', '/admin/users')
      .then(setUsers)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Error inesperado'));
  }, [api]);

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
    toast.success(`Borraste a ${fullName(user)}.`);
  };

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" />
          </div>
          <span className="font-semibold">Panel de administración</span>
          <Badge variant="secondary">Superadmin</Badge>
          <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{email}</span>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Borrá cuentas de prueba para volver a registrarte con el mismo Google.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Stat label="Total" value={users?.length} />
          {PROFILE_TYPES.map((type) => (
            <Stat key={type} label={ROLE_PLURALS[type]} value={users ? counts[type] : undefined} />
          ))}
        </div>

        <Card>
          <CardHeader className="gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Buscar"
                placeholder="Buscar por nombre, email u organización"
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por perfil">
              {(['all', ...PROFILE_TYPES] as const).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={role === option ? 'default' : 'outline'}
                  aria-pressed={role === option}
                  onClick={() => setRole(option)}
                  className="rounded-full"
                >
                  {option === 'all' ? 'Todos' : ROLE_PLURALS[option]}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <p role="alert" className="text-destructive">
                No se pudieron cargar los usuarios: {error}
              </p>
            )}
            {!users && !error && (
              <div className="space-y-3">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            )}
            {users && visible.length === 0 && (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users />
                  </EmptyMedia>
                  <EmptyTitle>{users.length === 0 ? 'Todavía no hay usuarios' : 'Sin resultados'}</EmptyTitle>
                  <EmptyDescription>
                    {users.length === 0
                      ? 'Cuando alguien se registre, aparece acá.'
                      : 'Ningún usuario coincide con la búsqueda.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            {visible.length > 0 && (
              <ul className="divide-y">
                {visible.map((user) => (
                  <li key={user.id} className="flex flex-wrap items-center gap-4 py-3">
                    <UserAvatar name={user.name} lastName={user.lastName} className="size-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{fullName(user)}</p>
                      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right text-xs text-muted-foreground">
                      <Badge className={cn('border-transparent', ROLE_STYLES[user.role])}>
                        {PROFILE_LABELS[user.role]}
                      </Badge>
                      {user.organization && <span>{user.organization.name}</span>}
                      <span>
                        {user.tasks} {user.tasks === 1 ? 'tarea' : 'tareas'}
                        {user.role === 'directClient' && ` · ${user.homes} ${user.homes === 1 ? 'casa' : 'casas'}`}
                        {` · alta ${createdAt.format(new Date(user.createdAt))}`}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Borrar a ${fullName(user)}`}
                      onClick={() => setDeleting(user)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>

      <ConfirmDelete user={deleting} onConfirm={remove} onCancel={() => setDeleting(null)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <Card className="gap-1 py-4">
      <CardHeader className="px-4">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        {value === undefined ? <Skeleton className="h-8 w-10" /> : <p className="text-2xl font-semibold">{value}</p>}
      </CardContent>
    </Card>
  );
}
