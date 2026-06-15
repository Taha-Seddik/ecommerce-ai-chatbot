'use client';

import { useEffect } from 'react';
import { useGuestCart } from '@/features/cart/cart.store';

/** Clears the guest cart on mount (used on the order-confirmation page). */
export function ClearGuestCart() {
  useEffect(() => {
    useGuestCart.getState().clear();
  }, []);
  return null;
}
