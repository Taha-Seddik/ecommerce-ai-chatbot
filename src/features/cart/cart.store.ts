import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartLine = { productId: string; quantity: number };

type CartState = {
  lines: CartLine[];
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

/**
 * Guest cart — persisted to localStorage. The server-backed cart, drawer, and
 * merge-on-login arrive in Phase 5; this gives the PDP a working "Add to cart".
 */
export const useGuestCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (productId, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.productId === productId);
          return {
            lines: existing
              ? s.lines.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + qty } : l))
              : [...s.lines, { productId, quantity: qty }],
          };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.productId !== productId)
              : s.lines.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l)),
        })),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'norden-guest-cart' },
  ),
);

/** Total item count (selector helper for client components). */
export const selectCartCount = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity, 0);
