import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductGrid } from '@/components/product/productGrid';
import { ButtonLink } from '@/components/ui/buttonLink';
import { Container } from '@/components/ui/container';
import { IconArrowRight, IconReturn, IconShield, IconTruck, IconWallet } from '@/components/ui/icons';
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

  const valueProps = [
    { Icon: IconTruck, title: t('vpDelivery'), sub: t('vpDeliverySub') },
    { Icon: IconWallet, title: t('vpCod'), sub: t('vpCodSub') },
    { Icon: IconReturn, title: t('vpReturns'), sub: t('vpReturnsSub') },
    { Icon: IconShield, title: t('vpWarranty'), sub: t('vpWarrantySub') },
  ];

  return (
    <>
      {/* Hero */}
      <section className='border-border border-b'>
        <Container className='grid items-center gap-8 py-10 md:grid-cols-2 md:py-14'>
          <div className='flex flex-col items-start gap-5'>
            <span className='bg-sale text-sale-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase'>
              {t('heroPromo')}
            </span>
            <h1 className='font-display text-5xl leading-[0.98] font-bold tracking-tight text-balance md:text-6xl lg:text-7xl'>
              {t('title')}
            </h1>
            <p className='text-muted max-w-md text-lg leading-relaxed'>{t('subtitle')}</p>
            <div className='mt-1 flex flex-wrap gap-3'>
              <ButtonLink href='/products' variant='primary' size='lg'>
                {t('cta')}
                <IconArrowRight className='size-4' />
              </ButtonLink>
              <ButtonLink href='/products' variant='outline' size='lg'>
                {t('secondaryCta')}
              </ButtonLink>
            </div>
          </div>

          <div className='bg-surface-secondary shadow-lifted relative aspect-4/3 w-full overflow-hidden rounded-lg'>
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

      {/* Value props */}
      <section className='bg-surface-secondary border-border border-b'>
        <Container className='grid grid-cols-2 gap-x-6 gap-y-5 py-6 md:grid-cols-4'>
          {valueProps.map(({ Icon, title, sub }) => (
            <div key={title} className='flex items-center gap-3'>
              <span className='text-accent shrink-0'>
                <Icon className='size-6' />
              </span>
              <div className='leading-tight'>
                <div className='text-sm font-semibold'>{title}</div>
                <div className='text-muted text-xs'>{sub}</div>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section>
          <Container className='py-12 md:py-16'>
            <div className='mb-8 flex items-end justify-between gap-4'>
              <div>
                <span className='text-accent text-xs font-bold tracking-[0.16em] uppercase'>{t('eyebrow')}</span>
                <h2 className='font-display mt-1 text-3xl font-bold tracking-tight md:text-4xl'>{t('featured')}</h2>
              </div>
              <Link href='/products' className='text-accent inline-flex items-center gap-1 text-sm font-semibold'>
                {t('cta')}
                <IconArrowRight className='size-4' />
              </Link>
            </div>
            <ProductGrid products={featured} locale={locale} priorityCount={4} />
          </Container>
        </section>
      )}

      {/* Sale banner */}
      <section>
        <Container className='pb-12 md:pb-16'>
          <div className='bg-accent text-accent-foreground relative overflow-hidden rounded-xl px-8 py-12 md:px-14 md:py-16'>
            <div className='relative z-10 max-w-xl'>
              <span className='text-xs font-bold tracking-[0.18em] uppercase opacity-80'>{t('saleEyebrow')}</span>
              <h2 className='font-display mt-2 text-4xl font-bold tracking-tight md:text-5xl'>{t('saleTitle')}</h2>
              <p className='mt-3 max-w-md text-base opacity-90'>{t('saleSubtitle')}</p>
              <Link
                href='/products'
                className='bg-sale text-sale-foreground mt-6 inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5'>
                {t('saleCta')}
                <IconArrowRight className='size-4' />
              </Link>
            </div>
            <div className='pointer-events-none absolute -top-24 -right-10 size-72 rounded-full bg-white/10' />
            <div className='pointer-events-none absolute right-32 -bottom-28 size-80 rounded-full bg-white/5' />
          </div>
        </Container>
      </section>

      {/* Shop by category */}
      <section className='bg-surface-secondary border-border border-t'>
        <Container className='py-12 md:py-16'>
          <div className='mb-8 flex items-end justify-between'>
            <h2 className='font-display text-3xl font-bold tracking-tight md:text-4xl'>{t('shopByCategory')}</h2>
            <Link
              href='/products'
              className='text-accent hidden items-center gap-1 text-sm font-semibold sm:inline-flex'>
              {t('cta')}
              <IconArrowRight className='size-4' />
            </Link>
          </div>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6'>
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className='group bg-surface shadow-soft relative aspect-4/5 overflow-hidden rounded-lg'>
                {c.image && (
                  <Image
                    src={c.image}
                    alt=''
                    fill
                    sizes='(min-width: 768px) 25vw, 50vw'
                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                )}
                <div className='absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent' />
                <span className='font-display absolute bottom-4 left-4 text-lg font-bold text-white'>
                  {pickLocale(c.title, locale)}
                </span>
                <span className='absolute right-4 bottom-5 translate-x-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100'>
                  <IconArrowRight className='size-5' />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
