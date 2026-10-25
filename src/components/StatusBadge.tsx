import { STATUS_LABELS, type TaskStatus } from '../tasks.ts';
import { Badge } from './ui/badge.tsx';
import { cn } from '@/lib/utils';

const styles: Record<TaskStatus, string> = {
  unassigned: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  done: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-muted text-muted-foreground',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={cn('border-transparent', styles[status])}>{STATUS_LABELS[status]}</Badge>;
}
