// Mirrors the API's AdminUser (GET /admin/users).
import type { ProfileType } from '../user.ts';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  middleName: string | null;
  lastName: string;
  role: ProfileType;
  organization: { id: string; name: string } | null;
  homes: number;
  tasks: number;
  createdAt: string;
}

// Auth0 database connection: platform owners sign in with a username and password.
export const PASSWORD_CONNECTION = 'Username-Password-Authentication';

export const isPasswordAccount = (sub: string | undefined): boolean => sub?.startsWith('auth0|') ?? false;

export const ROLE_PLURALS: Record<ProfileType, string> = {
  propertyManager: 'Administraciones',
  directClient: 'Particulares',
  contractor: 'Contratistas',
  tradesman: 'Profesionales',
};
