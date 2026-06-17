'use client';

import { type GridDensity, useGridDensity } from '@/features/catalog/gridDensity.store';
import { cn } from '@/lib/cn';

function IconComfortable({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} fill='currentColor' aria-hidden>
      <rect x='3' y='3' width='8' height='8' rx='1.6' />
      <rect x='13' y='3' width='8' height='8' rx='1.6' />
      <rect x='3' y='13' width='8' height='8' rx='1.6' />
      <rect x='13' y='13' width='8' height='8' rx='1.6' />
    </svg>
  );
}

function IconCompact({ className = 'size-4' }: { className?: string }) {
  const xs = [3, 9.5, 16];
  return (
    <svg viewBox='0 0 24 24' className={className} fill='currentColor' aria-hidden>
      {xs.map((y) => xs.map((x) => <rect key={`${x}-${y}`} x={x} y={y} width='5' height='5' rx='1' />))}
    </svg>
  );
}

const OPTIONS: { value: GridDensity; label: string; Icon: typeof IconComfortable }[] = [
  { value: 'comfortable', label: 'Comfortable view', Icon: IconComfortable },
  { value: 'compact', label: 'Compact view', Icon: IconCompact },
];

/** Segmented control to switch how many products show per row (no dropdown). Desktop only. */
export function GridDensityToggle() {
  const density = useGridDensity((s) => s.density);
  const setDensity = useGridDensity((s) => s.setDensity);

  return (
    <div className='border-border bg-surface-secondary hidden items-center gap-0.5 rounded-lg border p-0.5 md:flex'>
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type='button'
          aria-label={label}
          aria-pressed={density === value}
          onClick={() => setDensity(value)}
          className={cn(
            'grid size-8 place-items-center rounded-md transition-colors',
            density === value ? 'bg-surface text-foreground shadow-soft' : 'text-muted hover:text-foreground',
          )}>
          <Icon />
        </button>
      ))}
    </div>
  );
}
