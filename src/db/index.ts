import 'server-only';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '@/lib/env';
import * as schema from './schema';

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

// SQLite ships with foreign-key enforcement OFF; turn it on so ON DELETE CASCADE works.
void client.execute('PRAGMA foreign_keys = ON;').catch(() => {});

// `casing: 'snake_case'` lets us declare columns in camelCase in TS and store snake_case in the DB.
export const db = drizzle(client, { schema, casing: 'snake_case' });

export { schema };
