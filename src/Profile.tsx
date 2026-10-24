import { PROFILE_LABELS, TRADE_LABELS, type User } from './user.ts';

export default function Profile({ user }: { user: User }) {
  return (
    <section>
      <h1>
        Hola, {user.name} {user.lastName}
      </h1>
      <p>{user.email}</p>
      <p>Perfil: {PROFILE_LABELS[user.role]}</p>
      {user.role === 'propertyManager' && (
        <p>
          Administración: {user.administration.name} ({user.administrationRole === 'admin' ? 'admin' : 'miembro'})
        </p>
      )}
      {user.role === 'contractor' && <p>Empresa: {user.company.name}</p>}
      {user.role === 'tradesman' && <p>Oficios: {user.trades.map((trade) => TRADE_LABELS[trade]).join(', ')}</p>}
    </section>
  );
}
