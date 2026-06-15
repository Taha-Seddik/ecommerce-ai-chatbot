import { Button } from '@heroui/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { LocaleSwitcher } from '@/components/layout/localeSwitcher';
import { ThemeToggle } from '@/components/ui/themeToggle';
import { BRAND } from '@/lib/brand';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <>
      {/* Temporary Phase 0 top bar — replaced by the full Navbar in Phase 2. */}
      <header className='border-border border-b'>
        <Container className='flex h-16 items-center justify-between'>
          <span className='font-display text-xl font-medium tracking-tight'>{BRAND.name}</span>
          <div className='flex items-center gap-1'>
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </Container>
      </header>

      <main className='flex flex-1 flex-col'>
        <section className='relative overflow-hidden'>
          <Container className='grid items-center gap-10 py-20 md:grid-cols-2 md:py-28 lg:py-32'>
            <div className='flex flex-col items-start gap-6'>
              <span className='text-muted text-xs font-semibold tracking-[0.18em] uppercase'>{t('eyebrow')}</span>
              <h1 className='font-display text-5xl leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl'>
                {t('title')}
              </h1>
              <p className='text-muted max-w-md text-lg leading-relaxed'>{t('subtitle')}</p>
              <div className='mt-2 flex flex-wrap gap-3'>
                <Button variant='primary' size='lg'>
                  {t('cta')}
                </Button>
                <Button variant='outline' size='lg'>
                  {t('secondaryCta')}
                </Button>
              </div>
            </div>

            <div className='bg-surface-secondary shadow-soft relative aspect-[4/5] w-full overflow-hidden rounded-2xl md:aspect-square'>
              <div className='absolute inset-0 grid place-items-center'>
                <span className='font-display text-muted text-2xl'>{BRAND.name}</span>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <footer className='border-border border-t'>
        <Container className='text-muted flex h-16 items-center justify-between text-sm'>
          <span>
            © {BRAND.name} — {locale === 'fr' ? BRAND.taglineFr : BRAND.taglineEn}
          </span>
          <span className='font-mono text-xs'>Phase 0</span>
        </Container>
      </footer>
    </>
  );
}
