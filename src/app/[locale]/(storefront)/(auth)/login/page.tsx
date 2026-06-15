import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { LoginForm } from '@/features/auth/loginForm';
import { Link } from '@/i18n/navigation';

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return (
    <Container className='flex justify-center py-16 md:py-24'>
      <div className='w-full max-w-sm'>
        <h1 className='font-display text-3xl tracking-tight'>{t('signIn')}</h1>
        <p className='text-muted mt-2 mb-6 text-sm'>{t('loginSubtitle')}</p>
        <LoginForm />
        <p className='text-muted mt-6 text-sm'>
          {t('noAccount')}{' '}
          <Link href='/register' className='text-accent font-medium'>
            {t('signUp')}
          </Link>
        </p>
        <p className='border-border text-muted mt-6 rounded-lg border border-dashed p-3 text-xs'>{t('demoHint')}</p>
      </div>
    </Container>
  );
}
