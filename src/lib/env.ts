import { z } from 'zod';

/**
 * Validated, typed environment variables. Server-only.
 * Defaults keep the app booting in local dev before payment/secret values are set.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database — file-based SQLite via libSQL (no server to run). Point to a Turso URL in prod if desired.
  DATABASE_URL: z.string().min(1).default('file:./data/app.db'),
  DATABASE_AUTH_TOKEN: z.string().optional(),

  // Auth (custom JWT) — MUST be overridden in production.
  JWT_SECRET: z.string().min(1).default('dev-insecure-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // App
  NEXT_PUBLIC_BASE_URL: z.string().default('http://localhost:3000'),
  DEFAULT_LOCALE: z.string().default('en'),
  DEFAULT_CURRENCY: z.string().default('USD'),

  // Storage
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),

  // Stripe (test mode) — required from Phase 6 onward.
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Email (Resend) — required from Phase 11 onward.
  RESEND_API_KEY: z.string().optional(),
} as const);

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
