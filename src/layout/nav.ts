import {
  Briefcase,
  Building2,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  House,
  type LucideIcon,
  Wrench,
} from 'lucide-react';
import type { ProfileType } from '../user.ts';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const home: NavItem = { to: '/', label: 'Inicio', icon: House };

const byRole: Record<ProfileType, NavItem[]> = {
  directClient: [
    { to: '/reservar', label: 'Reservar', icon: CalendarPlus },
    { to: '/tareas', label: 'Mis tareas', icon: ClipboardList },
  ],
  tradesman: [
    { to: '/agenda', label: 'Agenda', icon: CalendarDays },
    { to: '/oficios', label: 'Mis oficios', icon: Wrench },
  ],
  propertyManager: [{ to: '/administracion', label: 'Administración', icon: Building2 }],
  contractor: [{ to: '/empresa', label: 'Empresa', icon: Briefcase }],
};

export const navFor = (role: ProfileType): NavItem[] => [home, ...byRole[role]];

export const pageTitle = (role: ProfileType, pathname: string): string =>
  pathname === '/perfil' ? 'Mi perfil' : (navFor(role).find((item) => item.to === pathname)?.label ?? 'Inicio');
