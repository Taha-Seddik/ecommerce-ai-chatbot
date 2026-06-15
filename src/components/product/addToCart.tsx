'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useGuestCart } from '@/features/cart/cart.store';
import { cn } from '@/lib/cn';

export function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const t = useTranslations('product');
  const add = useGuestCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = stock <= 0;

  function handleAdd() {
    add(productId, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const stepBtn =
    'grid size-11 place-items-center text-lg transition-colors hover:bg-surface-secondary disabled:opacity-40';

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <div className='border-border flex items-center rounded-lg border'>
        <button
          type='button'
          className={stepBtn}
          aria-label='Decrease quantity'
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={soldOut}>
          −
        </button>
        <span className='tabular w-10 text-center text-sm'>{qty}</span>
        <button
          type='button'
          className={stepBtn}
          aria-label='Increase quantity'
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
          disabled={soldOut || qty >= stock}>
          +
        </button>
      </div>

      <Button
        variant='secondary'
        size='lg'
        isDisabled={soldOut}
        onPress={handleAdd}
        className={cn('flex-1', added && 'bg-success! text-success-foreground!')}>
        {soldOut ? t('outOfStock') : added ? t('added') : t('addToCart')}
      </Button>
    </div>
  );
}
