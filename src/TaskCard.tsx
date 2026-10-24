import { type FormEvent, useState } from 'react';
import { useApi } from './api.ts';
import { formatDateTime } from './dates.ts';
import { EVENT_LABELS, fullName, STATUS_LABELS, type Task, type TaskEvent } from './tasks.ts';
import { formatAddress, TRADE_LABELS } from './user.ts';

interface Props {
  task: Task;
  role: 'directClient' | 'tradesman';
  onChange: () => void;
}

type Mode = 'idle' | 'rejecting' | 'cancelling';

export default function TaskCard({ task, role, onChange }: Props) {
  const api = useApi();
  const [mode, setMode] = useState<Mode>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<TaskEvent[] | null>(null);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setMode('idle');
      onChange();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  };

  const submitReason = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('reason');
    const reason = typeof value === 'string' ? value.trim() : '';
    void run(() =>
      mode === 'rejecting'
        ? api('POST', `/tasks/${task.id}/reject`, reason ? { reason } : {})
        : api('POST', `/tasks/${task.id}/cancel`, { reason }),
    );
  };

  const toggleHistory = () => {
    if (events) {
      setEvents(null);
      return;
    }
    api<TaskEvent[]>('GET', `/tasks/${task.id}/events`)
      .then(setEvents)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Error inesperado'));
  };

  const canComplete = role === 'tradesman' && task.status === 'assigned';
  const canCancel = role === 'directClient' && (task.status === 'unassigned' || task.status === 'assigned');
  const counterpart = role === 'tradesman' ? task.createdBy : task.tradesman;

  return (
    <li className="task">
      <h3>{task.title}</h3>
      <p>
        {formatDateTime(task.scheduledAt)} · {TRADE_LABELS[task.trade]} · <strong>{STATUS_LABELS[task.status]}</strong>
      </p>
      <p>{formatAddress(task.property.address)}</p>
      {counterpart && (
        <p>
          {role === 'tradesman' ? 'Cliente' : 'Profesional'}: {fullName(counterpart)}
        </p>
      )}
      <p>{task.description}</p>

      {mode === 'idle' && (
        <div className="actions">
          {canComplete && (
            <button disabled={busy} onClick={() => void run(() => api('POST', `/tasks/${task.id}/complete`))}>
              Completar
            </button>
          )}
          {canComplete && (
            <button className="secondary" disabled={busy} onClick={() => setMode('rejecting')}>
              Rechazar
            </button>
          )}
          {canCancel && (
            <button className="secondary" disabled={busy} onClick={() => setMode('cancelling')}>
              Cancelar
            </button>
          )}
          <button className="secondary" onClick={toggleHistory}>
            {events ? 'Ocultar historial' : 'Ver historial'}
          </button>
        </div>
      )}

      {mode !== 'idle' && (
        <form onSubmit={submitReason}>
          <label>
            {mode === 'rejecting' ? 'Motivo (opcional)' : 'Motivo'}
            <input name="reason" required={mode === 'cancelling'} />
          </label>
          <div className="actions">
            <button type="submit" disabled={busy}>
              {mode === 'rejecting' ? 'Confirmar rechazo' : 'Confirmar cancelación'}
            </button>
            <button type="button" className="secondary" onClick={() => setMode('idle')}>
              Volver
            </button>
          </div>
        </form>
      )}

      {events && (
        <ol aria-label="Historial">
          {events.map((event) => (
            <li key={event.id}>
              {EVENT_LABELS[event.type]} · {formatDateTime(event.occurredAt)} · {fullName(event.actor)}
              {event.reason && ` · ${event.reason}`}
            </li>
          ))}
        </ol>
      )}

      {error && <p role="alert">{error}</p>}
    </li>
  );
}
