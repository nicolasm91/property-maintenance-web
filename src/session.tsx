import { createContext, useContext } from 'react';
import type { User } from './user.ts';

export interface Session {
  user: User;
  setUser: (user: User) => void;
  signOut: () => void;
}

export const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useSession must be used inside a signed-in, onboarded app');
  }
  return session;
}
