'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconSearch } from '@/components/ui/icons';
import { useCurrency } from '@/features/currency/currencyProvider';
import { type SearchHit, quickSearch } from '@/features/search/search.actions';
import { useRouter } from '@/i18n/navigation';
import { discountedCents } from '@/lib/money';

export function SearchModal({ placeholder }: { placeholder: string }) {
  const t = useTranslations('search');
  const locale = useLocale();
  const router = useRouter();
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    const id = setTimeout(() => {
      if (term.length < 2) {
        setHits([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      quickSearch(term, locale).then((r) => {
        setHits(r);
        setLoading(false);
      });
    }, 220);
    return () => clearTimeout(id);
  }, [q, open, locale]);

  function close() {
    setOpen(false);
    setQ('');
    setHits([]);
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    close();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }
  function go(href: string) {
    close();
    router.push(href);
  }

  return (
    <>
      {/* Trigger — input-style on desktop, icon-only on mobile */}
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-label={placeholder}
        className='flex h-10 w-full items-center gap-2 rounded-full bg-white px-3 text-zinc-500 shadow-sm transition-colors hover:bg-zinc-100 md:max-w-xl md:px-4'>
        <IconSearch className='size-5 shrink-0' />
        <span className='truncate text-sm'>{placeholder}</span>
      </button>

      {open &&
        createPortal(
          <div className='fixed inset-0 z-50' role='dialog' aria-modal='true' aria-label={placeholder}>
            <button
              type='button'
              aria-label='Close'
              className='animate-in fade-in absolute inset-0 bg-black/40'
              onClick={close}
            />
            <div className='bg-surface shadow-lifted animate-in slide-in-from-top-4 absolute inset-x-0 top-0 mx-auto flex max-h-[80vh] w-full max-w-2xl flex-col rounded-b-2xl p-4 duration-200 sm:top-8 sm:rounded-2xl'>
              <form onSubmit={submit} className='border-border flex items-center gap-3 border-b pb-3'>
                <IconSearch className='text-muted size-5' />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={placeholder}
                  aria-label={placeholder}
                  className='flex-1 bg-transparent text-base outline-none'
                />
                <kbd className='text-muted border-border hidden rounded border px-1.5 py-0.5 text-xs sm:inline'>
                  Esc
                </kbd>
              </form>

              <div className='mt-3 min-h-0 flex-1 overflow-y-auto'>
                {q.trim().length < 2 ? (
                  <p className='text-muted py-8 text-center text-sm'>{t('hint')}</p>
                ) : loading ? (
                  <p className='text-muted py-8 text-center text-sm'>…</p>
                ) : hits.length === 0 ? (
                  <p className='text-muted py-8 text-center text-sm'>{t('noResults')}</p>
                ) : (
                  <ul className='flex flex-col gap-0.5'>
                    {hits.map((h) => (
                      <li key={h.slug}>
                        <button
                          type='button'
                          onClick={() => go(`/products/${h.slug}`)}
                          className='hover:bg-surface-secondary flex w-full items-center gap-3 rounded-lg p-2 text-start transition-colors'>
                          <span className='bg-surface-secondary relative size-12 shrink-0 overflow-hidden rounded-md'>
                            {h.thumbnail && (
                              <Image src={h.thumbnail} alt='' fill sizes='48px' className='object-cover' />
                            )}
                          </span>
                          <span className='flex-1 text-sm font-medium'>{h.title}</span>
                          <span className='tabular text-sm' suppressHydrationWarning>
                            {format(discountedCents(h.priceCents, h.discountPercentage))}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {q.trim().length >= 2 && (
                <button
                  type='button'
                  onClick={submit}
                  className='border-border text-accent mt-2 border-t pt-3 text-center text-sm font-medium'>
                  {t('seeAll', { q: q.trim() })}
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
