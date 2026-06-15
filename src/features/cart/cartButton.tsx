'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconBag } from '@/components/ui/icons';
import { CartContents } from '@/features/cart/cartContents';
import { selectCartCount, useGuestCart } from '@/features/cart/cart.store';

export function CartButton({ locale, label, title }: { locale: string; label: string; title: string }) {
  const [open, setOpen] = useState(false);
  const count = useGuestCart(selectCartCount);

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

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-label={label}
        className='hover:bg-surface-secondary relative grid size-9 place-items-center rounded-lg transition-colors'>
        <IconBag />
        {/* empty:hidden + suppressHydrationWarning avoids an SSR/client count mismatch */}
        <span
          suppressHydrationWarning
          className='bg-accent text-accent-foreground absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold empty:hidden'>
          {count > 0 ? count : ''}
        </span>
      </button>

      {/* Portal to <body> so the fixed overlay escapes the navbar's backdrop-blur containing block. */}
      {open &&
        createPortal(
          <div className='fixed inset-0 z-50' role='dialog' aria-modal='true' aria-label={title}>
            <button
              type='button'
              aria-label='Close cart'
              className='animate-in fade-in absolute inset-0 bg-black/50 duration-200'
              onClick={() => setOpen(false)}
            />
            <div className='bg-background animate-in slide-in-from-right shadow-lifted absolute top-0 right-0 flex h-full w-full max-w-md flex-col p-5 duration-300'>
              <div className='flex items-center justify-between pb-4'>
                <h2 className='font-display text-xl'>{title}</h2>
                <button
                  type='button'
                  onClick={() => setOpen(false)}
                  aria-label='Close'
                  className='hover:bg-surface-secondary grid size-9 place-items-center rounded-lg text-xl'>
                  ×
                </button>
              </div>
              <CartContents locale={locale} onNavigate={() => setOpen(false)} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
