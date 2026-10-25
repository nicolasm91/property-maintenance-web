import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { SessionContext } from './session.tsx';
import type { MunicipalitySummary, Trade, User } from './user.ts';

const base = {
  id: 'u1',
  email: 'ana@example.com',
  name: 'Ana',
  middleName: null,
  lastName: 'García',
};

export const comuna1 = { id: '022007', name: 'Comuna 1', provinceName: 'Ciudad Autónoma de Buenos Aires' };

// Answers the catalog requests the locality pickers make.
export function catalogResponse(path: string): unknown {
  if (path === '/provinces') {
    return [
      { id: '02', name: 'Ciudad Autónoma de Buenos Aires' },
      { id: '06', name: 'Buenos Aires' },
    ];
  }
  if (path.startsWith('/municipalities')) {
    return [
      { id: '022007', name: 'Comuna 1', provinceId: '02', provinceName: 'Ciudad Autónoma de Buenos Aires' },
      { id: '022014', name: 'Comuna 2', provinceId: '02', provinceName: 'Ciudad Autónoma de Buenos Aires' },
    ];
  }
  return undefined;
}

export const directClient = {
  ...base,
  role: 'directClient' as const,
  homes: [
    {
      id: 'p1',
      address: { street: 'Av. Corrientes', number: '1234', postalCode: 'C1043', intersection: 'Talcahuano' },
      municipality: comuna1 as MunicipalitySummary | null,
    },
  ],
} satisfies User;

export const tradesman = {
  ...base,
  id: 't1',
  role: 'tradesman' as const,
  trades: ['plumber'] as Trade[],
  contractorId: null,
  municipalities: [comuna1] as MunicipalitySummary[],
  ratingAverage: null as number | null,
  ratingCount: 0,
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
