'use client';

import { useLocale } from 'next-intl';
import { type ReactNode, createContext, useContext, useState } from 'react';
import { type CurrencyCode, DEFAULT_CURRENCY, convertFromBase, formatCurrency, isCurrency } from '@/lib/currency';

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  /** Format integer base (USD) cents in the active display currency. */
  format: (baseCents: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/** Read the cookie client-side so the layout can stay static (no cookies() in RSC). */
function readCookieCurrency(): CurrencyCode {
  if (typeof document === 'undefined') return DEFAULT_CURRENCY;
  const match = document.cookie.match(/(?:^|; )currency=([^;]+)/);
  return isCurrency(match?.[1]) ? (match![1] as CurrencyCode) : DEFAULT_CURRENCY;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [currency, setCurrencyState] = useState<CurrencyCode>(readCookieCurrency);

  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c);
    document.cookie = `currency=${c}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }

  const format = (baseCents: number) => formatCurrency(convertFromBase(baseCents, currency), currency, locale);

  return <CurrencyContext.Provider value={{ currency, setCurrency, format }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
