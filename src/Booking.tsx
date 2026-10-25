import { type FormEvent, useEffect, useState } from 'react';
import { ApiError, useApi } from './api.ts';
import { formatTime, todayInPlatform } from './dates.ts';
import { type BookRequest, fullName, type Task, type Tradesman } from './tasks.ts';
import { formatAddress, type Home, TRADE_LABELS, TRADES, type Trade } from './user.ts';

interface Props {
  homes: Home[];
  onBooked: () => void;
}

const message = (error: unknown) => (error instanceof Error ? error.message : 'Error inesperado');

export default function Booking({ homes, onBooked }: Props) {
  const api = useApi();
  const today = todayInPlatform();
  const [trade, setTrade] = useState<Trade | ''>('');
  const [tradesmen, setTradesmen] = useState<Tradesman[] | null>(null);
  const [tradesmanId, setTradesmanId] = useState('');
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsVersion, setSlotsVersion] = useState(0);
  const [slot, setSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<Task | null>(null);

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

  const chooseTrade = (value: Trade | '') => {
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
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const field = (name: string) => {
      const value = form.get(name);
      return typeof value === 'string' ? value.trim() : '';
    };
    const request: BookRequest = {
      tradesmanId,
      propertyId: field('propertyId') || homes[0].id,
      trade: trade as Trade,
      title: field('title'),
      description: field('description'),
      scheduledAt: slot,
    };
    setSubmitting(true);
    setError(null);
    setBooked(null);
    try {
      setBooked(await api<Task>('POST', '/tasks', request));
      formElement.reset();
      setSlot('');
      onBooked();
    } catch (submitError) {
      setError(
        submitError instanceof ApiError && submitError.status === 409
          ? 'Ese turno ya no está disponible. Elegí otro.'
          : message(submitError),
      );
    } finally {
      setSubmitting(false);
      setSlotsVersion((version) => version + 1);
    }
  };

  return (
    <section>
      <h2>Reservar un profesional</h2>

      <label>
        Oficio
        <select value={trade} onChange={(event) => chooseTrade(event.target.value as Trade | '')}>
          <option value="">Elegí un oficio</option>
          {TRADES.map((option) => (
            <option key={option} value={option}>
              {TRADE_LABELS[option]}
            </option>
          ))}
        </select>
      </label>

      {tradesmen?.length === 0 && <p>No hay profesionales disponibles para ese oficio.</p>}
      {tradesmen && tradesmen.length > 0 && (
        <label>
          Profesional
          <select value={tradesmanId} onChange={(event) => chooseTradesman(event.target.value)}>
            <option value="">Elegí un profesional</option>
            {tradesmen.map((tradesman) => (
              <option key={tradesman.id} value={tradesman.id}>
                {fullName(tradesman)}
              </option>
            ))}
          </select>
        </label>
      )}

      {tradesmanId && (
        <label>
          Día
          <input type="date" min={today} value={date} onChange={(event) => chooseDate(event.target.value)} />
        </label>
      )}

      {slots?.length === 0 && <p>No hay turnos libres ese día.</p>}
      {slots && slots.length > 0 && (
        <fieldset className="slots">
          <legend>Horario</legend>
          {slots.map((option) => (
            <label key={option} className="option">
              <input
                type="radio"
                name="slot"
                value={option}
                checked={slot === option}
                onChange={() => setSlot(option)}
              />
              {formatTime(option)}
            </label>
          ))}
        </fieldset>
      )}

      {slot && (
        <form onSubmit={(event) => void handleSubmit(event)}>
          {homes.length > 1 && (
            <label>
              Casa
              <select name="propertyId">
                {homes.map((home) => (
                  <option key={home.id} value={home.id}>
                    {formatAddress(home.address)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Título
            <input name="title" required />
          </label>
          <label>
            Descripción
            <textarea name="description" required rows={3} />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Reservando…' : 'Reservar'}
          </button>
        </form>
      )}

      {error && <p role="alert">{error}</p>}
      {booked && <p role="status">Listo, reservaste el turno: {booked.title}.</p>}
    </section>
  );
}
