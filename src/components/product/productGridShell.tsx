'use client';

import type { ReactNode } from 'react';
import { useGridDensity } from '@/features/catalog/gridDensity.store';
import { cn } from '@/lib/cn';

/** Client wrapper that applies the chosen grid density to the (server-rendered) product cards. */
export function ProductGridShell({ children }: { children: ReactNode }) {
  const density = useGridDensity((s) => s.density);
  return (
    <div
      className={cn(
        'grid gap-x-4 gap-y-8 md:gap-x-6',
        density === 'compact'
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      )}>
      {children}
    </div>
  );
}
