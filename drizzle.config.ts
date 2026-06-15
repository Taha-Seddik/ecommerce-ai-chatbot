import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs outside Next, so load .env ourselves (Node 20.6+ built-in, no dotenv dep).
try {
  process.loadEnvFile('.env');
} catch {
  // .env is optional; defaults below cover local dev.
}

export default defineConfig({
  dialect: 'turso', // libSQL — works with both a local file: URL and a hosted Turso URL.
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:./data/app.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  casing: 'snake_case',
  verbose: true,
  strict: true,
});
