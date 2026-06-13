import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(9093),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),

  APP_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),

  // Database
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/kinnijije'),

  // Auth — JWT (tokens are returned in the response body; the frontend stores
  // them in sessionStorage).
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // AI provider. `openai` (default) uses the real OpenAI API; `mock` uses the
  // deterministic MockOpenAI (tests + credential-free local runs).
  AI_PROVIDER: z.enum(['openai', 'mock']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_VISION_MODEL: z.string().default('gpt-4o'),
  OPENAI_PARSE_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_GENERATE_MODEL: z.string().default('gpt-4o'),
  OPENAI_WHISPER_MODEL: z.string().default('whisper-1'),

  // Storage — external R2 file-service.
  FILE_SERVICE_URL: z.string().url().default('https://go-file-service-production.up.railway.app'),

  // Default recipe hero (until an admin uploads a real image per meal).
  RECIPE_PLACEHOLDER_IMAGE: z.string().default('/recipe-placeholder.png'),
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env: Env = parsed.data;

// Runtime guard: if the real OpenAI provider is selected, a key is required.
// Kept out of the schema so `mock` runs (tests, local) need no key at all.
if (env.AI_PROVIDER === 'openai' && env.NODE_ENV !== 'test' && !env.OPENAI_API_KEY) {
  throw new Error(
    'AI_PROVIDER=openai requires OPENAI_API_KEY. Set the key, or use AI_PROVIDER=mock for credential-free runs.',
  );
}
