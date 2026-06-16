'use client';

import { Select } from '@/components/ui/select';
import { useCurrency } from '@/features/currency/currencyProvider';
import { type CurrencyCode, CURRENCY_CODES } from '@/lib/currency';

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  return (
    <Select
      value={currency}
      options={CURRENCY_CODES.map((c) => ({ value: c, label: c }))}
      onChange={(v) => setCurrency(v as CurrencyCode)}
      ariaLabel='Currency'
      align='end'
      className='hidden sm:block'
    />
  );
}
