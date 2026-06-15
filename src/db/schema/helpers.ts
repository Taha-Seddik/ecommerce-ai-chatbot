import { createId } from '@paralleldrive/cuid2';
import { integer, text } from 'drizzle-orm/sqlite-core';

/** Translatable text stored as a single JSON column, selected by locale in the repo layer. */
export type LocalizedText = { en: string; fr: string };

/** cuid2 primary key — generated in app code, identical on file SQLite and Turso. */
export const pk = () =>
  text()
    .primaryKey()
    .$defaultFn(() => createId());

/** `created_at` + `updated_at` timestamp columns (fresh builders per call). */
export const timestamps = () => ({
  createdAt: integer({ mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/** `created_at` only (for append-only rows like reviews). */
export const createdAt = () =>
  integer({ mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date());
