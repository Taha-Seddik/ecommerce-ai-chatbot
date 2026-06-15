'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { CurrencyProvider } from '@/features/currency/currencyProvider';

/**
 * Client providers. HeroUI v3 needs NO provider; we wire next-themes (dark mode) and
 * the currency context (display-currency conversion).
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false} disableTransitionOnChange>
      <CurrencyProvider>{children}</CurrencyProvider>
    </ThemeProvider>
  );
}
