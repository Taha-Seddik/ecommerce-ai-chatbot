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
    <footer className='border-border mt-20 border-t'>
      <Container className='grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4'>
        <div className='flex flex-col gap-3'>
          <span className='font-display text-xl font-medium tracking-tight'>{BRAND.name}</span>
          <p className='text-muted max-w-xs text-sm leading-relaxed'>{tagline}</p>
          <form className='mt-3 flex max-w-xs gap-2' aria-label={t('newsletter')}>
            <input
              type='email'
              required
              placeholder={t('emailPlaceholder')}
              className='border-border bg-surface focus:border-accent h-10 w-full rounded-lg border px-3 text-sm transition-colors outline-none'
            />
            <button
              type='submit'
              className='bg-foreground text-background h-10 shrink-0 rounded-lg px-4 text-sm font-medium transition-opacity hover:opacity-90'>
              {t('subscribe')}
            </button>
          </form>
          <p className='text-muted text-xs'>{t('newsletterHint')}</p>
        </div>

        <div className='flex flex-col gap-3 text-sm'>
          <span className='font-medium'>{t('shop')}</span>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className='text-muted hover:text-foreground transition-colors'>
              {pickLocale(c.title, locale)}
            </Link>
          ))}
        </div>

        <div className='flex flex-col gap-3 text-sm'>
          <span className='font-medium'>{t('company')}</span>
          <Link href='/products' className='text-muted hover:text-foreground transition-colors'>
            {t('about')}
          </Link>
          <Link href='/products' className='text-muted hover:text-foreground transition-colors'>
            {t('contact')}
          </Link>
        </div>

        <div className='flex flex-col gap-3 text-sm'>
          <span className='font-medium'>{t('help')}</span>
          <Link href='/products' className='text-muted hover:text-foreground transition-colors'>
            {t('shipping')}
          </Link>
        </div>
      </Container>

      <div className='border-border border-t'>
        <Container className='text-muted flex h-14 items-center justify-between text-xs'>
          <span>
            © {new Date().getFullYear()} {BRAND.name}. {t('rights')}
          </span>
          <span className='font-mono'>{locale.toUpperCase()}</span>
        </Container>
      </div>
    </footer>
  );
}
