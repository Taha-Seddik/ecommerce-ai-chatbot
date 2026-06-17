'use client';

import { IconUser } from '@/components/ui/icons';
import { Popover } from '@/components/ui/popover';
import { useAccount } from '@/features/auth/account.store';
import { logoutAction } from '@/features/auth/auth.actions';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

export function AccountMenu({
  signInLabel,
  accountLabel,
  ordersLabel,
  wishlistLabel,
  adminLabel,
  logoutLabel,
}: {
  signInLabel: string;
  accountLabel: string;
  ordersLabel: string;
  wishlistLabel: string;
  adminLabel: string;
  logoutLabel: string;
}) {
  const account = useAccount((s) => s.account);

  if (!account) {
    return (
      <Link
        href='/account'
        aria-label={signInLabel}
        className='grid size-9 place-items-center rounded-md text-white/85 transition-colors hover:bg-white/10 hover:text-white'>
        <IconUser />
      </Link>
    );
  }

  const item = 'hover:bg-surface-secondary block rounded-lg px-3 py-2 text-sm transition-colors';

  return (
    <Popover
      ariaLabel={accountLabel}
      triggerClassName='bg-accent size-9 justify-center rounded-full text-sm font-bold text-white transition hover:brightness-110'
      trigger={() => <span aria-hidden>{account.email.charAt(0).toUpperCase()}</span>}>
      {(close) => (
        <>
          <div className='text-muted truncate px-3 pt-1 pb-2 text-xs'>{account.email}</div>
          <div className='border-border border-t py-1'>
            <Link href='/account' onClick={close} className={item}>
              {accountLabel}
            </Link>
            <Link href='/account/orders' onClick={close} className={item}>
              {ordersLabel}
            </Link>
            <Link href='/wishlist' onClick={close} className={item}>
              {wishlistLabel}
            </Link>
            {account.isAdmin && (
              <Link href='/admin' onClick={close} className={item}>
                {adminLabel}
              </Link>
            )}
          </div>
          <form action={logoutAction} className='border-border border-t pt-1'>
            <button type='submit' className={cn(item, 'text-danger w-full text-start')}>
              {logoutLabel}
            </button>
          </form>
        </>
      )}
    </Popover>
  );
}
