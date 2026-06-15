'use client';

import { logoutAction } from '@/features/auth/auth.actions';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

const items = [
  ['/admin', 'Dashboard'],
  ['/admin/products', 'Products'],
  ['/admin/categories', 'Categories'],
  ['/admin/orders', 'Orders'],
  ['/admin/users', 'Users'],
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className='flex flex-col gap-1 text-sm'>
      <span className='font-display mb-3 text-lg'>Norden Admin</span>
      {items.map(([href, label]) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'rounded-lg px-3 py-2 transition-colors',
              active ? 'bg-surface-secondary font-medium' : 'text-muted hover:text-foreground',
            )}>
            {label}
          </Link>
        );
      })}
      <Link href='/' className='text-muted hover:text-foreground mt-2 rounded-lg px-3 py-2'>
        ← Store
      </Link>
      <form action={logoutAction}>
        <button
          type='submit'
          className='text-muted hover:text-foreground w-full rounded-lg px-3 py-2 text-left transition-colors'>
          Sign out
        </button>
      </form>
    </aside>
  );
}
