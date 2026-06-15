import { getTranslations } from 'next-intl/server';
import type { CategoryFacet } from '@/features/products/products.repo';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { pickLocale } from '@/lib/content';

type Current = {
  q?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
};

export async function SearchFilters({
  locale,
  facets,
  current,
}: {
  locale: string;
  facets: CategoryFacet[];
  current: Current;
}) {
  const t = await getTranslations('search');

  // Build a locale-less /search href (next-intl Link adds the locale).
  const build = (override: Partial<Current>) => {
    const m = { ...current, ...override };
    const p = new URLSearchParams();
    if (m.q) p.set('q', m.q);
    if (m.categorySlug) p.set('category', m.categorySlug);
    if (m.minPrice != null) p.set('min', String(m.minPrice));
    if (m.maxPrice != null) p.set('max', String(m.maxPrice));
    if (m.inStock) p.set('inStock', '1');
    if (m.sort && m.sort !== 'newest') p.set('sort', m.sort);
    const qs = p.toString();
    return `/search${qs ? `?${qs}` : ''}`;
  };

  const hasFilters =
    Boolean(current.categorySlug) || current.minPrice != null || current.maxPrice != null || Boolean(current.inStock);

  return (
    <aside className='flex flex-col gap-6 text-sm'>
      <div>
        <h3 className='mb-2 font-medium'>{t('categories')}</h3>
        <ul className='flex flex-col gap-0.5'>
          {facets.length === 0 && <li className='text-muted'>—</li>}
          {facets.map((f) => {
            const active = current.categorySlug === f.slug;
            return (
              <li key={f.slug}>
                <Link
                  href={build({ categorySlug: active ? undefined : f.slug })}
                  className={cn(
                    'flex justify-between gap-2 rounded-lg px-2 py-1 transition-colors',
                    active ? 'bg-surface-secondary font-medium' : 'text-muted hover:text-foreground',
                  )}>
                  <span>{pickLocale(f.title, locale)}</span>
                  <span className='tabular'>{f.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className='mb-2 font-medium'>{t('price')}</h3>
        <form action={`/${locale}/search`} method='get' className='flex items-center gap-2'>
          {current.q && <input type='hidden' name='q' value={current.q} />}
          {current.categorySlug && <input type='hidden' name='category' value={current.categorySlug} />}
          {current.inStock && <input type='hidden' name='inStock' value='1' />}
          {current.sort && current.sort !== 'newest' && <input type='hidden' name='sort' value={current.sort} />}
          <input
            name='min'
            type='number'
            min='0'
            defaultValue={current.minPrice}
            placeholder={t('min')}
            className='border-border bg-surface w-20 rounded-lg border px-2 py-1'
          />
          <span className='text-muted'>–</span>
          <input
            name='max'
            type='number'
            min='0'
            defaultValue={current.maxPrice}
            placeholder={t('max')}
            className='border-border bg-surface w-20 rounded-lg border px-2 py-1'
          />
          <button type='submit' className='border-border hover:bg-surface-secondary rounded-lg border px-2.5 py-1'>
            {t('apply')}
          </button>
        </form>
      </div>

      <Link href={build({ inStock: current.inStock ? undefined : true })} className='flex items-center gap-2'>
        <span
          className={cn(
            'grid size-4 place-items-center rounded border text-[10px]',
            current.inStock ? 'bg-accent border-accent text-accent-foreground' : 'border-border',
          )}>
          {current.inStock ? '✓' : ''}
        </span>
        {t('inStock')}
      </Link>

      {hasFilters && (
        <Link
          href={build({ categorySlug: undefined, minPrice: undefined, maxPrice: undefined, inStock: undefined })}
          className='text-accent w-fit'>
          {t('clear')}
        </Link>
      )}
    </aside>
  );
}
