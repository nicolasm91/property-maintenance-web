import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CircleCheck,
  type LucideIcon,
  MapPin,
  Star,
  Wrench,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Link } from 'react-router';
import StatusBadge from '../components/StatusBadge.tsx';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert.tsx';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../components/ui/empty.tsx';
import { Skeleton } from '../components/ui/skeleton.tsx';
import { formatDateTime, formatLongDay, sameDay } from '../dates.ts';
import { useSession } from '../session.tsx';
import { fullName, type Task } from '../tasks.ts';
import { formatAddress, type User } from '../user.ts';
import { useTasks } from '../useTasks.ts';

export default function Dashboard() {
  const { user } = useSession();
  const [today] = useState(() => new Date());

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground first-letter:uppercase">{formatLongDay(today)}</p>
        <h2 className="text-3xl font-semibold tracking-tight">Hola, {user.name}</h2>
      </div>
      {(user.role === 'directClient' || user.role === 'tradesman') && <TasksOverview user={user} />}
      {(user.role === 'propertyManager' || user.role === 'contractor') && <OrganizationOverview user={user} />}
    </div>
  );
}

function TasksOverview({ user }: { user: User & { role: 'directClient' | 'tradesman' } }) {
  const { tasks } = useTasks();
  const isTradesman = user.role === 'tradesman';
  const [now] = useState(() => new Date());
  const upcoming = (tasks ?? []).filter(
    (task) => task.status === 'assigned' && new Date(task.scheduledAt).getTime() >= now.getTime(),
  );
  const today = upcoming.filter((task) => sameDay(task.scheduledAt, now));
  const completed = (tasks ?? []).filter((task) => task.status === 'completed');
  const toConfirm = (tasks ?? []).filter((task) => task.status === 'done');

  const stats: { label: string; value: ReactNode; icon: LucideIcon }[] = isTradesman
    ? [
        { label: 'Hoy', value: today.length, icon: CalendarCheck },
        { label: 'Próximas', value: upcoming.length, icon: CalendarClock },
        {
          label: 'Calificación',
          value: user.ratingCount > 0 ? user.ratingAverage!.toFixed(1) : '—',
          icon: Star,
        },
      ]
    : [
        { label: 'Próximas', value: upcoming.length, icon: CalendarClock },
        { label: 'Para confirmar', value: toConfirm.length, icon: CircleCheck },
        { label: 'Completadas', value: completed.length, icon: CalendarCheck },
      ];

  return (
    <>
      {!isTradesman && toConfirm.length > 0 && (
        <Alert>
          <CircleCheck />
          <AlertTitle>
            {toConfirm.length === 1
              ? 'Tenés un trabajo para confirmar'
              : `Tenés ${toConfirm.length} trabajos para confirmar`}
          </AlertTitle>
          <AlertDescription>
            El profesional lo marcó como hecho.{' '}
            <Link to="/tareas" className="font-medium underline underline-offset-4">
              Confirmalo y calificalo
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      {isTradesman && user.municipalities.length === 0 && (
        <Alert>
          <MapPin />
          <AlertTitle>Elegí dónde trabajás</AlertTitle>
          <AlertDescription>
            Sin localidades no aparecés en las búsquedas.{' '}
            <Link to="/zonas" className="font-medium underline underline-offset-4">
              Elegí tus zonas
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      {isTradesman && user.trades.length === 0 && (
        <Alert>
          <Wrench />
          <AlertTitle>Elegí tus oficios</AlertTitle>
          <AlertDescription>
            Los clientes te encuentran por oficio.{' '}
            <Link to="/oficios" className="font-medium underline underline-offset-4">
              Configuralos
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardDescription>{label}</CardDescription>
              <Icon className="hidden size-4 text-muted-foreground sm:block" />
            </CardHeader>
            <CardContent>
              {tasks ? (
                <p className="text-2xl font-semibold sm:text-3xl">{value}</p>
              ) : (
                <Skeleton className="h-9 w-12" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{isTradesman ? 'Tus próximos trabajos' : 'Tus próximas tareas'}</CardTitle>
            <CardDescription>Lo que viene en tu agenda.</CardDescription>
          </CardHeader>
          <CardContent>
            {!tasks && <Skeleton className="h-24" />}
            {tasks && upcoming.length === 0 && (
              <Empty className="py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarClock />
                  </EmptyMedia>
                  <EmptyTitle>Nada agendado</EmptyTitle>
                  <EmptyDescription>
                    {isTradesman
                      ? 'Cuando un cliente reserve un turno con vos, lo vas a ver acá.'
                      : 'Reservá un profesional y el trabajo aparece acá.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            {upcoming.length > 0 && (
              <ul className="divide-y">
                {upcoming.slice(0, 4).map((task) => (
                  <UpcomingTask key={task.id} task={task} isTradesman={isTradesman} />
                ))}
              </ul>
            )}
          </CardContent>
          {upcoming.length > 0 && (
            <CardFooter>
              <Button variant="ghost" asChild className="ml-auto">
                <Link to={isTradesman ? '/agenda' : '/tareas'}>
                  Ver todas
                  <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>{isTradesman ? 'Tu agenda' : '¿Necesitás un arreglo?'}</CardTitle>
            <CardDescription className="text-primary-foreground/70">
              {isTradesman
                ? 'Completá o rechazá tus trabajos desde la agenda.'
                : 'Elegí un profesional y un horario libre en minutos.'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto border-t-0 bg-transparent">
            <Button variant="secondary" asChild>
              <Link to={isTradesman ? '/agenda' : '/reservar'}>
                {isTradesman ? <CalendarCheck /> : <CalendarPlus />}
                {isTradesman ? 'Ir a la agenda' : 'Reservar'}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

function UpcomingTask({ task, isTradesman }: { task: Task; isTradesman: boolean }) {
  const counterpart = isTradesman ? task.createdBy : task.tradesman;
  return (
    <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate font-medium">{task.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {formatDateTime(task.scheduledAt)}
          {counterpart && ` · ${fullName(counterpart)}`}
          {isTradesman && ` · ${formatAddress(task.property.address)}`}
        </p>
      </div>
      <StatusBadge status={task.status} />
    </li>
  );
}

function OrganizationOverview({ user }: { user: User & { role: 'propertyManager' | 'contractor' } }) {
  const isAdministration = user.role === 'propertyManager';
  const organization = isAdministration ? user.administration : user.company;
  const Icon = isAdministration ? Building2 : Briefcase;
  const path = isAdministration ? '/administracion' : '/empresa';
  const noun = isAdministration ? 'administración' : 'empresa';

  if (!organization) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <CardTitle>Empezá creando tu {noun}</CardTitle>
          <CardDescription>
            Es el primer paso para {isAdministration ? 'cargar tus edificios y pedir trabajos' : 'recibir trabajos'}.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link to={path}>
              Crear {noun}
              <ArrowRight />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle>{organization.name}</CardTitle>
            <CardDescription>Tu {noun}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {isAdministration
          ? 'Pronto vas a poder cargar edificios, invitar a tu equipo y pedir trabajos desde acá.'
          : 'Pronto vas a poder recibir trabajos y sumar a tus profesionales desde acá.'}
      </CardContent>
    </Card>
  );
}
