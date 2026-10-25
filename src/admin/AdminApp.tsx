import { useAuth0 } from '@auth0/auth0-react';
import { ShieldCheck } from 'lucide-react';
import FullScreen from '../components/FullScreen.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Skeleton } from '../components/ui/skeleton.tsx';
import AdminUsers from './AdminUsers.tsx';
import { isPasswordAccount, PASSWORD_CONNECTION } from './adminUser.ts';

export default function AdminApp() {
  const { isLoading, isAuthenticated, user, error, loginWithRedirect, logout } = useAuth0();
  const signOut = () => void logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) {
    return (
      <FullScreen>
        <Skeleton className="h-48 w-80 rounded-xl" />
      </FullScreen>
    );
  }

  if (!isAuthenticated || !isPasswordAccount(user?.sub)) {
    return (
      <FullScreen>
        <Card className="w-full max-w-sm text-left">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-xl">Panel de administración</CardTitle>
            <CardDescription>Ingresá con tu usuario y contraseña de administración.</CardDescription>
          </CardHeader>
          {(error || isAuthenticated) && (
            <CardContent>
              <Alert variant="destructive" role="alert">
                <AlertDescription>
                  {isAuthenticated
                    ? `Entraste con Google (${user?.email}). El panel solo acepta cuentas de administración con usuario y contraseña.`
                    : `No se pudo iniciar sesión: ${error?.message}`}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
          <CardFooter>
            {isAuthenticated ? (
              <Button className="w-full" onClick={signOut}>
                Salir
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() =>
                  void loginWithRedirect({
                    authorizationParams: { connection: PASSWORD_CONNECTION },
                    appState: { returnTo: '/admin' },
                  })
                }
              >
                Ingresar con usuario y contraseña
              </Button>
            )}
          </CardFooter>
        </Card>
      </FullScreen>
    );
  }

  return <AdminUsers email={user?.email ?? user?.name ?? ''} onSignOut={signOut} />;
}
