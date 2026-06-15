'use client';

import { useTranslations } from 'next-intl';
import { logoutAction } from '@/features/auth/auth.actions';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

const items = [
  { href: '/account', key: 'overview' },
  { href: '/account/orders', key: 'orders' },
  { href: '/account/profile', key: 'profile' },
  { href: '/account/addresses', key: 'addresses' },
] as const;

export function AccountNav() {
  const t = useTranslations('account.nav');
  const pathname = usePathname();

  return (
    <nav className='flex flex-col gap-1 text-sm'>
      {items.map((it) => {
        const active = it.href === '/account' ? pathname === '/account' : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'rounded-lg px-3 py-2 transition-colors',
              active ? 'bg-surface-secondary font-medium' : 'text-muted hover:text-foreground',
            )}>
            {t(it.key)}
          </Link>
        );
      })}
      <form action={logoutAction} className='mt-2'>
        <button
          type='submit'
          className='text-muted hover:text-foreground w-full rounded-lg px-3 py-2 text-left transition-colors'>
          {t('logout')}
        </button>
      </form>
    </nav>
  );
}
