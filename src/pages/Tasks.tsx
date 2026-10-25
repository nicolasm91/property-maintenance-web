import { CalendarPlus, ClipboardList } from 'lucide-react';
import { Link } from 'react-router';
import PageHeader from '../components/PageHeader.tsx';
import TaskCard from '../components/TaskCard.tsx';
import { Button } from '../components/ui/button.tsx';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../components/ui/empty.tsx';
import { Skeleton } from '../components/ui/skeleton.tsx';
import { formatLongDay } from '../dates.ts';
import { useSession } from '../session.tsx';
import type { Task } from '../tasks.ts';
import { useTasks } from '../useTasks.ts';

const open = (task: Task) => task.status === 'assigned' || task.status === 'unassigned';

// The direct client's tasks, or the tradesman's agenda.
export default function Tasks() {
  const { user } = useSession();
  const { tasks, error, reload } = useTasks();
  const role = user.role === 'tradesman' ? 'tradesman' : 'directClient';

  const header =
    role === 'tradesman' ? (
      <PageHeader title="Agenda" description="Tus trabajos, ordenados por fecha." />
    ) : (
      <PageHeader
        title="Mis tareas"
        description="Los trabajos que reservaste."
        actions={
          <Button asChild>
            <Link to="/reservar">
              <CalendarPlus />
              Reservar
            </Link>
          </Button>
        }
      />
    );

  if (error) {
    return (
      <>
        {header}
        <p role="alert" className="text-destructive">
          No se pudieron cargar las tareas: {error}
        </p>
      </>
    );
  }
  if (!tasks) {
    return (
      <>
        {header}
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </>
    );
  }
  if (tasks.length === 0) {
    return (
      <>
        {header}
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>{role === 'tradesman' ? 'No tenés tareas agendadas' : 'Todavía no reservaste'}</EmptyTitle>
            <EmptyDescription>
              {role === 'tradesman'
                ? 'Cuando un cliente reserve un turno con vos, aparece acá.'
                : 'Elegí un profesional y un horario, y el trabajo queda agendado.'}
            </EmptyDescription>
          </EmptyHeader>
          {role === 'directClient' && (
            <EmptyContent>
              <Button asChild>
                <Link to="/reservar">Reservar un profesional</Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      </>
    );
  }

  const groups =
    role === 'tradesman'
      ? groupByDay(tasks)
      : [
          { title: 'Próximas', tasks: tasks.filter(open) },
          { title: 'Historial', tasks: tasks.filter((task) => !open(task)).reverse() },
        ];

  return (
    <>
      {header}
      <div className="space-y-8">
        {groups
          .filter((group) => group.tasks.length > 0)
          .map((group) => (
            <section key={group.title} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground first-letter:uppercase">{group.title}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {group.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} role={role} onChange={reload} />
                ))}
              </div>
            </section>
          ))}
      </div>
    </>
  );
}

function groupByDay(tasks: Task[]) {
  const groups: { title: string; tasks: Task[] }[] = [];
  for (const task of tasks) {
    const title = formatLongDay(task.scheduledAt);
    const last = groups[groups.length - 1];
    if (last?.title === title) {
      last.tasks.push(task);
    } else {
      groups.push({ title, tasks: [task] });
    }
  }
  return groups;
}
