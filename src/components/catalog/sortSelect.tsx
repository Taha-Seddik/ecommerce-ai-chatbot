'use client';

import { useTranslations } from 'next-intl';
import type { ChangeEvent } from 'react';
import { PRODUCT_SORTS, type ProductSort } from '@/features/products/products.types';
import { useRouter } from '@/i18n/navigation';

/** Changing the sort rewrites the URL (preserving filters, dropping the page) so the server re-queries. */
export function SortSelect({
  value,
  basePath,
  params = {},
}: {
  value: ProductSort;
  basePath: string;
  params?: Record<string, string>;
}) {
  const t = useTranslations('catalog');
  const router = useRouter();

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    const sp = new URLSearchParams(params);
    if (e.target.value === 'newest') sp.delete('sort');
    else sp.set('sort', e.target.value);
    sp.delete('page');
    const qs = sp.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <label className='flex items-center gap-2 text-sm'>
      <span className='text-muted'>{t('sortBy')}</span>
      <select
        value={value}
        onChange={onChange}
        className='border-border bg-surface focus:border-accent rounded-lg border px-3 py-1.5 text-sm transition-colors outline-none'>
        {PRODUCT_SORTS.map((s) => (
          <option key={s} value={s}>
            {t(`sort.${s}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
