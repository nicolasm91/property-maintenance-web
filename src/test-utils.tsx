import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { SessionContext } from './session.tsx';
import type { Trade, User } from './user.ts';

const base = {
  id: 'u1',
  email: 'ana@example.com',
  name: 'Ana',
  middleName: null,
  lastName: 'García',
};

export const directClient = {
  ...base,
  role: 'directClient' as const,
  homes: [
    {
      id: 'p1',
      address: { street: 'Av. Corrientes', number: '1234', postalCode: 'C1043', intersection: 'Talcahuano' },
    },
  ],
} satisfies User;

export const tradesman = {
  ...base,
  id: 't1',
  role: 'tradesman' as const,
  trades: ['plumber'] as Trade[],
  contractorId: null,
} satisfies User;

export const newManager = {
  ...base,
  role: 'propertyManager' as const,
  administration: null as { id: string; name: string } | null,
  administrationRole: null as 'admin' | 'member' | null,
} satisfies User;

export const newContractor = {
  ...base,
  role: 'contractor' as const,
  company: null as { id: string; name: string } | null,
} satisfies User;

// Renders a page of the onboarded app; `path` shows where it navigated to.
export function renderPage(ui: ReactNode, { user, setUser = vi.fn() }: { user: User; setUser?: (user: User) => void }) {
  return render(
    <MemoryRouter>
      <SessionContext.Provider value={{ user, setUser, signOut: vi.fn() }}>
        <Routes>
          <Route path="/" element={ui} />
          <Route path="*" element={<p>navigated</p>} />
        </Routes>
      </SessionContext.Provider>
    </MemoryRouter>,
  );
}
