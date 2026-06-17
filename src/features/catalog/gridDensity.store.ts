import { create } from 'zustand';

export type GridDensity = 'comfortable' | 'compact';

type GridDensityState = {
  density: GridDensity;
  setDensity: (density: GridDensity) => void;
};

/** View preference for product-grid density (session-scoped — defaults match SSR, no hydration mismatch). */
export const useGridDensity = create<GridDensityState>((set) => ({
  density: 'comfortable',
  setDensity: (density) => set({ density }),
}));
