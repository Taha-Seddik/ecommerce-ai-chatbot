import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AddToCart } from '@/components/product/addToCart';
import { Price } from '@/components/product/price';
import { ProductGallery } from '@/components/product/productGallery';
import { ProductGrid } from '@/components/product/productGrid';
import { RatingStars } from '@/components/product/ratingStars';
import { ReviewList } from '@/components/product/reviewList';
import { WishlistButton } from '@/features/wishlist/wishlistButton';
import { ReviewForm } from '@/features/reviews/reviewForm';
import { getSession } from '@/lib/auth/session';
import { Link } from '@/i18n/navigation';
import { Breadcrumb, type Crumb } from '@/components/ui/breadcrumb';
import { Container } from '@/components/ui/container';
import {
  getAllProductSlugs,
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
} from '@/features/products/products.repo';
import { pickLocale } from '@/lib/content';
import { formatPrice } from '@/lib/money';
import { ProductJsonLd } from '@/lib/seo/jsonld';

// ISR — prerender product pages, revalidate hourly (and on-demand from admin edits later).
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const title = pickLocale(product.title, locale);
  const description = pickLocale(product.description, locale).slice(0, 160);
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/products/${slug}`,
      languages: { en: `/en/products/${slug}`, fr: `/fr/products/${slug}` },
    },
    openGraph: { title, description, type: 'website', images: product.images.map((i) => ({ url: i.url })) },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations();
  const [related, reviews, session] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id, 4),
    getProductReviews(product.id),
    getSession(),
  ]);

  const title = pickLocale(product.title, locale);
  const description = pickLocale(product.description, locale);
  const lowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const crumbs: Crumb[] = [{ label: t('nav.home'), href: '/' }];
  if (product.category)
    crumbs.push({ label: pickLocale(product.category.title, locale), href: `/category/${product.category.slug}` });
  crumbs.push({ label: title });

  return (
    <Container className='py-8 md:py-12'>
      <ProductJsonLd product={product} locale={locale} />
      <Breadcrumb items={crumbs} />

      <div className='mt-6 grid gap-8 md:grid-cols-2 md:gap-12'>
        <ProductGallery images={product.images} title={title} />

        <div className='flex flex-col gap-5'>
          {product.category && (
            <span className='text-muted text-xs font-semibold tracking-[0.14em] uppercase'>
              {pickLocale(product.category.title, locale)}
            </span>
          )}
          <h1 className='font-display text-3xl leading-tight tracking-tight md:text-4xl'>{title}</h1>

          {product.ratingCount > 0 && (
            <a href='#reviews' className='w-fit'>
              <RatingStars value={product.ratingAvg} count={product.ratingCount} />
            </a>
          )}

          <Price priceCents={product.priceCents} discount={product.discountPercentage} className='text-2xl' />

          <p className='text-muted leading-relaxed'>{description}</p>

          <div className='flex flex-wrap gap-2 text-sm'>
            {product.stock > 0 ? (
              <span className='bg-success-soft text-success-soft-foreground rounded-full px-3 py-1'>
                {lowStock ? t('product.lowStock', { count: product.stock }) : t('product.inStock')}
              </span>
            ) : (
              <span className='bg-danger-soft text-danger-soft-foreground rounded-full px-3 py-1'>
                {t('product.outOfStock')}
              </span>
            )}
            <span className='bg-surface-secondary rounded-full px-3 py-1'>
              {product.shippingCostCents === 0
                ? t('product.freeShipping')
                : `${t('product.shipping')}: ${formatPrice(product.shippingCostCents, product.currency, locale)}`}
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <div className='flex-1'>
              <AddToCart productId={product.id} stock={product.stock} />
            </div>
            <WishlistButton productId={product.id} className='border-border size-11 border' />
          </div>

          <dl className='border-border mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t pt-5 text-sm'>
            <dt className='text-muted'>{t('product.sku')}</dt>
            <dd className='font-mono'>{product.reference}</dd>
            {product.dimensions && (
              <>
                <dt className='text-muted'>{t('product.dimensions')}</dt>
                <dd>{product.dimensions}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      <section id='reviews' className='mt-16 max-w-2xl scroll-mt-24'>
        <h2 className='font-display mb-6 text-2xl tracking-tight'>
          {t('product.reviewsTitle')} · {t('product.reviews', { count: product.ratingCount })}
        </h2>
        {reviews.length > 0 && <ReviewList reviews={reviews} />}
        {session ? (
          <ReviewForm productId={product.id} />
        ) : (
          <p className='text-muted mt-6 text-sm'>
            {t('product.signInToReview')}{' '}
            <Link href='/login' className='text-accent font-medium'>
              {t('auth.signIn')}
            </Link>
          </p>
        )}
      </section>

      {related.length > 0 && (
        <section className='mt-16'>
          <h2 className='font-display mb-8 text-2xl tracking-tight md:text-3xl'>{t('product.relatedProducts')}</h2>
          <ProductGrid products={related} locale={locale} />
        </section>
      )}
    </Container>
  );
}
