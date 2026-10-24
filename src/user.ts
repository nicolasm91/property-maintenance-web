// Mirrors the API's User (GET/POST /me).
export const PROFILE_TYPES = ['propertyManager', 'directClient', 'contractor', 'tradesman'] as const;

export type ProfileType = (typeof PROFILE_TYPES)[number];

export const TRADES = ['electrician', 'handyman', 'plumber', 'mason'] as const;

export type Trade = (typeof TRADES)[number];

export type User = {
  id: string;
  email: string;
  name: string;
  middleName: string | null;
  lastName: string;
} & (
  | {
      role: 'propertyManager';
      administration: { id: string; name: string };
      administrationRole: 'admin' | 'member';
    }
  | { role: 'directClient' }
  | { role: 'contractor'; company: { id: string; name: string } }
  | { role: 'tradesman'; trades: Trade[]; contractorId: string | null }
);

export interface OnboardRequest {
  profileType: ProfileType;
  name: string;
  middleName?: string;
  lastName: string;
  administrationName?: string;
  companyName?: string;
  trades?: Trade[];
}

export const PROFILE_LABELS: Record<ProfileType, string> = {
  propertyManager: 'Administración de consorcios',
  directClient: 'Particular',
  contractor: 'Contratista',
  tradesman: 'Profesional de oficio',
};

export const TRADE_LABELS: Record<Trade, string> = {
  electrician: 'Electricista',
  handyman: 'Mantenimiento general',
  plumber: 'Plomero',
  mason: 'Albañil',
};
