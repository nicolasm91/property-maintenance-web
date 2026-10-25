import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const STARS = [1, 2, 3, 4, 5];

// A tradesman's average, or "Nuevo" before their first rating.
export function RatingSummary({ average, count }: { average: number | null; count: number }) {
  if (average === null || count === 0) {
    return <span className="text-xs font-medium text-muted-foreground">Nuevo</span>;
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-sm"
      aria-label={`${average.toFixed(1)} de 5, ${count} calificaciones`}
    >
      <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-medium">{average.toFixed(1)}</span>
      <span className="text-muted-foreground">({count})</span>
    </span>
  );
}

export function StarsDisplay({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} de 5 estrellas`}>
      {STARS.map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={cn('size-4', star <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')}
        />
      ))}
    </span>
  );
}

export function StarsInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Calificación">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={star === 1 ? '1 estrella' : `${star} estrellas`}
          onClick={() => onChange(star)}
          className="rounded-md p-1 transition-transform hover:scale-110"
        >
          <Star
            className={cn('size-8', star <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')}
          />
        </button>
      ))}
    </div>
  );
}
