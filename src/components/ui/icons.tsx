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
      <path d='M5.5 7.5h13l-.8 11.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8L5.5 7.5Z' />
      <path d='M8.75 7.5V6.25a3.25 3.25 0 0 1 6.5 0V7.5' />
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
      <path d='M12 20.3c-.6-.45-7.5-5-7.5-10.1A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 3.2c0 5.1-6.9 9.65-7.5 10.1Z' />
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

export function IconMenu({ className = 'size-6', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='M4 6h16M4 12h16M4 18h16' />
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

export function IconSparkles({ className = 'size-5', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9 12 4.5Z' />
      <path d='M18.5 4v3M20 5.5h-3M5.5 16v2.5M6.75 17.25h-2.5' />
    </svg>
  );
}

export function IconSend({ className = 'size-5', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='M5 12 20 5l-4.5 14-3.2-6.3L5 12Z' />
    </svg>
  );
}

export function IconClose({ className = 'size-5', ...props }: IconProps) {
  return (
    <svg className={className} {...base} {...props}>
      <path d='M6 6l12 12M18 6 6 18' />
    </svg>
  );
}
