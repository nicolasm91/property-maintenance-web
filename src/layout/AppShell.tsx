import { Outlet, useLocation } from 'react-router';
import { Badge } from '../components/ui/badge.tsx';
import { Separator } from '../components/ui/separator.tsx';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar.tsx';
import { TooltipProvider } from '../components/ui/tooltip.tsx';
import { useSession } from '../session.tsx';
import { PROFILE_LABELS } from '../user.ts';
import AppSidebar from './AppSidebar.tsx';
import { pageTitle } from './nav.ts';

export default function AppShell() {
  const { user } = useSession();
  const { pathname } = useLocation();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 data-vertical:h-4 data-vertical:self-center" />
            <h1 className="text-sm font-medium">{pageTitle(user.role, pathname)}</h1>
            <Badge variant="secondary" className="ml-auto">
              {PROFILE_LABELS[user.role]}
            </Badge>
          </header>
          <div className="flex-1 p-4 md:p-8">
            <div className="mx-auto w-full max-w-5xl">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
