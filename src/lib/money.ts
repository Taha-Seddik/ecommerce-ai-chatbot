/** Money helpers. Prices are stored as integer minor units (cents). */

const localeTag = (locale: string) => (locale === 'fr' ? 'fr-FR' : 'en-US');

export function formatPrice(cents: number, currency = 'USD', locale = 'en'): string {
  return new Intl.NumberFormat(localeTag(locale), {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Apply a whole-percent discount, returning integer cents. */
export function discountedCents(cents: number, discountPct = 0): number {
  if (!discountPct) return cents;
  return Math.round(cents * (1 - discountPct / 100));
}
