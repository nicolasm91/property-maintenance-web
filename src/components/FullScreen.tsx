import type { ReactNode } from 'react';

export default function FullScreen({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-muted/40 p-6 text-center">
      {children}
    </main>
  );
}
