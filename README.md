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

## Scripts

| Script              | Description                     |
| ------------------- | ------------------------------- |
| `pnpm dev`          | Development server.             |
| `pnpm build`        | Type-check and production build. |
| `pnpm test`         | Unit tests (Vitest).            |
| `pnpm lint`         | oxlint.                         |
| `pnpm format`       | oxfmt.                          |
