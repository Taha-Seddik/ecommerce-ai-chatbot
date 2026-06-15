'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Price } from '@/components/product/price';
import type { ProductCardData } from '@/features/products/products.types';
import { resolveWishlist } from '@/features/wishlist/wishlist.actions';
import { useWishlist } from '@/features/wishlist/wishlist.store';
import { WishlistButton } from '@/features/wishlist/wishlistButton';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/content';

export function WishlistGrid() {
  const t = useTranslations('wishlist');
  const locale = useLocale();
  const ids = useWishlist((s) => s.ids);
  const [items, setItems] = useState<ProductCardData[] | null>(null);

  useEffect(() => {
    let active = true;
    resolveWishlist(ids).then((r) => {
      if (active) setItems(r);
    });
    return () => {
      active = false;
    };
  }, [ids]);

  if (items && items.length === 0) {
    return (
      <div className='border-border flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-20 text-center'>
        <p className='font-display text-xl'>{t('empty')}</p>
        <p className='text-muted text-sm'>{t('emptyHint')}</p>
        <Link href='/products' className='text-accent mt-2 text-sm font-medium'>
          {t('browse')}
        </Link>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4'>
      {(items ?? []).map((p) => (
        <div key={p.id} className='group relative'>
          <WishlistButton productId={p.id} className='absolute top-3 right-3 z-10' />
          <Link href={`/products/${p.slug}`} className='block'>
            <div className='bg-surface-secondary relative aspect-square overflow-hidden rounded-xl'>
              {p.thumbnail && (
                <Image
                  src={p.thumbnail}
                  alt={pickLocale(p.title, locale)}
                  fill
                  sizes='(min-width: 1024px) 25vw, 50vw'
                  className='object-cover transition-transform duration-500 group-hover:scale-105'
                />
              )}
            </div>
            <div className='mt-3 flex flex-col gap-1'>
              <h3 className='leading-snug font-medium'>{pickLocale(p.title, locale)}</h3>
              <Price priceCents={p.priceCents} discount={p.discountPercentage} />
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
