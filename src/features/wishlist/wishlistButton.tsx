'use client';

import type { MouseEvent } from 'react';
import { IconHeart } from '@/components/ui/icons';
import { persistWishlistAction } from '@/features/wishlist/wishlist.actions';
import { useWishlist } from '@/features/wishlist/wishlist.store';
import { cn } from '@/lib/cn';

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const ids = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const active = ids.includes(productId);

  function onClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
    persistWishlistAction(useWishlist.getState().ids);
  }

  return (
    <button
      type='button'
      onClick={onClick}
      aria-label='Toggle wishlist'
      aria-pressed={active}
      suppressHydrationWarning
      className={cn(
        'grid size-9 place-items-center rounded-full backdrop-blur transition-colors',
        'bg-background/70 hover:bg-background',
        active ? 'text-accent' : 'text-foreground',
        className,
      )}>
      <IconHeart filled={active} className='size-5' />
    </button>
  );
}
