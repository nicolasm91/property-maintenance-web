// Mirrors the API's User (GET/POST /me).
export const PROFILE_TYPES = ['propertyManager', 'directClient', 'contractor', 'tradesman'] as const;

export type ProfileType = (typeof PROFILE_TYPES)[number];

export const TRADES = ['electrician', 'handyman', 'plumber', 'mason'] as const;

export type Trade = (typeof TRADES)[number];

export interface Address {
  street: string;
  number: string;
  postalCode: string;
  intersection: string;
}

export interface Home {
  id: string;
  address: Address;
}

export type User = {
  id: string;
  email: string;
  name: string;
  middleName: string | null;
  lastName: string;
} & (
  | {
      role: 'propertyManager';
      // Null until they create their administration.
      administration: { id: string; name: string } | null;
      administrationRole: 'admin' | 'member' | null;
    }
  | { role: 'directClient'; homes: Home[] }
  | { role: 'contractor'; company: { id: string; name: string } | null }
  | { role: 'tradesman'; trades: Trade[]; contractorId: string | null }
);

export interface OnboardRequest {
  profileType: ProfileType;
  name: string;
  middleName?: string;
  lastName: string;
  home?: Address;
  trades?: Trade[];
}

export const PROFILE_LABELS: Record<ProfileType, string> = {
  propertyManager: 'Administración de consorcios',
  directClient: 'Particular',
  contractor: 'Contratista',
  tradesman: 'Profesional de oficio',
};

export const PROFILE_DESCRIPTIONS: Record<ProfileType, string> = {
  propertyManager: 'Gestionás edificios y consorcios.',
  directClient: 'Necesitás arreglos en tu casa.',
  contractor: 'Tenés una empresa con profesionales a cargo.',
  tradesman: 'Trabajás en un oficio y tomás trabajos.',
};

export const fullName = ({ name, middleName, lastName }: Pick<User, 'name' | 'middleName' | 'lastName'>): string =>
  [name, middleName, lastName].filter(Boolean).join(' ');

export const formatAddress = ({ street, number, intersection }: Address): string =>
  `${street} ${number} (${intersection})`;

export const TRADE_LABELS: Record<Trade, string> = {
  electrician: 'Electricista',
  handyman: 'Mantenimiento general',
  plumber: 'Plomero',
  mason: 'Albañil',
};
