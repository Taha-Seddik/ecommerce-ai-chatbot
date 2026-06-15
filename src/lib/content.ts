import type { LocalizedText } from '@/db/schema';

/** Pick the string for the active locale from a localized `{ en, fr }` value. */
export function pickLocale(value: LocalizedText | string | null | undefined, locale: string): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale as keyof LocalizedText] ?? value.en ?? '';
}
