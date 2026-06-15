import { cn } from '@/lib/cn';
import { discountedCents, formatPrice } from '@/lib/money';

export function Price({
  priceCents,
  discount = 0,
  currency = 'USD',
  locale = 'en',
  className,
}: {
  priceCents: number;
  discount?: number;
  currency?: string;
  locale?: string;
  className?: string;
}) {
  const final = discountedCents(priceCents, discount);
  return (
    <div className={cn('tabular flex items-baseline gap-2', className)}>
      <span className='font-semibold'>{formatPrice(final, currency, locale)}</span>
      {discount > 0 && (
        <span className='text-muted text-sm line-through'>{formatPrice(priceCents, currency, locale)}</span>
      )}
    </div>
  );
}
