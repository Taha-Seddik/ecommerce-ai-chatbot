'use client';

import { FR, GB, SA } from 'country-flag-icons/react/3x2';
import { useLocale } from 'next-intl';
import { IconCheck, IconChevronDown } from '@/components/ui/icons';
import { Popover } from '@/components/ui/popover';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

const LANGS = [
  { code: 'en', label: 'English', Flag: GB },
  { code: 'fr', label: 'Français', Flag: FR },
  { code: 'ar', label: 'العربية', Flag: SA },
] as const;

/** Language picker with country flags + native names. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const current = LANGS.find((l) => l.code === locale) ?? LANGS[0];

  return (
    <Popover
      ariaLabel='Change language'
      triggerClassName='h-9 gap-2 rounded-md px-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white'
      trigger={(open) => (
        <>
          <span className='h-3.5 w-5 shrink-0 overflow-hidden rounded-sm shadow-sm'>
            <current.Flag className='h-full w-full' title={current.label} />
          </span>
          <span className='text-xs font-semibold tracking-wide uppercase'>{current.code}</span>
          <IconChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
        </>
      )}>
      {(close) => (
        <>
          {LANGS.map((l) => (
            <button
              key={l.code}
              type='button'
              role='menuitemradio'
              aria-checked={l.code === locale}
              onClick={() => {
                close();
                router.replace(pathname, { locale: l.code });
              }}
              className={cn(
                'hover:bg-surface-secondary flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                l.code === locale && 'font-semibold',
              )}>
              <span className='h-4 w-6 shrink-0 overflow-hidden rounded-md shadow-sm'>
                <l.Flag className='h-full w-full' />
              </span>
              <span className='flex-1 text-start'>{l.label}</span>
              {l.code === locale && <IconCheck className='text-accent size-4' />}
            </button>
          ))}
        </>
      )}
    </Popover>
  );
}
