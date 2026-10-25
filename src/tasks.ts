// Mirrors the API's tasks and tradesmen (GET/POST /tasks, GET /tradesmen).
import type { Address, Trade } from './user.ts';

export type TaskStatus = 'unassigned' | 'assigned' | 'done' | 'completed' | 'cancelled' | 'rejected';

export type TaskEventType =
  | 'created'
  | 'assigned'
  | 'reassigned'
  | 'rejected'
  | 'rescheduled'
  | 'done'
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
  doneAt: string | null;
  completedAt: string | null;
  // 1 to 5, given by the client when confirming the work.
  rating: number | null;
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
  rating: number | null;
  occurredAt: string;
}

export interface Tradesman extends Person {
  trades: Trade[];
  contractorId: string | null;
  ratingAverage: number | null;
  ratingCount: number;
}

export interface TradesmenPage {
  items: Tradesman[];
  nextCursor: string | null;
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
  done: 'Hecha',
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
  done: 'Marcada como hecha',
  completed: 'Confirmada',
  cancelled: 'Cancelada',
};
