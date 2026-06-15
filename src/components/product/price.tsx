'use client';

import { useCurrency } from '@/features/currency/currencyProvider';
import { cn } from '@/lib/cn';
import { discountedCents } from '@/lib/money';

/** Prices are stored in base (USD) cents; the active currency context handles conversion + formatting. */
export function Price({
  priceCents,
  discount = 0,
  className,
}: {
  priceCents: number;
  discount?: number;
  className?: string;
}) {
  const { format } = useCurrency();
  const final = discountedCents(priceCents, discount);
  // suppressHydrationWarning: server renders the default currency; the client may differ via cookie.
  return (
    <div className={cn('tabular flex items-baseline gap-2', className)} suppressHydrationWarning>
      <span className='font-semibold'>{format(final)}</span>
      {discount > 0 && <span className='text-muted text-sm line-through'>{format(priceCents)}</span>}
    </div>
  );
}
