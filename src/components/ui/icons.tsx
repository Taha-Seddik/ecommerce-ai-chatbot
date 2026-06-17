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

export function IconChevronDown({ className = 'size-4', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='m6 9 6 6 6-6' />
    </svg>
  );
}

export function IconCheck({ className = 'size-4', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='m5 12 5 5 9-10' />
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

export function IconTruck({ className = 'size-6', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='M3 6h11v10H3z' />
      <path d='M14 9h4l3 3v4h-7z' />
      <circle cx='7' cy='18' r='1.7' />
      <circle cx='17.5' cy='18' r='1.7' />
    </svg>
  );
}

export function IconWallet({ className = 'size-6', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='M3 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z' />
      <path d='M3 9.5 14.5 4 16 7.5' />
      <circle cx='16.5' cy='13' r='1.2' />
    </svg>
  );
}

export function IconReturn({ className = 'size-6', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='M3 12a9 9 0 1 0 2.6-6.3' />
      <path d='M3 4v4h4' />
    </svg>
  );
}

export function IconShield({ className = 'size-6', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z' />
      <path d='m9 12 2 2 4-4' />
    </svg>
  );
}
