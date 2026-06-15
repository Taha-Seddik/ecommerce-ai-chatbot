'use client';

import { useEffect } from 'react';
import { getServerCartAction } from '@/features/cart/cart.actions';
import { useGuestCart } from '@/features/cart/cart.store';

/**
 * Loads the logged-in user's DB cart into the client store once on mount
 * (merging with anything already local). No-op for guests.
 */
export function CartHydrator() {
  useEffect(() => {
    let active = true;
    getServerCartAction().then((serverLines) => {
      if (!active || serverLines.length === 0) return;
      const local = useGuestCart.getState().lines;
      const byId = new Map(local.map((l) => [l.productId, l.quantity]));
      for (const l of serverLines) byId.set(l.productId, Math.max(byId.get(l.productId) ?? 0, l.quantity));
      useGuestCart.setState({ lines: Array.from(byId, ([productId, quantity]) => ({ productId, quantity })) });
    });
    return () => {
      active = false;
    };
  }, []);

  return null;
}
