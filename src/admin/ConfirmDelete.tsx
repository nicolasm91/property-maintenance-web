import { useEffect, useState } from 'react';
import type { AdminUser } from './adminUser.ts';

interface Props {
  user: AdminUser;
  onConfirm: (user: AdminUser) => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDelete({ user, onConfirm, onCancel }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = [user.name, user.lastName].join(' ');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(user);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Error inesperado');
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-delete-title">¿Borrar a {name}?</h2>
        <p>
          Se borra <strong>{user.email}</strong> con todo lo que depende de su cuenta. No se puede deshacer.
        </p>
        <ul>
          <li>
            {user.tasks} {user.tasks === 1 ? 'tarea' : 'tareas'}, con su historial.
          </li>
          {user.homes > 0 && <li>{user.homes === 1 ? 'Su casa.' : `Sus ${user.homes} casas.`}</li>}
          {user.organization && <li>{user.organization.name}, si no le quedan otros miembros.</li>}
        </ul>
        <p>Su cuenta de Google queda libre para registrarse de nuevo.</p>
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="secondary" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button className="danger" onClick={() => void confirm()} disabled={busy}>
            {busy ? 'Borrando…' : 'Borrar usuario'}
          </button>
        </div>
      </div>
    </div>
  );
}
