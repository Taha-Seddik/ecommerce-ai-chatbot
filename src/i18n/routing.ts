import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix the URL with the locale (/en, /fr) so language is explicit and shareable.
  localePrefix: 'always',
});
