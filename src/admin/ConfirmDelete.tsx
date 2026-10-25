import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog.tsx';
import { Button } from '../components/ui/button.tsx';
import type { AdminUser } from './adminUser.ts';

interface Props {
  user: AdminUser | null;
  onConfirm: (user: AdminUser) => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDelete({ user, onConfirm, onCancel }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async (target: AdminUser) => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(target);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) {
          setError(null);
          onCancel();
        }
      }}
    >
      {user && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Borrar a {user.name} {user.lastName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se borra <strong>{user.email}</strong> con todo lo que depende de su cuenta. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              {user.tasks} {user.tasks === 1 ? 'tarea' : 'tareas'}, con su historial.
            </li>
            {user.homes > 0 && <li>{user.homes === 1 ? 'Su casa.' : `Sus ${user.homes} casas.`}</li>}
            {user.organization && <li>{user.organization.name}, si no le quedan otros miembros.</li>}
            <li>Su cuenta de Google queda libre para registrarse de nuevo.</li>
          </ul>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" disabled={busy} onClick={() => void confirm(user)}>
              {busy ? 'Borrando…' : 'Borrar usuario'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
