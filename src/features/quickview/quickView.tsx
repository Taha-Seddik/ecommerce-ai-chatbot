'use client';

import { Button } from '@heroui/react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { type MouseEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Price } from '@/components/product/price';
import { RatingStars } from '@/components/product/ratingStars';
import { persistCartAction } from '@/features/cart/cart.actions';
import { useGuestCart } from '@/features/cart/cart.store';
import { type QuickViewData, getQuickView } from '@/features/quickview/quickview.actions';
import { Link } from '@/i18n/navigation';

export function QuickView({ slug }: { slug: string }) {
  const t = useTranslations('product');
  const locale = useLocale();
  const add = useGuestCart((s) => s.add);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<QuickViewData | null>(null);
  const [added, setAdded] = useState(false);

  function openModal(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    getQuickView(slug, locale).then(setData);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  function addToCart() {
    if (!data) return;
    add(data.id, 1);
    persistCartAction(useGuestCart.getState().lines);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <>
      <button
        type='button'
        onClick={openModal}
        className='bg-surface/95 text-foreground shadow-soft hover:bg-surface absolute inset-x-3 bottom-3 translate-y-2 rounded-full py-2 text-center text-sm font-medium opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100'>
        {t('quickView')}
      </button>

      {open &&
        createPortal(
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4' role='dialog' aria-modal='true'>
            <button type='button' aria-label='Close' className='animate-in fade-in absolute inset-0 bg-black/50' onClick={() => setOpen(false)} />
            <div className='bg-surface shadow-lifted animate-in zoom-in-95 relative grid max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl duration-200 md:grid-cols-2'>
              <button
                type='button'
                onClick={() => setOpen(false)}
                aria-label='Close'
                className='bg-surface/80 hover:bg-surface absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full text-lg'>
                ×
              </button>
              <div className='bg-surface-secondary relative aspect-square'>
                {data?.image && <Image src={data.image} alt={data.title} fill sizes='(min-width:768px) 384px, 100vw' className='object-cover' />}
              </div>
              <div className='flex flex-col gap-4 p-6'>
                {!data ? (
                  <div className='text-muted py-10 text-center text-sm'>…</div>
                ) : (
                  <>
                    <h2 className='font-display text-2xl tracking-tight'>{data.title}</h2>
                    {data.ratingCount > 0 && <RatingStars value={data.ratingAvg} count={data.ratingCount} />}
                    <Price priceCents={data.priceCents} discount={data.discountPercentage} className='text-xl' />
                    <p className='text-muted line-clamp-3 text-sm leading-relaxed'>{data.description}</p>
                    <div className='mt-auto flex flex-col gap-2'>
                      <Button variant='secondary' size='lg' isDisabled={data.stock <= 0} onPress={addToCart}>
                        {data.stock <= 0 ? t('outOfStock') : added ? t('added') : t('addToCart')}
                      </Button>
                      <Link
                        href={`/products/${data.slug}`}
                        onClick={() => setOpen(false)}
                        className='text-accent text-center text-sm font-medium'>
                        {t('viewDetails')}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
