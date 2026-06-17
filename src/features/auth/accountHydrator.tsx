'use client';

import { useEffect } from 'react';
import { useAccount } from '@/features/auth/account.store';
import { getAccountSummaryAction } from '@/features/auth/auth.actions';
import { usePathname } from '@/i18n/navigation';

/**
 * Syncs the (httpOnly) session into the client store. Re-checks on route change so the
 * header reflects login/logout, which happen via client-side redirects (layout persists).
 */
export function AccountHydrator() {
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    getAccountSummaryAction().then((a) => {
      if (active) useAccount.getState().setAccount(a);
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
}
