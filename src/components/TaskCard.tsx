import { CalendarClock, History, MapPin, UserRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { useApi } from '../api.ts';
import { formatDateTime } from '../dates.ts';
import { EVENT_LABELS, fullName, type Task, type TaskEvent } from '../tasks.ts';
import { formatAddress, TRADE_LABELS } from '../user.ts';
import StatusBadge from './StatusBadge.tsx';
import { Button } from './ui/button.tsx';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card.tsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog.tsx';
import { Field, FieldLabel } from './ui/field.tsx';
import { Textarea } from './ui/textarea.tsx';

interface Props {
  task: Task;
  role: 'directClient' | 'tradesman';
  onChange: () => void;
}

type Reasoned = 'reject' | 'cancel';

const message = (error: unknown) => (error instanceof Error ? error.message : 'Error inesperado');

export default function TaskCard({ task, role, onChange }: Props) {
  const api = useApi();
  const [asking, setAsking] = useState<Reasoned | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<TaskEvent[] | null>(null);

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setAsking(null);
      toast.success(done);
      onChange();
    } catch (actionError) {
      setError(message(actionError));
    } finally {
      setBusy(false);
    }
  };

  const submitReason = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('reason');
    const reason = typeof value === 'string' ? value.trim() : '';
    void (asking === 'reject'
      ? run(() => api('POST', `/tasks/${task.id}/reject`, reason ? { reason } : {}), 'Rechazaste la tarea.')
      : run(() => api('POST', `/tasks/${task.id}/cancel`, { reason }), 'Cancelaste la tarea.'));
  };

  const toggleHistory = () => {
    if (events) {
      setEvents(null);
      return;
    }
    api<TaskEvent[]>('GET', `/tasks/${task.id}/events`)
      .then(setEvents)
      .catch((loadError: unknown) => setError(message(loadError)));
  };

  const canComplete = role === 'tradesman' && task.status === 'assigned';
  const canCancel = role === 'directClient' && (task.status === 'unassigned' || task.status === 'assigned');
  const counterpart = role === 'tradesman' ? task.createdBy : task.tradesman;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        <CardDescription>{TRADE_LABELS[task.trade]}</CardDescription>
        <CardAction>
          <StatusBadge status={task.status} />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" />
          {formatDateTime(task.scheduledAt)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" />
          {formatAddress(task.property.address)}
        </p>
        {counterpart && (
          <p className="flex items-center gap-2">
            <UserRound className="size-4 text-muted-foreground" />
            {role === 'tradesman' ? 'Cliente' : 'Profesional'}: {fullName(counterpart)}
          </p>
        )}
        <p className="pt-1 text-muted-foreground">{task.description}</p>

        {events && (
          <ol aria-label="Historial" className="mt-3 space-y-2 border-l pl-4">
            {events.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute top-1.5 -left-[1.3rem] size-2 rounded-full bg-primary" />
                <span className="font-medium">{EVENT_LABELS[event.type]}</span>
                <span className="text-muted-foreground">
                  {' '}
                  · {formatDateTime(event.occurredAt)} · {fullName(event.actor)}
                  {event.reason && ` · ${event.reason}`}
                </span>
              </li>
            ))}
          </ol>
        )}
        {error && !asking && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        {canComplete && (
          <Button
            disabled={busy}
            onClick={() =>
              void run(() => api('POST', `/tasks/${task.id}/complete`), 'Marcaste la tarea como completada.')
            }
          >
            Completar
          </Button>
        )}
        {canComplete && (
          <Button variant="outline" disabled={busy} onClick={() => setAsking('reject')}>
            Rechazar
          </Button>
        )}
        {canCancel && (
          <Button variant="outline" disabled={busy} onClick={() => setAsking('cancel')}>
            Cancelar
          </Button>
        )}
        <Button variant="ghost" className="ml-auto" onClick={toggleHistory}>
          <History />
          {events ? 'Ocultar historial' : 'Ver historial'}
        </Button>
      </CardFooter>

      <Dialog open={asking !== null} onOpenChange={(open) => !open && setAsking(null)}>
        <DialogContent>
          <form onSubmit={submitReason} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{asking === 'reject' ? '¿Rechazar la tarea?' : '¿Cancelar la tarea?'}</DialogTitle>
              <DialogDescription>
                {asking === 'reject'
                  ? 'El turno queda libre y el cliente puede reservar con otra persona.'
                  : 'El turno queda libre. Contale al profesional por qué la cancelás.'}
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor={`reason-${task.id}`}>
                {asking === 'reject' ? 'Motivo (opcional)' : 'Motivo'}
              </FieldLabel>
              <Textarea id={`reason-${task.id}`} name="reason" required={asking === 'cancel'} rows={3} />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Volver
                </Button>
              </DialogClose>
              <Button type="submit" variant={asking === 'cancel' ? 'destructive' : 'default'} disabled={busy}>
                {asking === 'reject' ? 'Confirmar rechazo' : 'Confirmar cancelación'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
