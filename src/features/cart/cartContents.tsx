'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { IconBag } from '@/components/ui/icons';
import { persistCartAction, resolveCart } from '@/features/cart/cart.actions';
import { useGuestCart } from '@/features/cart/cart.store';
import type { CartView } from '@/features/cart/cart.types';
import { useCurrency } from '@/features/currency/currencyProvider';
import { Link } from '@/i18n/navigation';

const stepBtn = 'grid size-8 place-items-center transition-colors hover:bg-surface-secondary disabled:opacity-40';

export function CartContents({ locale, onNavigate }: { locale: string; onNavigate?: () => void }) {
  const t = useTranslations('cart');
  const { format } = useCurrency();
  const lines = useGuestCart((s) => s.lines);
  const setQty = useGuestCart((s) => s.setQty);
  const remove = useGuestCart((s) => s.remove);
  const [view, setView] = useState<CartView | null>(null);

  useEffect(() => {
    let active = true;
    resolveCart(lines, locale).then((v) => {
      if (active) setView(v);
    });
    return () => {
      active = false;
    };
  }, [lines, locale]);

  const sync = () => persistCartAction(useGuestCart.getState().lines);
  const changeQty = (productId: string, qty: number) => {
    setQty(productId, qty);
    sync();
  };
  const removeLine = (productId: string) => {
    remove(productId);
    sync();
  };

  if (view && view.lines.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center'>
        <IconBag className='text-muted size-8' />
        <p className='font-display text-xl'>{t('empty')}</p>
        <p className='text-muted text-sm'>{t('emptyHint')}</p>
        <Link href='/products' onClick={onNavigate} className='text-accent mt-2 text-sm font-medium'>
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <ul className='divide-border flex-1 divide-y overflow-y-auto'>
        {(view?.lines ?? []).map((l) => (
          <li key={l.productId} className='flex gap-4 py-4'>
            <Link
              href={`/products/${l.slug}`}
              onClick={onNavigate}
              className='bg-surface-secondary relative size-20 shrink-0 overflow-hidden rounded-lg'>
              {l.thumbnail && <Image src={l.thumbnail} alt={l.title} fill sizes='80px' className='object-cover' />}
            </Link>
            <div className='flex flex-1 flex-col'>
              <div className='flex justify-between gap-2'>
                <Link
                  href={`/products/${l.slug}`}
                  onClick={onNavigate}
                  className='hover:text-accent leading-snug font-medium transition-colors'>
                  {l.title}
                </Link>
                <span className='tabular font-medium' suppressHydrationWarning>
                  {format(l.lineTotalCents)}
                </span>
              </div>
              <span className='text-muted text-sm' suppressHydrationWarning>
                {format(l.unitPriceCents)} {t('each')}
              </span>
              <div className='mt-auto flex items-center justify-between pt-2'>
                <div className='border-border flex items-center rounded-lg border'>
                  <button
                    type='button'
                    onClick={() => changeQty(l.productId, l.quantity - 1)}
                    className={stepBtn}
                    aria-label='Decrease quantity'>
                    −
                  </button>
                  <span className='tabular w-8 text-center text-sm'>{l.quantity}</span>
                  <button
                    type='button'
                    onClick={() => changeQty(l.productId, Math.min(l.stock, l.quantity + 1))}
                    disabled={l.quantity >= l.stock}
                    className={stepBtn}
                    aria-label='Increase quantity'>
                    +
                  </button>
                </div>
                <button
                  type='button'
                  onClick={() => removeLine(l.productId)}
                  className='text-muted hover:text-danger text-sm transition-colors'>
                  {t('remove')}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {view && view.lines.length > 0 && (
        <div className='border-border space-y-3 border-t pt-4'>
          <div className='flex items-center justify-between'>
            <span className='text-muted'>{t('subtotal')}</span>
            <span className='tabular text-lg font-semibold' suppressHydrationWarning>
              {format(view.subtotalCents)}
            </span>
          </div>
          <p className='text-muted text-xs'>{t('shippingNote')}</p>
          <Link
            href='/checkout'
            onClick={onNavigate}
            className='bg-foreground text-background flex h-12 items-center justify-center rounded-[var(--radius)] font-medium transition-opacity hover:opacity-90'>
            {t('checkout')}
          </Link>
        </div>
      )}
    </div>
  );
}
