import { Avatar, AvatarFallback } from './ui/avatar.tsx';
import { cn } from '@/lib/utils';

interface Props {
  name: string;
  lastName: string;
  className?: string;
}

export default function UserAvatar({ name, lastName, className }: Props) {
  return (
    <Avatar className={cn('rounded-lg', className)}>
      <AvatarFallback className="rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
        {`${name[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
