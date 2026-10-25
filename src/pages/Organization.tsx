import { useAuth0 } from '@auth0/auth0-react';
import { Briefcase, Building2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { useApi } from '../api.ts';
import PageHeader from '../components/PageHeader.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Field, FieldDescription, FieldLabel } from '../components/ui/field.tsx';
import { Input } from '../components/ui/input.tsx';
import { useSession } from '../session.tsx';
import type { User } from '../user.ts';

// The property manager's administration or the contractor's Company.
export default function Organization() {
  const { user, setUser } = useSession();
  const { getAccessTokenSilently } = useAuth0();
  const api = useApi();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user.role !== 'propertyManager' && user.role !== 'contractor') {
    return null;
  }
  const isAdministration = user.role === 'propertyManager';
  const organization = isAdministration ? user.administration : user.company;
  const noun = isAdministration ? 'administración' : 'empresa';
  const Icon = isAdministration ? Building2 : Briefcase;

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('name');
    const name = typeof value === 'string' ? value.trim() : '';
    setCreating(true);
    setError(null);
    try {
      const updated = await api<User>('POST', isAdministration ? '/me/administration' : '/me/company', { name });
      if (isAdministration) {
        // The administration travels in the token's claims: get a new token.
        await getAccessTokenSilently({ cacheMode: 'off' });
      }
      setUser(updated);
      toast.success(`Creaste ${name}.`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Error inesperado');
      setCreating(false);
    }
  };

  if (!organization) {
    return (
      <>
        <PageHeader title={isAdministration ? 'Tu administración' : 'Tu empresa'} />
        <form onSubmit={(event) => void create(event)} className="max-w-xl">
          <Card>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <CardTitle>Creá tu {noun}</CardTitle>
              <CardDescription>
                {isAdministration
                  ? 'Vas a ser su admin. Después vas a poder sumar edificios y a otras personas de tu equipo.'
                  : 'Es la empresa con la que vas a recibir trabajos y sumar profesionales.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="organization-name">Nombre de la {noun}</FieldLabel>
                <Input id="organization-name" name="name" required autoFocus />
                <FieldDescription>Lo ven tus clientes y tu equipo.</FieldDescription>
              </Field>
              {error && (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" disabled={creating}>
                {creating ? 'Creando…' : `Crear ${noun}`}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </>
    );
  }

  return (
    <>
      <PageHeader title={organization.name} description={isAdministration ? 'Tu administración' : 'Tu empresa'} />
      <Card className="max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <CardTitle>{organization.name}</CardTitle>
              <CardDescription>
                {user.role === 'propertyManager' && user.administrationRole === 'admin' ? (
                  <Badge variant="secondary">Admin</Badge>
                ) : (
                  'Miembro'
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isAdministration
            ? 'Pronto vas a poder cargar tus edificios, invitar a tu equipo y pedir trabajos desde acá.'
            : 'Pronto vas a poder recibir trabajos y sumar a tus profesionales desde acá.'}
        </CardContent>
      </Card>
    </>
  );
}
