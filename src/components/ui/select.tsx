'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export type SelectOption = { value: string; label: string };

/** Lightweight, accessible custom dropdown (replaces native <select> for a polished look). */
export function Select({
  value,
  options,
  onChange,
  ariaLabel,
  align = 'start',
  className,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  align?: 'start' | 'end';
  className?: string;
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

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type='button'
        aria-label={ariaLabel}
        aria-haspopup='listbox'
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className='border-border bg-surface hover:border-foreground/40 flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors'>
        <span>{current?.label ?? ''}</span>
        <svg viewBox='0 0 24 24' className='text-muted size-4' fill='none' stroke='currentColor' strokeWidth='1.8'>
          <path d='m6 9 6 6 6-6' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      </button>
      {open && (
        <ul
          role='listbox'
          className={cn(
            'border-border bg-overlay shadow-lifted absolute z-50 mt-1 min-w-[10rem] overflow-hidden rounded-lg border py-1',
            align === 'end' ? 'right-0' : 'left-0',
          )}>
          {options.map((o) => (
            <li key={o.value}>
              <button
                type='button'
                role='option'
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  'hover:bg-surface-secondary block w-full px-3 py-1.5 text-left text-sm transition-colors',
                  o.value === value && 'text-accent font-medium',
                )}>
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
