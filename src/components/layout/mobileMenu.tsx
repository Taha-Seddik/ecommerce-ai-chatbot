'use client';

import { FR, GB, SA } from 'country-flag-icons/react/3x2';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconMenu } from '@/components/ui/icons';
import { useAccount } from '@/features/auth/account.store';
import { logoutAction } from '@/features/auth/auth.actions';
import { useCurrency } from '@/features/currency/currencyProvider';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/cn';
import { pickLocale } from '@/lib/content';
import { CURRENCIES, CURRENCY_CODES } from '@/lib/currency';

type Localized = { en: string; fr: string; ar?: string };
type NavCategory = {
  id: string;
  slug: string;
  title: Localized;
  children: { id: string; slug: string; title: Localized }[];
};

const LANGS = [
  { code: 'en', label: 'English', Flag: GB },
  { code: 'fr', label: 'Français', Flag: FR },
  { code: 'ar', label: 'العربية', Flag: SA },
] as const;

/** Hamburger + slide-in drawer for mobile: full navigation, language, currency, account links. */
export function MobileMenu({
  categories,
  shopLabel,
  accountLabel,
  wishlistLabel,
  languageLabel,
  currencyLabel,
  logoutLabel,
}: {
  categories: NavCategory[];
  shopLabel: string;
  accountLabel: string;
  wishlistLabel: string;
  languageLabel: string;
  currencyLabel: string;
  logoutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const account = useAccount((s) => s.account);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);
  const sectionLabel = 'mb-2 text-xs font-semibold tracking-wide text-white/50 uppercase';

  return (
    <>
      <button
        type='button'
        aria-label='Menu'
        onClick={() => setOpen(true)}
        className='grid size-9 place-items-center rounded-md text-white/85 transition-colors hover:bg-white/10 hover:text-white md:hidden'>
        <IconMenu />
      </button>

      {open &&
        createPortal(
          <div className='fixed inset-0 z-50 md:hidden' role='dialog' aria-modal='true'>
            <button type='button' aria-label='Close' className='animate-in fade-in absolute inset-0 bg-black/50' onClick={close} />
            <div className='bg-ink animate-in ltr:slide-in-from-left rtl:slide-in-from-right absolute inset-y-0 inset-s-0 flex w-[85vw] max-w-xs flex-col overflow-y-auto p-5 text-white duration-300'>
              <div className='flex items-center justify-between pb-4'>
                <span className='font-display text-xl font-bold'>{BRAND.name}</span>
                <button
                  type='button'
                  aria-label='Close'
                  onClick={close}
                  className='grid size-9 place-items-center rounded-md text-2xl hover:bg-white/10'>
                  ×
                </button>
              </div>

              <nav className='flex flex-col gap-0.5 text-sm'>
                <Link href='/products' onClick={close} className='rounded-lg px-2 py-2 font-semibold hover:bg-white/10'>
                  {shopLabel}
                </Link>
                {categories.map((c) => (
                  <div key={c.id} className='py-0.5'>
                    <Link
                      href={`/category/${c.slug}`}
                      onClick={close}
                      className='block rounded-lg px-2 py-1.5 font-medium hover:bg-white/10'>
                      {pickLocale(c.title, locale)}
                    </Link>
                    {c.children.length > 0 && (
                      <div className='ms-2 flex flex-col border-s border-white/10 ps-2'>
                        {c.children.map((ch) => (
                          <Link
                            key={ch.id}
                            href={`/category/${ch.slug}`}
                            onClick={close}
                            className='rounded-lg px-2 py-1.5 text-white/70 hover:bg-white/10 hover:text-white'>
                            {pickLocale(ch.title, locale)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className='mt-4 border-t border-white/10 pt-4'>
                <div className={sectionLabel}>{languageLabel}</div>
                <div className='flex flex-wrap gap-2'>
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      type='button'
                      onClick={() => {
                        close();
                        router.replace(pathname, { locale: l.code });
                      }}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                        l.code === locale ? 'border-white/40 bg-white/10' : 'border-white/15 hover:bg-white/10',
                      )}>
                      <span className='h-3.5 w-5 overflow-hidden rounded-sm'>
                        <l.Flag className='h-full w-full' />
                      </span>
                      <span className='uppercase'>{l.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className='mt-4 border-t border-white/10 pt-4'>
                <div className={sectionLabel}>{currencyLabel}</div>
                <div className='flex flex-wrap gap-2'>
                  {CURRENCY_CODES.map((code) => (
                    <button
                      key={code}
                      type='button'
                      onClick={() => {
                        setCurrency(code);
                        close();
                      }}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm transition-colors',
                        code === currency ? 'border-white/40 bg-white/10' : 'border-white/15 hover:bg-white/10',
                      )}>
                      <span className='font-semibold'>{CURRENCIES[code].symbol}</span> {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className='mt-4 flex flex-col gap-0.5 border-t border-white/10 pt-4 text-sm'>
                {account && <div className='truncate px-2 pb-1 text-xs text-white/50'>{account.email}</div>}
                <Link href='/account' onClick={close} className='rounded-lg px-2 py-2 hover:bg-white/10'>
                  {accountLabel}
                </Link>
                <Link href='/wishlist' onClick={close} className='rounded-lg px-2 py-2 hover:bg-white/10'>
                  {wishlistLabel}
                </Link>
                {account && (
                  <form action={logoutAction}>
                    <button
                      type='submit'
                      className='text-danger w-full rounded-lg px-2 py-2 text-start hover:bg-white/10'>
                      {logoutLabel}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
