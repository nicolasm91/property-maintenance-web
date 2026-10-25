import { useState } from 'react';
import { toast } from 'sonner';
import { useApi } from '../api.ts';
import MunicipalitiesPicker from '../components/MunicipalitiesPicker.tsx';
import PageHeader from '../components/PageHeader.tsx';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { useSession } from '../session.tsx';
import type { MunicipalitySummary, User } from '../user.ts';

export default function Zones() {
  const { user, setUser } = useSession();
  const api = useApi();
  const [zones, setZones] = useState<MunicipalitySummary[]>(user.role === 'tradesman' ? user.municipalities : []);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      setUser(await api<User>('PUT', '/me/municipalities', { municipalityIds: zones.map((zone) => zone.id) }));
      toast.success('Zonas guardadas.');
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Mis zonas" description="Los clientes te encuentran solo en las localidades donde trabajás." />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>¿Dónde trabajás?</CardTitle>
          <CardDescription>
            Elegí las localidades donde podés garantizar el servicio. Sin ninguna, no aparecés en las búsquedas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MunicipalitiesPicker value={zones} onChange={setZones} />
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled={saving} onClick={() => void save()}>
            {saving ? 'Guardando…' : 'Guardar zonas'}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
