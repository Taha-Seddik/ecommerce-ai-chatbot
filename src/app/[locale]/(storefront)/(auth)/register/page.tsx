import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { RegisterForm } from '@/features/auth/registerForm';
import { Link } from '@/i18n/navigation';

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return (
    <Container className='flex justify-center py-16 md:py-24'>
      <div className='w-full max-w-sm'>
        <h1 className='font-display text-3xl tracking-tight'>{t('signUp')}</h1>
        <p className='text-muted mt-2 mb-6 text-sm'>{t('registerSubtitle')}</p>
        <RegisterForm />
        <p className='text-muted mt-6 text-sm'>
          {t('haveAccount')}{' '}
          <Link href='/login' className='text-accent font-medium'>
            {t('signIn')}
          </Link>
        </p>
      </div>
    </Container>
  );
}
