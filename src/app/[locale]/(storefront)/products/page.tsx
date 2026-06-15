import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyState } from '@/components/catalog/emptyState';
import { Pagination } from '@/components/catalog/pagination';
import { SortSelect } from '@/components/catalog/sortSelect';
import { ProductGrid } from '@/components/product/productGrid';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Container } from '@/components/ui/container';
import { listProducts } from '@/features/products/products.repo';
import { parsePage, parseSort } from '@/features/products/products.types';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const sort = parseSort(sp.sort);
  const page = parsePage(sp.page);

  const t = await getTranslations();
  const { rows, total, page: current, pageCount } = await listProducts({ sort, page });

  return (
    <Container className='py-10 md:py-14'>
      <Breadcrumb items={[{ label: t('nav.home'), href: '/' }, { label: t('catalog.allProducts') }]} />

      <div className='mt-4 mb-8 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='font-display text-3xl tracking-tight md:text-4xl'>{t('catalog.allProducts')}</h1>
          <p className='text-muted mt-1 text-sm'>{t('catalog.results', { count: total })}</p>
        </div>
        <SortSelect value={sort} basePath='/products' />
      </div>

      {rows.length ? (
        <ProductGrid products={rows} locale={locale} />
      ) : (
        <EmptyState title={t('catalog.noResults')} hint={t('catalog.noResultsHint')} />
      )}

      <Pagination
        page={current}
        pageCount={pageCount}
        basePath='/products'
        params={sort !== 'newest' ? { sort } : {}}
      />
    </Container>
  );
}
