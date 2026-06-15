import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyState } from '@/components/catalog/emptyState';
import { Pagination } from '@/components/catalog/pagination';
import { SearchBar } from '@/components/catalog/searchBar';
import { SearchFilters } from '@/components/catalog/searchFilters';
import { SortSelect } from '@/components/catalog/sortSelect';
import { ProductGrid } from '@/components/product/productGrid';
import { Container } from '@/components/ui/container';
import { getCategoryFacets, searchProducts } from '@/features/products/products.repo';
import { parsePage, parseSort } from '@/features/products/products.types';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const numOrUndef = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const q = one(sp.q)?.trim() ?? '';
  const categorySlug = one(sp.category);
  const minPrice = numOrUndef(sp.min);
  const maxPrice = numOrUndef(sp.max);
  const inStock = one(sp.inStock) === '1';
  const sort = parseSort(sp.sort);
  const page = parsePage(sp.page);

  const opts = { q: q || undefined, categorySlug, minPrice, maxPrice, inStock, sort, page };
  const t = await getTranslations();
  const [{ rows, total, page: current, pageCount }, facets] = await Promise.all([
    searchProducts(opts),
    getCategoryFacets(opts),
  ]);

  // Params to preserve across sort changes / pagination.
  const filterParams: Record<string, string> = {};
  if (q) filterParams.q = q;
  if (categorySlug) filterParams.category = categorySlug;
  if (minPrice != null) filterParams.min = String(minPrice);
  if (maxPrice != null) filterParams.max = String(maxPrice);
  if (inStock) filterParams.inStock = '1';
  const pageParams = { ...filterParams, ...(sort !== 'newest' ? { sort } : {}) };

  return (
    <Container className='py-10 md:py-14'>
      <div className='mx-auto mb-10 max-w-xl'>
        <SearchBar locale={locale} defaultValue={q} />
      </div>

      <div className='grid gap-8 md:grid-cols-[220px_1fr]'>
        <SearchFilters
          locale={locale}
          facets={facets}
          current={{ q: q || undefined, categorySlug, minPrice, maxPrice, inStock, sort }}
        />

        <div className='min-w-0'>
          <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
            <p className='text-muted text-sm'>
              {q ? t('search.resultsFor', { q, count: total }) : t('catalog.results', { count: total })}
            </p>
            <SortSelect value={sort} basePath='/search' params={filterParams} />
          </div>

          {rows.length ? (
            <ProductGrid products={rows} locale={locale} />
          ) : (
            <EmptyState title={t('search.noResults')} hint={t('search.noResultsHint')} />
          )}

          <Pagination page={current} pageCount={pageCount} basePath='/search' params={pageParams} />
        </div>
      </div>
    </Container>
  );
}
