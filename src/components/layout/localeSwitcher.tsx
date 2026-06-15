'use client';

import { Button } from '@heroui/react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

/** Toggles between EN and FR while keeping the user on the current page. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = locale === 'en' ? 'fr' : 'en';

  return (
    <Button
      variant='ghost'
      size='sm'
      aria-label='Change language'
      onPress={() => router.replace(pathname, { locale: next })}>
      <span className='font-mono text-xs tracking-wide'>{next.toUpperCase()}</span>
    </Button>
  );
}
