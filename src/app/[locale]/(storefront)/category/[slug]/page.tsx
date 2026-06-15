import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyState } from '@/components/catalog/emptyState';
import { Pagination } from '@/components/catalog/pagination';
import { SortSelect } from '@/components/catalog/sortSelect';
import { ProductGrid } from '@/components/product/productGrid';
import { Breadcrumb, type Crumb } from '@/components/ui/breadcrumb';
import { Container } from '@/components/ui/container';
import { getCategoryById, getCategoryBySlug, getChildCategories } from '@/features/categories/categories.repo';
import { listProducts } from '@/features/products/products.repo';
import { parsePage, parseSort } from '@/features/products/products.types';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/content';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: SearchParams;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [children, parent, sp, t] = await Promise.all([
    getChildCategories(category.id),
    category.parentCategoryId ? getCategoryById(category.parentCategoryId) : Promise.resolve(null),
    searchParams,
    getTranslations(),
  ]);

  const sort = parseSort(sp.sort);
  const page = parsePage(sp.page);
  const categoryIds = [category.id, ...children.map((c) => c.id)];
  const { rows, total, page: current, pageCount } = await listProducts({ categoryIds, sort, page });
  const title = pickLocale(category.title, locale);

  const crumbs: Crumb[] = [{ label: t('nav.home'), href: '/' }];
  if (parent) crumbs.push({ label: pickLocale(parent.title, locale), href: `/category/${parent.slug}` });
  crumbs.push({ label: title });

  return (
    <Container className='py-10 md:py-14'>
      <Breadcrumb items={crumbs} />

      <div className='mt-4 mb-6 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='font-display text-3xl tracking-tight md:text-4xl'>{title}</h1>
          <p className='text-muted mt-1 text-sm'>{t('catalog.results', { count: total })}</p>
        </div>
        <SortSelect value={sort} basePath={`/category/${slug}`} />
      </div>

      {children.length > 0 && (
        <div className='mb-8 flex flex-wrap gap-2'>
          {children.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className='border-border hover:bg-surface-secondary rounded-full border px-3 py-1.5 text-sm transition-colors'>
              {pickLocale(c.title, locale)}
            </Link>
          ))}
        </div>
      )}

      {rows.length ? (
        <ProductGrid products={rows} locale={locale} />
      ) : (
        <EmptyState title={t('catalog.noResults')} hint={t('catalog.noResultsHint')} />
      )}

      <Pagination page={current} pageCount={pageCount} basePath={`/category/${slug}`} sort={sort} />
    </Container>
  );
}
