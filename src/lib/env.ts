import { z } from 'zod';

/**
 * Validated, typed environment variables (server-only).
 * Dev-friendly defaults keep the app booting locally; production is hard-validated below so a
 * missing/weak secret fails fast at runtime instead of silently shipping an insecure app.
 */

// Enforce the production checks at runtime only — not during `next build` (so CI can build
// without production secrets). Next sets NEXT_PHASE to 'phase-production-build' while building.
const enforceProd = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Database — file-based SQLite via libSQL (no DB server). Point to a Turso URL in prod if desired.
    DATABASE_URL: z.string().min(1).default('file:./data/app.db'),
    DATABASE_AUTH_TOKEN: z.string().optional(),

    // Auth (custom JWT). A strong secret is REQUIRED in production (enforced below).
    JWT_SECRET: z.string().min(1).default('dev-insecure-secret-change-in-production'),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // App
    NEXT_PUBLIC_BASE_URL: z.string().default('http://localhost:4000'),
    DEFAULT_LOCALE: z.string().default('en'),
    DEFAULT_CURRENCY: z.string().default('USD'),

    // Storage
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),

    // Stripe (test mode). Optional — when unset, card checkout is hidden and only COD is offered.
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // AI shopping assistant (OpenAI). Optional — when unset, the chat widget is hidden.
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  })
  .superRefine((val, ctx) => {
    if (!enforceProd) return;
    if (val.JWT_SECRET.length < 32 || val.JWT_SECRET.startsWith('dev-')) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must be a strong, random 32+ character secret in production.',
      });
    }
    if (val.STRIPE_SECRET_KEY && !val.STRIPE_WEBHOOK_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['STRIPE_WEBHOOK_SECRET'],
        message: 'STRIPE_WEBHOOK_SECRET is required when Stripe is enabled.',
      });
    }
  });

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
