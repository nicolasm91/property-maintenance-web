import { type FormEvent, useState } from 'react';
import {
  type OnboardRequest,
  PROFILE_LABELS,
  PROFILE_TYPES,
  type ProfileType,
  TRADE_LABELS,
  TRADES,
  type Trade,
} from './user.ts';

interface Props {
  onSubmit: (request: OnboardRequest) => Promise<void>;
}

export default function Onboarding({ onSubmit }: Props) {
  const [profileType, setProfileType] = useState<ProfileType>('propertyManager');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTrade = (trade: Trade) =>
    setTrades((current) => (current.includes(trade) ? current.filter((t) => t !== trade) : [...current, trade]));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (name: string) => {
      const value = form.get(name);
      return typeof value === 'string' ? value.trim() : '';
    };
    if (profileType === 'tradesman' && trades.length === 0) {
      setError('Elegí al menos un oficio.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        profileType,
        name: field('name'),
        middleName: field('middleName') || undefined,
        lastName: field('lastName'),
        administrationName: profileType === 'propertyManager' ? field('administrationName') : undefined,
        companyName: profileType === 'contractor' ? field('companyName') : undefined,
        trades: profileType === 'tradesman' ? trades : undefined,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo completar el registro.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <h1>Completá tu perfil</h1>

      <fieldset>
        <legend>¿Cómo vas a usar la app?</legend>
        {PROFILE_TYPES.map((type) => (
          <label key={type} className="option">
            <input
              type="radio"
              name="profileType"
              value={type}
              checked={profileType === type}
              onChange={() => setProfileType(type)}
            />
            {PROFILE_LABELS[type]}
          </label>
        ))}
      </fieldset>

      <label>
        Nombre
        <input name="name" required />
      </label>
      <label>
        Segundo nombre (opcional)
        <input name="middleName" />
      </label>
      <label>
        Apellido
        <input name="lastName" required />
      </label>

      {profileType === 'propertyManager' && (
        <label>
          Nombre de la administración
          <input name="administrationName" required />
        </label>
      )}
      {profileType === 'contractor' && (
        <label>
          Nombre de la empresa
          <input name="companyName" required />
        </label>
      )}
      {profileType === 'tradesman' && (
        <fieldset>
          <legend>Oficios</legend>
          {TRADES.map((trade) => (
            <label key={trade} className="option">
              <input type="checkbox" checked={trades.includes(trade)} onChange={() => toggleTrade(trade)} />
              {TRADE_LABELS[trade]}
            </label>
          ))}
        </fieldset>
      )}

      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Guardando…' : 'Continuar'}
      </button>
    </form>
  );
}
