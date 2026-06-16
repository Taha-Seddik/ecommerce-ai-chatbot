'use client';

import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/select';
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
  const options = PRODUCT_SORTS.map((s) => ({ value: s, label: t(`sort.${s}`) }));

  function onChange(v: string) {
    const sp = new URLSearchParams(params);
    if (v === 'newest') sp.delete('sort');
    else sp.set('sort', v);
    sp.delete('page');
    const qs = sp.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className='flex items-center gap-2 text-sm'>
      <span className='text-muted hidden sm:inline'>{t('sortBy')}</span>
      <Select value={value} options={options} onChange={onChange} ariaLabel={t('sortBy')} align='end' />
    </div>
  );
}
