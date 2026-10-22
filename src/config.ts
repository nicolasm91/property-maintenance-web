function required(name: string): string {
  const value: unknown = import.meta.env[name];
  if (typeof value !== 'string' || value === '') {
    throw new Error(`Missing environment variable ${name} (see .env.example)`);
  }
  return value;
}

export const config = {
  auth0Domain: required('VITE_AUTH0_DOMAIN'),
  auth0ClientId: required('VITE_AUTH0_CLIENT_ID'),
  auth0Audience: required('VITE_AUTH0_AUDIENCE'),
  apiUrl: required('VITE_API_URL'),
};
