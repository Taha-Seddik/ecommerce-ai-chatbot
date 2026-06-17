'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Small accessible popover menu: a styled trigger button + a floating panel.
 * Closes on outside click / Escape. `align` is logical (start/end) so it mirrors under RTL.
 */
export function Popover({
  trigger,
  children,
  triggerClassName,
  panelClassName,
  align = 'end',
  ariaLabel,
}: {
  trigger: (open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  triggerClassName?: string;
  panelClassName?: string;
  align?: 'start' | 'end';
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn('inline-flex items-center', triggerClassName)}>
        {trigger(open)}
      </button>
      {open && (
        <div
          role='menu'
          className={cn(
            'border-border bg-overlay text-foreground shadow-lifted animate-in fade-in slide-in-from-top-1 absolute z-50 mt-2 min-w-52 overflow-hidden rounded-xl border p-1.5 duration-150',
            align === 'end' ? 'inset-e-0' : 'inset-s-0',
            panelClassName,
          )}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
