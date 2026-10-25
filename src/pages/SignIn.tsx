import { useAuth0 } from '@auth0/auth0-react';
import { CalendarCheck, Hammer, ShieldCheck, Wrench } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { Button } from '../components/ui/button.tsx';

const highlights = [
  { icon: Wrench, text: 'Profesionales de oficio cerca tuyo' },
  { icon: CalendarCheck, text: 'Reservás un turno en minutos' },
  { icon: ShieldCheck, text: 'Todo el historial de cada trabajo' },
];

export default function SignIn() {
  const { error, loginWithRedirect } = useAuth0();

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Hammer className="size-4" />
          </div>
          Property Maintenance
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl leading-tight font-semibold">El mantenimiento de tu casa o tu edificio, ordenado.</h2>
          <ul className="space-y-3 text-primary-foreground/80">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <Icon className="size-5" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/60">Hecho en Buenos Aires</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 font-semibold lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hammer className="size-4" />
            </div>
            Property Maintenance
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Ingresá a tu cuenta</h1>
            <p className="text-muted-foreground">
              Usá tu cuenta de Google. Si es la primera vez, te registrás en un paso.
            </p>
          </div>
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>No se pudo iniciar sesión: {error.message}</AlertDescription>
            </Alert>
          )}
          <Button
            size="lg"
            className="w-full"
            onClick={() => void loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })}
          >
            <GoogleIcon />
            Ingresar con Google
          </Button>
        </div>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  );
}
