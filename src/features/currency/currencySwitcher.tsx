'use client';

import type { ChangeEvent } from 'react';
import { useCurrency } from '@/features/currency/currencyProvider';
import { type CurrencyCode, CURRENCY_CODES } from '@/lib/currency';

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  return (
    <select
      value={currency}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value as CurrencyCode)}
      aria-label='Currency'
      className='hover:bg-surface-secondary rounded-lg bg-transparent px-1.5 py-1 font-mono text-xs transition-colors outline-none'>
      {CURRENCY_CODES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
