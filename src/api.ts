import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
import { config } from './config.ts';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  return useCallback(
    async <T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> => {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${config.apiUrl}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = (payload as { message?: string | string[] } | null)?.message;
        throw new ApiError(
          response.status,
          Array.isArray(message) ? message.join(', ') : (message ?? response.statusText),
        );
      }
      return payload as T;
    },
    [getAccessTokenSilently],
  );
}
