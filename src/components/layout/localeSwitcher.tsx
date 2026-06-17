'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

/** Toggles between EN and FR while keeping the user on the current page. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = locale === 'en' ? 'fr' : 'en';

  return (
    <button
      type='button'
      aria-label='Change language'
      onClick={() => router.replace(pathname, { locale: next })}
      className='grid h-9 w-9 place-items-center rounded-md text-white/85 transition-colors hover:bg-white/10 hover:text-white'>
      <span className='font-mono text-xs font-medium tracking-wide'>{next.toUpperCase()}</span>
    </button>
  );
}
