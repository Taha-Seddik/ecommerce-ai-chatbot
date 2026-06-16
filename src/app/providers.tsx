'use client';

import type { ReactNode } from 'react';
import { CurrencyProvider } from '@/features/currency/currencyProvider';

/** Client providers. HeroUI v3 needs no provider; we only wire the currency context. */
export function Providers({ children }: { children: ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
