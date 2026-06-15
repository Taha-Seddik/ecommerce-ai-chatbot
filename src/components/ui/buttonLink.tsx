import type { ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary: 'bg-accent text-accent-foreground hover:opacity-90',
  secondary: 'bg-foreground text-background hover:opacity-90',
  outline: 'border border-border hover:bg-surface-secondary',
  ghost: 'hover:bg-surface-secondary',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5',
  lg: 'h-12 px-6 text-base',
};

type Props = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

/** A next-intl Link styled as a button (for CTAs that navigate). */
export function ButtonLink({ variant = 'primary', size = 'md', className, children, ...props }: Props) {
  return (
    <Link
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-colors',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}>
      {children}
    </Link>
  );
}
