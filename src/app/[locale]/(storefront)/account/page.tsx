import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { logoutAction } from '@/features/auth/auth.actions';
import { requireUser } from '@/lib/auth/session';

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireUser();
  const t = await getTranslations('auth');

  return (
    <Container className='py-12 md:py-16'>
      <h1 className='font-display text-3xl tracking-tight md:text-4xl'>{t('accountTitle')}</h1>
      <p className='text-muted mt-2'>{t('welcome', { email: session.email })}</p>

      <form action={logoutAction} className='mt-6'>
        <button
          type='submit'
          className='border-border hover:bg-surface-secondary inline-flex h-11 items-center rounded-[var(--radius)] border px-5 text-sm font-medium transition-colors'>
          {t('logout')}
        </button>
      </form>
    </Container>
  );
}
