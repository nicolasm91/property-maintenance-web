import { useState } from 'react';
import { toast } from 'sonner';
import { useApi } from '../api.ts';
import PageHeader from '../components/PageHeader.tsx';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Checkbox } from '../components/ui/checkbox.tsx';
import { Field, FieldLabel } from '../components/ui/field.tsx';
import { useSession } from '../session.tsx';
import { TRADE_LABELS, TRADES, type Trade, type User } from '../user.ts';

export default function Trades() {
  const { user, setUser } = useSession();
  const api = useApi();
  const [trades, setTrades] = useState<Trade[]>(user.role === 'tradesman' ? user.trades : []);
  const [saving, setSaving] = useState(false);

  const toggle = (trade: Trade) =>
    setTrades((current) => (current.includes(trade) ? current.filter((t) => t !== trade) : [...current, trade]));

  const save = async () => {
    setSaving(true);
    try {
      setUser(await api<User>('PUT', '/me/trades', { trades }));
      toast.success('Oficios guardados.');
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Mis oficios" description="Los clientes te encuentran por estos oficios." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>¿En qué trabajás?</CardTitle>
          <CardDescription>Elegí todos los que hagas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {TRADES.map((trade) => (
            <Field key={trade} orientation="horizontal">
              <Checkbox id={`trade-${trade}`} checked={trades.includes(trade)} onCheckedChange={() => toggle(trade)} />
              <FieldLabel htmlFor={`trade-${trade}`} className="font-normal">
                {TRADE_LABELS[trade]}
              </FieldLabel>
            </Field>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled={saving} onClick={() => void save()}>
            {saving ? 'Guardando…' : 'Guardar oficios'}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
