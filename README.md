# property-maintenance-web

Web app for the [Property Maintenance API](https://github.com/nicolasm91/property-maintenance-api). React + TypeScript + Vite, with sign-in through Auth0 (Google).

## Setup

```bash
pnpm install
cp .env.example .env   # then fill in the Auth0 values
pnpm dev               # http://localhost:5173
```

### Auth0

Besides the API registered for the backend (its identifier is `VITE_AUTH0_AUDIENCE`), the tenant needs:

1. A **Single Page Application**. Its Client ID is `VITE_AUTH0_CLIENT_ID`. Set `http://localhost:5173` as Allowed Callback URL, Allowed Logout URL, and Allowed Web Origin.
2. The **Google** social connection (`google-oauth2`), enabled for that application.
3. **Refresh Token Rotation** enabled on the application, since the app uses refresh tokens to keep the session.
4. For the superadmin panel, the **Username-Password-Authentication** database connection, enabled for that application, with sign-ups disabled. Platform owner accounts are created there by hand, with `app_metadata` `{ "role": "platformOwner" }` (see the API's [Platform owner accounts](https://github.com/nicolasm91/property-maintenance-api/blob/main/docs/system-design.md#73-platform-owner-accounts)).

## Superadmin panel

[http://localhost:5173/admin](http://localhost:5173/admin) signs in with a username and password (never Google) and lists every User, with filters by profile type and a search. Deleting a User removes them with their tasks, homes, and, if they were its last member, their administration or Company, so the same Google account can sign up again.

## Scripts

| Script              | Description                     |
| ------------------- | ------------------------------- |
| `pnpm dev`          | Development server.             |
| `pnpm build`        | Type-check and production build. |
| `pnpm test`         | Unit tests (Vitest).            |
| `pnpm lint`         | oxlint.                         |
| `pnpm format`       | oxfmt.                          |
