import { Briefcase, Building2, Hammer, House, type LucideIcon, Wrench } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import MunicipalitiesPicker from '../components/MunicipalitiesPicker.tsx';
import MunicipalitySelect from '../components/MunicipalitySelect.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Checkbox } from '../components/ui/checkbox.tsx';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '../components/ui/field.tsx';
import { Input } from '../components/ui/input.tsx';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group.tsx';
import {
  type MunicipalitySummary,
  type OnboardRequest,
  PROFILE_DESCRIPTIONS,
  PROFILE_LABELS,
  PROFILE_TYPES,
  type ProfileType,
  TRADE_LABELS,
  TRADES,
  type Trade,
} from '../user.ts';

interface Props {
  onSubmit: (request: OnboardRequest) => Promise<void>;
  onSignOut: () => void;
}

const PROFILE_ICONS: Record<ProfileType, LucideIcon> = {
  propertyManager: Building2,
  directClient: House,
  contractor: Briefcase,
  tradesman: Wrench,
};

export default function Onboarding({ onSubmit, onSignOut }: Props) {
  const [profileType, setProfileType] = useState<ProfileType>('directClient');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [homeMunicipality, setHomeMunicipality] = useState<MunicipalitySummary | null>(null);
  const [zones, setZones] = useState<MunicipalitySummary[]>([]);
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
    if (profileType === 'tradesman' && zones.length === 0) {
      setError('Elegí al menos una localidad donde trabajes.');
      return;
    }
    if (profileType === 'directClient' && !homeMunicipality) {
      setError('Elegí la localidad de tu casa.');
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
        home:
          profileType === 'directClient'
            ? {
                street: field('street'),
                number: field('number'),
                postalCode: field('postalCode'),
                intersection: field('intersection'),
                municipalityId: homeMunicipality!.id,
              }
            : undefined,
        trades: profileType === 'tradesman' ? trades : undefined,
        municipalityIds: profileType === 'tradesman' ? zones.map((zone) => zone.id) : undefined,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo completar el registro.');
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-svh justify-center bg-muted/40 p-4 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hammer className="size-4" />
            </div>
            Property Maintenance
          </div>
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            Salir
          </Button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Completá tu perfil</CardTitle>
              <CardDescription>Contanos quién sos y cómo vas a usar la app.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>¿Cómo vas a usar la app?</FieldLegend>
                  <RadioGroup
                    value={profileType}
                    onValueChange={(value) => setProfileType(value as ProfileType)}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {PROFILE_TYPES.map((type) => {
                      const Icon = PROFILE_ICONS[type];
                      return (
                        <label
                          key={type}
                          htmlFor={`profile-${type}`}
                          className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                        >
                          <RadioGroupItem id={`profile-${type}`} value={type} aria-label={PROFILE_LABELS[type]} />
                          <Icon className="size-5 shrink-0 text-muted-foreground" />
                          <span className="grid gap-1 leading-tight">
                            <span className="font-medium">{PROFILE_LABELS[type]}</span>
                            <span className="text-sm text-muted-foreground">{PROFILE_DESCRIPTIONS[type]}</span>
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </FieldSet>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="name">Nombre</FieldLabel>
                    <Input id="name" name="name" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="middleName">Segundo nombre (opcional)</FieldLabel>
                    <Input id="middleName" name="middleName" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                    <Input id="lastName" name="lastName" required />
                  </Field>
                </div>

                {profileType === 'directClient' && (
                  <FieldSet>
                    <FieldLegend>Tu casa</FieldLegend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="street">Calle</FieldLabel>
                        <Input id="street" name="street" required />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="number">Número</FieldLabel>
                        <Input id="number" name="number" required />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="postalCode">Código postal</FieldLabel>
                        <Input id="postalCode" name="postalCode" required />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="intersection">Entre calles</FieldLabel>
                        <Input id="intersection" name="intersection" required />
                      </Field>
                    </div>
                    <MunicipalitySelect id="home" value={homeMunicipality} onChange={setHomeMunicipality} />
                  </FieldSet>
                )}

                {profileType === 'tradesman' && (
                  <FieldSet>
                    <FieldLegend>Oficios</FieldLegend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {TRADES.map((trade) => (
                        <Field key={trade} orientation="horizontal">
                          <Checkbox
                            id={`trade-${trade}`}
                            checked={trades.includes(trade)}
                            onCheckedChange={() => toggleTrade(trade)}
                          />
                          <FieldLabel htmlFor={`trade-${trade}`} className="font-normal">
                            {TRADE_LABELS[trade]}
                          </FieldLabel>
                        </Field>
                      ))}
                    </div>
                  </FieldSet>
                )}

                {profileType === 'tradesman' && (
                  <FieldSet>
                    <FieldLegend>¿Dónde trabajás?</FieldLegend>
                    <p className="text-sm text-muted-foreground">
                      Elegí las localidades donde podés garantizar el servicio. Te buscan por localidad.
                    </p>
                    <MunicipalitiesPicker value={zones} onChange={setZones} />
                  </FieldSet>
                )}

                {(profileType === 'propertyManager' || profileType === 'contractor') && (
                  <p className="text-sm text-muted-foreground">
                    Después de registrarte vas a poder crear tu{' '}
                    {profileType === 'propertyManager' ? 'administración' : 'empresa'}.
                  </p>
                )}

                {error && (
                  <Alert variant="destructive" role="alert">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Continuar'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </main>
  );
}
