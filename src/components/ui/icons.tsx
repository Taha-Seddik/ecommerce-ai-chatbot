import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

export function IconSearch({ className = 'size-5', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <circle cx='11' cy='11' r='7' />
      <path d='m21 21-4.3-4.3' />
    </svg>
  );
}

export function IconBag({ className = 'size-5', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='M6 8h12l-1 12H7L6 8Z' />
      <path d='M9 8a3 3 0 0 1 6 0' />
    </svg>
  );
}

export function IconUser({ className = 'size-5', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <circle cx='12' cy='8' r='4' />
      <path d='M5 21a7 7 0 0 1 14 0' />
    </svg>
  );
}

export function IconHeart({ className = 'size-5', filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} {...base} fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d='M12 20s-7-4.35-9.5-8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5.5C19 15.65 12 20 12 20Z' />
    </svg>
  );
}

export function IconStar({ className = 'size-4', filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} {...base} fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d='m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9L12 3Z' />
    </svg>
  );
}

export function IconChevronRight({ className = 'size-5', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='m9 6 6 6-6 6' />
    </svg>
  );
}

export function IconChevronLeft({ className = 'size-5', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='m15 6-6 6 6 6' />
    </svg>
  );
}

export function IconArrowRight({ className = 'size-5', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='M5 12h14' />
      <path d='m13 6 6 6-6 6' />
    </svg>
  );
}
