import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

/** Guest wishlist — persisted to localStorage; merged into the DB wishlist on login. */
export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'norden-wishlist' },
  ),
);

export const selectWishlistCount = (s: WishlistState) => s.ids.length;
