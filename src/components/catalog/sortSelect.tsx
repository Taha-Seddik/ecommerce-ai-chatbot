'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { PRODUCT_SORTS, type ProductSort } from '@/features/products/products.types';

/** Changing the sort rewrites the URL (dropping the page), so the server re-queries. */
export function SortSelect({ value, basePath }: { value: ProductSort; basePath: string }) {
  const t = useTranslations('catalog');
  const router = useRouter();

  return (
    <label className='flex items-center gap-2 text-sm'>
      <span className='text-muted'>{t('sortBy')}</span>
      <select
        value={value}
        onChange={(e) => router.push(e.target.value === 'newest' ? basePath : `${basePath}?sort=${e.target.value}`)}
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
