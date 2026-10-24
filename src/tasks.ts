// Mirrors the API's tasks and tradesmen (GET/POST /tasks, GET /tradesmen).
import type { Address, Trade } from './user.ts';

export type TaskStatus = 'unassigned' | 'assigned' | 'completed' | 'cancelled' | 'rejected';

export type TaskEventType =
  | 'created'
  | 'assigned'
  | 'reassigned'
  | 'rejected'
  | 'rescheduled'
  | 'completed'
  | 'cancelled';

export interface Person {
  id: string;
  name: string;
  middleName: string | null;
  lastName: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  trade: Trade;
  status: TaskStatus;
  scheduledAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  property: { id: string; address: Address };
  createdBy: Person;
  tradesman: Person | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskEvent {
  id: string;
  type: TaskEventType;
  actor: Person;
  tradesmanId: string | null;
  reason: string | null;
  occurredAt: string;
}

export interface Tradesman extends Person {
  trades: Trade[];
  contractorId: string | null;
}

export interface BookRequest {
  tradesmanId: string;
  propertyId: string;
  trade: Trade;
  title: string;
  description: string;
  scheduledAt: string;
}

export const fullName = ({ name, middleName, lastName }: Person): string =>
  [name, middleName, lastName].filter(Boolean).join(' ');

export const STATUS_LABELS: Record<TaskStatus, string> = {
  unassigned: 'Sin asignar',
  assigned: 'Asignada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  rejected: 'Rechazada',
};

export const EVENT_LABELS: Record<TaskEventType, string> = {
  created: 'Creada',
  assigned: 'Asignada',
  reassigned: 'Reasignada',
  rejected: 'Rechazada',
  rescheduled: 'Reprogramada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};
