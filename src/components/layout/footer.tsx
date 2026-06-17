import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { getTopCategories } from '@/features/categories/categories.repo';
import { Link } from '@/i18n/navigation';
import { BRAND } from '@/lib/brand';
import { pickLocale } from '@/lib/content';

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations('footer');
  const categories = await getTopCategories();
  const tagline = locale === 'fr' ? BRAND.taglineFr : BRAND.taglineEn;

  return (
    <footer className='bg-ink text-ink-foreground mt-20'>
      <Container className='grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4'>
        <div className='flex flex-col gap-3'>
          <span className='font-display text-2xl font-bold tracking-tight text-white'>{BRAND.name}</span>
          <p className='max-w-xs text-sm leading-relaxed text-white/60'>{tagline}</p>
          <form className='mt-3 flex max-w-xs gap-2' aria-label={t('newsletter')}>
            <input
              type='email'
              required
              placeholder={t('emailPlaceholder')}
              className='focus:border-accent h-10 w-full rounded-md border border-white/15 bg-white/10 px-3 text-sm text-white transition-colors outline-none placeholder:text-white/40'
            />
            <button
              type='submit'
              className='h-10 shrink-0 rounded-md bg-white px-4 text-sm font-semibold text-ink transition-opacity hover:opacity-90'>
              {t('subscribe')}
            </button>
          </form>
          <p className='text-xs text-white/40'>{t('newsletterHint')}</p>
        </div>

        <div className='flex flex-col gap-3 text-sm'>
          <span className='font-semibold text-white'>{t('shop')}</span>
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className='text-white/60 transition-colors hover:text-white'>
              {pickLocale(c.title, locale)}
            </Link>
          ))}
        </div>

        <div className='flex flex-col gap-3 text-sm'>
          <span className='font-semibold text-white'>{t('company')}</span>
          <Link href='/products' className='text-white/60 transition-colors hover:text-white'>
            {t('about')}
          </Link>
          <Link href='/products' className='text-white/60 transition-colors hover:text-white'>
            {t('contact')}
          </Link>
        </div>

        <div className='flex flex-col gap-3 text-sm'>
          <span className='font-semibold text-white'>{t('help')}</span>
          <Link href='/products' className='text-white/60 transition-colors hover:text-white'>
            {t('shipping')}
          </Link>
        </div>
      </Container>

      <div className='border-t border-white/10'>
        <Container className='flex h-14 items-center justify-between text-xs text-white/50'>
          <span>
            © {new Date().getFullYear()} {BRAND.name}. {t('rights')}
          </span>
          <span className='font-mono'>{locale.toUpperCase()}</span>
        </Container>
      </div>
    </footer>
  );
}
