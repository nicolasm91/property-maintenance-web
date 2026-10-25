import { useState } from 'react';
import { useApi } from './api.ts';
import { TRADE_LABELS, TRADES, type Trade, type User } from './user.ts';

interface Props {
  trades: Trade[];
  onSaved: (user: User) => void;
}

export default function TradesEditor({ trades: initialTrades, onSaved }: Props) {
  const api = useApi();
  const [trades, setTrades] = useState(initialTrades);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const toggle = (trade: Trade) =>
    setTrades((current) => (current.includes(trade) ? current.filter((t) => t !== trade) : [...current, trade]));

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      onSaved(await api<User>('PUT', '/me/trades', { trades }));
      setStatus({ ok: true, text: 'Oficios guardados.' });
    } catch (saveError) {
      setStatus({ ok: false, text: saveError instanceof Error ? saveError.message : 'Error inesperado' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <fieldset>
        <legend>Tus oficios</legend>
        {TRADES.map((trade) => (
          <label key={trade} className="option">
            <input type="checkbox" checked={trades.includes(trade)} onChange={() => toggle(trade)} />
            {TRADE_LABELS[trade]}
          </label>
        ))}
      </fieldset>
      <button className="secondary" disabled={saving} onClick={() => void save()}>
        {saving ? 'Guardando…' : 'Guardar oficios'}
      </button>
      {status && <p role={status.ok ? 'status' : 'alert'}>{status.text}</p>}
    </section>
  );
}
