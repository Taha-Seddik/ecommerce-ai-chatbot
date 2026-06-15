import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/** Key/JSON settings store — drives the homepage CMS (carousel, hero, featured picks). */
export const settings = sqliteTable('settings', {
  key: text().primaryKey(),
  settingsData: text({ mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  updatedAt: integer({ mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/** Supported display currencies. `rateToBase` is scaled ×1_000_000 to avoid floats. */
export const currencies = sqliteTable('currencies', {
  code: text().primaryKey(),
  symbol: text().notNull(),
  rateToBase: integer().notNull(),
  isDefault: integer({ mode: 'boolean' }).notNull().default(false),
});
