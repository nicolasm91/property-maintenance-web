import { useCallback, useEffect, useState } from 'react';
import { useApi } from './api.ts';
import type { Task } from './tasks.ts';

export function useTasks() {
  const api = useApi();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    api<Task[]>('GET', '/tasks')
      .then(setTasks)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Error inesperado'));
  }, [api]);

  useEffect(reload, [reload]);

  return { tasks, error, reload };
}
