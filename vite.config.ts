import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    // CI has no .env, and config.ts requires these as soon as api.ts is imported.
    env: {
      VITE_AUTH0_DOMAIN: 'test.auth0.com',
      VITE_AUTH0_CLIENT_ID: 'test-client-id',
      VITE_AUTH0_AUDIENCE: 'https://property-maintenance-api',
      VITE_API_URL: 'http://localhost:3000',
    },
  },
});
