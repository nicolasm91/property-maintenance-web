import PageHeader from '../components/PageHeader.tsx';
import UserAvatar from '../components/UserAvatar.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Card, CardContent, CardHeader } from '../components/ui/card.tsx';
import { Separator } from '../components/ui/separator.tsx';
import { useSession } from '../session.tsx';
import { formatAddress, fullName, PROFILE_LABELS, TRADE_LABELS } from '../user.ts';

export default function Profile() {
  const { user } = useSession();

  const rows: [string, string][] = [
    ['Email', user.email],
    ['Perfil', PROFILE_LABELS[user.role]],
  ];
  if (user.role === 'propertyManager') {
    rows.push(['Administración', user.administration?.name ?? 'Todavía no la creaste']);
  }
  if (user.role === 'contractor') {
    rows.push(['Empresa', user.company?.name ?? 'Todavía no la creaste']);
  }
  if (user.role === 'directClient') {
    user.homes.forEach((home, index) =>
      rows.push([user.homes.length > 1 ? `Casa ${index + 1}` : 'Casa', formatAddress(home.address)]),
    );
  }

  return (
    <>
      <PageHeader title="Mi perfil" />
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} lastName={user.lastName} className="size-14 text-lg" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">{fullName(user)}</p>
              <Badge variant="secondary">{PROFILE_LABELS[user.role]}</Badge>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          <dl className="divide-y">
            {rows.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-3 sm:grid-cols-3">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="sm:col-span-2">{value}</dd>
              </div>
            ))}
            {user.role === 'tradesman' && (
              <div className="grid gap-1 py-3 sm:grid-cols-3">
                <dt className="text-sm text-muted-foreground">Oficios</dt>
                <dd className="flex flex-wrap gap-1 sm:col-span-2">
                  {user.trades.length === 0
                    ? 'Ninguno todavía'
                    : user.trades.map((trade) => (
                        <Badge key={trade} variant="outline">
                          {TRADE_LABELS[trade]}
                        </Badge>
                      ))}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
