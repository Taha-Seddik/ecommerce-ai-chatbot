import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductGrid } from '@/components/product/productGrid';
import { ButtonLink } from '@/components/ui/buttonLink';
import { Container } from '@/components/ui/container';
import { IconArrowRight } from '@/components/ui/icons';
import { Reveal } from '@/components/ui/reveal';
import { getTopCategories } from '@/features/categories/categories.repo';
import { getFeaturedProducts } from '@/features/products/products.repo';
import { getHomepageSettings } from '@/features/settings/settings.repo';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/content';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const [featured, categories, settings] = await Promise.all([
    getFeaturedProducts(8),
    getTopCategories(),
    getHomepageSettings(),
  ]);
  const heroImage = settings?.hero?.image;

  return (
    <>
      {/* Hero */}
      <section>
        <Container className='grid items-center gap-10 py-16 md:grid-cols-2 md:py-24'>
          <Reveal className='flex flex-col items-start gap-6'>
            <span className='text-muted text-xs font-semibold tracking-[0.18em] uppercase'>{t('eyebrow')}</span>
            <h1 className='font-display text-5xl leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl'>
              {t('title')}
            </h1>
            <p className='text-muted max-w-md text-lg leading-relaxed'>{t('subtitle')}</p>
            <div className='mt-2 flex flex-wrap gap-3'>
              <ButtonLink href='/products' variant='primary' size='lg'>
                {t('cta')}
                <IconArrowRight className='size-4' />
              </ButtonLink>
              <ButtonLink href='/products' variant='outline' size='lg'>
                {t('secondaryCta')}
              </ButtonLink>
            </div>
          </Reveal>

          <div className='bg-surface-secondary shadow-soft relative aspect-[4/5] w-full overflow-hidden rounded-2xl md:aspect-square'>
            {heroImage && (
              <Image
                src={heroImage}
                alt=''
                fill
                priority
                sizes='(min-width: 768px) 50vw, 100vw'
                className='object-cover'
              />
            )}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section>
          <Container className='py-12 md:py-16'>
            <div className='mb-8 flex items-end justify-between gap-4'>
              <div>
                <h2 className='font-display text-3xl tracking-tight md:text-4xl'>{t('featured')}</h2>
                <p className='text-muted mt-1 text-sm'>{t('featuredSubtitle')}</p>
              </div>
              <Link href='/products' className='text-accent inline-flex items-center gap-1 text-sm font-medium'>
                {t('cta')}
                <IconArrowRight className='size-4' />
              </Link>
            </div>
            <Reveal>
              <ProductGrid products={featured} locale={locale} priorityCount={4} />
            </Reveal>
          </Container>
        </section>
      )}

      {/* Shop by category */}
      <section>
        <Container className='py-12 md:py-16'>
          <h2 className='font-display mb-8 text-3xl tracking-tight md:text-4xl'>{t('shopByCategory')}</h2>
          <Reveal className='grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6'>
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className='group bg-surface-secondary relative aspect-[3/4] overflow-hidden rounded-2xl'>
                {c.image && (
                  <Image
                    src={c.image}
                    alt=''
                    fill
                    sizes='(min-width: 768px) 25vw, 50vw'
                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-black/55 to-transparent' />
                <span className='font-display absolute bottom-4 left-4 text-lg font-medium text-white'>
                  {pickLocale(c.title, locale)}
                </span>
              </Link>
            ))}
          </Reveal>
        </Container>
      </section>
    </>
  );
}
