import { BrickWall, Droplets, type LucideIcon, Paintbrush, Zap } from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ApiError, useApi } from '../api.ts';
import PageHeader from '../components/PageHeader.tsx';
import UserAvatar from '../components/UserAvatar.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Field, FieldLabel } from '../components/ui/field.tsx';
import { Input } from '../components/ui/input.tsx';
import { NativeSelect, NativeSelectOption } from '../components/ui/native-select.tsx';
import { Skeleton } from '../components/ui/skeleton.tsx';
import { Textarea } from '../components/ui/textarea.tsx';
import { addDays, firstBookableDay, formatDayChip, formatLongDay, formatTime, todayInPlatform } from '../dates.ts';
import { useSession } from '../session.tsx';
import { type BookRequest, fullName, type Task, type Tradesman } from '../tasks.ts';
import { cn } from '@/lib/utils';
import { formatAddress, TRADE_LABELS, TRADES, type Trade } from '../user.ts';

const TRADE_ICONS: Record<Trade, LucideIcon> = {
  electrician: Zap,
  handyman: Paintbrush,
  plumber: Droplets,
  mason: BrickWall,
};

const message = (error: unknown) => (error instanceof Error ? error.message : 'Error inesperado');

export default function Booking() {
  const { user } = useSession();
  const homes = user.role === 'directClient' ? user.homes : [];
  const api = useApi();
  const navigate = useNavigate();
  const today = todayInPlatform();
  const [days] = useState(() => {
    const first = firstBookableDay();
    return Array.from({ length: 14 }, (_, index) => addDays(first, index));
  });
  const [trade, setTrade] = useState<Trade | null>(null);
  const [tradesmen, setTradesmen] = useState<Tradesman[] | null>(null);
  const [tradesmanId, setTradesmanId] = useState('');
  const [date, setDate] = useState(days[0]);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsVersion, setSlotsVersion] = useState(0);
  const [slot, setSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `ignore` drops responses to an older choice that arrive after a newer one.
  useEffect(() => {
    if (!trade) {
      return;
    }
    let ignore = false;
    api<Tradesman[]>('GET', `/tradesmen?trade=${trade}`)
      .then((found) => !ignore && setTradesmen(found))
      .catch((loadError: unknown) => !ignore && setError(message(loadError)));
    return () => {
      ignore = true;
    };
  }, [api, trade]);

  useEffect(() => {
    if (!tradesmanId || !date) {
      return;
    }
    let ignore = false;
    api<string[]>('GET', `/tradesmen/${tradesmanId}/availability?date=${date}`)
      .then((free) => !ignore && setSlots(free))
      .catch((loadError: unknown) => !ignore && setError(message(loadError)));
    return () => {
      ignore = true;
    };
  }, [api, tradesmanId, date, slotsVersion]);

  const chooseTrade = (value: Trade) => {
    setTrade(value);
    setTradesmen(null);
    chooseTradesman('');
  };

  const chooseTradesman = (value: string) => {
    setTradesmanId(value);
    setSlots(null);
    setSlot('');
    setError(null);
  };

  const chooseDate = (value: string) => {
    setDate(value);
    setSlots(null);
    setSlot('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (name: string) => {
      const value = form.get(name);
      return typeof value === 'string' ? value.trim() : '';
    };
    const request: BookRequest = {
      tradesmanId,
      propertyId: field('propertyId') || homes[0].id,
      trade: trade!,
      title: field('title'),
      description: field('description'),
      scheduledAt: slot,
    };
    setSubmitting(true);
    setError(null);
    try {
      const task = await api<Task>('POST', '/tasks', request);
      toast.success(`Reservaste el turno: ${task.title}.`);
      void navigate('/tareas');
    } catch (submitError) {
      setError(
        submitError instanceof ApiError && submitError.status === 409
          ? 'Ese turno ya no está disponible. Elegí otro.'
          : message(submitError),
      );
      setSlotsVersion((version) => version + 1);
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Reservar un profesional" description="En cuatro pasos queda agendado el trabajo." />
      <div className="space-y-6">
        <Step number={1} title="¿Qué necesitás?" description="Elegí el oficio del trabajo.">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4" role="group" aria-label="Oficio">
            {TRADES.map((option) => {
              const Icon = TRADE_ICONS[option];
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={trade === option}
                  onClick={() => chooseTrade(option)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors hover:bg-muted/60',
                    trade === option && 'border-primary bg-primary/5 ring-1 ring-primary',
                  )}
                >
                  <Icon className="size-6 text-muted-foreground" />
                  {TRADE_LABELS[option]}
                </button>
              );
            })}
          </div>
        </Step>

        {trade && (
          <Step
            number={2}
            title="Elegí un profesional"
            description="Profesionales independientes que trabajan en el oficio."
          >
            {!tradesmen && <Skeleton className="h-16" />}
            {tradesmen?.length === 0 && (
              <p className="text-muted-foreground">No hay profesionales disponibles para ese oficio.</p>
            )}
            {tradesmen && tradesmen.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2" role="group" aria-label="Profesional">
                {tradesmen.map((tradesman) => (
                  <button
                    key={tradesman.id}
                    type="button"
                    aria-pressed={tradesmanId === tradesman.id}
                    onClick={() => chooseTradesman(tradesman.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/60',
                      tradesmanId === tradesman.id && 'border-primary bg-primary/5 ring-1 ring-primary',
                    )}
                  >
                    <UserAvatar name={tradesman.name} lastName={tradesman.lastName} className="size-10" />
                    <span className="grid gap-1">
                      <span className="font-medium">{fullName(tradesman)}</span>
                      <span className="flex flex-wrap gap-1">
                        {tradesman.trades.map((each) => (
                          <Badge key={each} variant="secondary">
                            {TRADE_LABELS[each]}
                          </Badge>
                        ))}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Step>
        )}

        {tradesmanId && (
          <Step
            number={3}
            title="Día y hora de inicio"
            description="Los horarios de inicio van cada 30 minutos, en hora de Buenos Aires. El trabajo puede llevar más tiempo."
          >
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Día">
              {days.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={date === option ? 'default' : 'outline'}
                  aria-pressed={date === option}
                  title={formatLongDay(`${option}T12:00:00-03:00`)}
                  onClick={() => chooseDate(option)}
                  className="shrink-0 capitalize"
                >
                  {option === today ? 'Hoy' : option === addDays(today, 1) ? 'Mañana' : formatDayChip(option)}
                </Button>
              ))}
            </div>
            {!slots && <Skeleton className="mt-4 h-20" />}
            {slots?.length === 0 && (
              <p className="mt-4 text-muted-foreground">No hay horarios libres ese día. Probá con otro.</p>
            )}
            {slots && slots.length > 0 && (
              <div
                className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8"
                role="group"
                aria-label="Hora de inicio"
              >
                {slots.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={slot === option ? 'default' : 'outline'}
                    aria-pressed={slot === option}
                    onClick={() => setSlot(option)}
                  >
                    {formatTime(option)}
                  </Button>
                ))}
              </div>
            )}
          </Step>
        )}

        {slot && (
          <Step number={4} title="Contanos del trabajo" description="Lo ve el profesional antes de ir.">
            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
              {homes.length > 1 && (
                <Field>
                  <FieldLabel htmlFor="booking-home">Casa</FieldLabel>
                  <NativeSelect id="booking-home" name="propertyId" className="w-full">
                    {homes.map((home) => (
                      <NativeSelectOption key={home.id} value={home.id}>
                        {formatAddress(home.address)}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="booking-title">Título</FieldLabel>
                <Input id="booking-title" name="title" placeholder="Ej.: Pérdida en la canilla" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="booking-description">Descripción</FieldLabel>
                <Textarea id="booking-description" name="description" rows={3} required />
              </Field>
              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? 'Reservando…' : 'Reservar'}
                </Button>
              </div>
            </form>
          </Step>
        )}

        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  children: ReactNode;
}

function Step({ number, title, description, children }: StepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {number}
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
