'use client';

import { IconHeart } from '@/components/ui/icons';
import { selectWishlistCount, useWishlist } from '@/features/wishlist/wishlist.store';
import { Link } from '@/i18n/navigation';

/** Header wishlist link with a live count badge (mirrors the cart badge for consistency). */
export function WishlistLink({ label }: { label: string }) {
  const count = useWishlist(selectWishlistCount);
  return (
    <Link
      href='/wishlist'
      aria-label={label}
      className='relative grid size-9 place-items-center rounded-md text-white/85 transition-colors hover:bg-white/10 hover:text-white'>
      <IconHeart />
      <span
        key={count}
        suppressHydrationWarning
        className='bg-accent text-accent-foreground animate-in zoom-in-50 absolute -top-0.5 -inset-e-0.5 grid min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold duration-200 empty:hidden'>
        {count > 0 ? count : ''}
      </span>
    </Link>
  );
}
