'use client';

import { IconCheck, IconChevronDown } from '@/components/ui/icons';
import { Popover } from '@/components/ui/popover';
import { useCurrency } from '@/features/currency/currencyProvider';
import { CURRENCIES, CURRENCY_CODES, type CurrencyCode } from '@/lib/currency';
import { cn } from '@/lib/cn';

const NAMES: Record<CurrencyCode, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  TND: 'Tunisian Dinar',
};

/** Currency picker — symbol badge + full name, polished popover. */
export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Popover
      ariaLabel='Currency'
      triggerClassName='hidden h-9 gap-1.5 rounded-md px-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex'
      trigger={(open) => (
        <>
          <span className='text-sm font-semibold'>{CURRENCIES[currency].symbol}</span>
          <span className='text-xs font-semibold tracking-wide'>{currency}</span>
          <IconChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
        </>
      )}>
      {(close) => (
        <>
          {CURRENCY_CODES.map((code) => (
            <button
              key={code}
              type='button'
              role='menuitemradio'
              aria-checked={code === currency}
              onClick={() => {
                setCurrency(code);
                close();
              }}
              className={cn(
                'hover:bg-surface-secondary flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors',
                code === currency && 'font-semibold',
              )}>
              <span className='bg-surface-secondary grid size-7 shrink-0 place-items-center rounded-md text-sm font-semibold'>
                {CURRENCIES[code].symbol}
              </span>
              <span className='flex-1 text-start'>{NAMES[code]}</span>
              <span className='text-muted text-xs'>{code}</span>
              {code === currency && <IconCheck className='text-accent size-4' />}
            </button>
          ))}
        </>
      )}
    </Popover>
  );
}
