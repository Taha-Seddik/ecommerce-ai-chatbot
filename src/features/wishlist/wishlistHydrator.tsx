'use client';

import { useEffect } from 'react';
import { getServerWishlistAction } from '@/features/wishlist/wishlist.actions';
import { useWishlist } from '@/features/wishlist/wishlist.store';

/** Merge the logged-in user's DB wishlist into the client store on mount. No-op for guests. */
export function WishlistHydrator() {
  useEffect(() => {
    let active = true;
    getServerWishlistAction().then((server) => {
      if (!active || server.length === 0) return;
      const local = useWishlist.getState().ids;
      useWishlist.setState({ ids: Array.from(new Set([...local, ...server])) });
    });
    return () => {
      active = false;
    };
  }, []);
  return null;
}
