import { useCallback, useEffect, useState } from 'react';
import { useApi } from './api.ts';
import TaskCard from './TaskCard.tsx';
import type { Task } from './tasks.ts';

interface Props {
  role: 'directClient' | 'tradesman';
}

export default function TaskList({ role }: Props) {
  const api = useApi();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api<Task[]>('GET', '/tasks')
      .then(setTasks)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Error inesperado'));
  }, [api]);

  useEffect(load, [load]);

  return (
    <section>
      <h2>{role === 'tradesman' ? 'Tu agenda' : 'Tus tareas'}</h2>
      {error && <p role="alert">No se pudieron cargar las tareas: {error}</p>}
      {tasks?.length === 0 && <p>{role === 'tradesman' ? 'No tenés tareas agendadas.' : 'Todavía no reservaste.'}</p>}
      {tasks && tasks.length > 0 && (
        <ul className="tasks">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} role={role} onChange={load} />
          ))}
        </ul>
      )}
    </section>
  );
}
