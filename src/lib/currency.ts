/** Display currencies. Base = USD; `rateToBase` is scaled ×1_000_000 to avoid floats. */
export const CURRENCIES = {
  USD: { symbol: '$', rateToBase: 1_000_000 },
  EUR: { symbol: '€', rateToBase: 920_000 },
  TND: { symbol: 'DT', rateToBase: 3_100_000 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];
export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

export function isCurrency(code: string | undefined): code is CurrencyCode {
  return !!code && code in CURRENCIES;
}

/** Convert integer base (USD) cents into the target currency's minor units. */
export function convertFromBase(baseCents: number, code: CurrencyCode): number {
  return Math.round((baseCents * CURRENCIES[code].rateToBase) / 1_000_000);
}

/** Number of decimal places Stripe uses per currency (most are 2; TND is a 3-decimal currency). */
const STRIPE_DECIMALS: Record<CurrencyCode, number> = { USD: 2, EUR: 2, TND: 3 };

/**
 * Scale an internal 2-decimal cents amount to the currency's true Stripe minor unit.
 * Without this, a 3-decimal currency like TND (millimes) would be charged 10× too little.
 */
export function toStripeMinorUnits(cents: number, code: CurrencyCode): number {
  return Math.round(cents * 10 ** (STRIPE_DECIMALS[code] - 2));
}

export function formatCurrency(cents: number, code: string, locale: string): string {
  // `ar-u-nu-latn` keeps Latin digits for readable prices while respecting Arabic conventions.
  const bcp47 = locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-u-nu-latn' : 'en-US';
  return new Intl.NumberFormat(bcp47, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
