// Centralised env access — never read import.meta.env scattered across the app.
// Fails loudly at startup if a required var is missing (frontend guide §3).
function requireEnv(key: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const ENV = {
  API_BASE_URL: requireEnv('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
  APP_ENV: import.meta.env.VITE_APP_ENV ?? 'development',
} as const;
