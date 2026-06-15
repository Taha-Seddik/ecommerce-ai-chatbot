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

export function formatCurrency(cents: number, code: string, locale: string): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
