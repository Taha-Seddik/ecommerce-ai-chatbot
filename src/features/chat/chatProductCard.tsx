'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCurrency } from '@/features/currency/currencyProvider';
import { RatingStars } from '@/components/product/ratingStars';
import { discountedCents } from '@/lib/money';
import type { ChatProductCardData } from './chat.types';

/** Compact product card rendered inline inside an assistant message. */
export function ChatProductCard({ product, onNavigate }: { product: ChatProductCardData; onNavigate?: () => void }) {
  const t = useTranslations('product');
  const { format } = useCurrency();
  const priceLabel = format(discountedCents(product.priceCents, product.discountPercentage));
  const ariaLabel = `${product.title} — ${priceLabel}${product.inStock ? '' : `, ${t('outOfStock')}`}`;

  return (
    <Link
      href={`/products/${product.slug}`}
      onClick={onNavigate}
      aria-label={ariaLabel}
      className='border-border bg-surface hover:border-accent/40 group flex items-center gap-3 rounded-xl border p-2 transition-colors'>
      <span className='bg-surface-secondary relative size-16 shrink-0 overflow-hidden rounded-lg'>
        {product.thumbnail && (
          <Image
            src={product.thumbnail}
            alt=''
            fill
            sizes='64px'
            className='object-cover transition-transform duration-300 group-hover:scale-105'
          />
        )}
        {product.discountPercentage > 0 && (
          <span className='bg-sale text-sale-foreground absolute top-1 inset-s-1 rounded-full px-1.5 text-[10px] font-bold'>
            −{product.discountPercentage}%
          </span>
        )}
      </span>

      <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <span className='truncate text-sm font-medium'>{product.title}</span>
        {product.ratingCount > 0 && <RatingStars value={product.ratingAvg} count={product.ratingCount} />}
        <span className='flex items-baseline gap-2'>
          <span className='tabular text-sm font-semibold' suppressHydrationWarning>
            {format(discountedCents(product.priceCents, product.discountPercentage))}
          </span>
          {!product.inStock && <span className='text-muted text-xs'>{t('outOfStock')}</span>}
        </span>
      </span>
    </Link>
  );
}
