import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getUserProfile } from '@/features/account/account.repo';
import { ProfileForm } from '@/features/account/profileForm';
import { getSession } from '@/lib/auth/session';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  const profile = session ? await getUserProfile(session.userId) : null;
  const t = await getTranslations('account');

  return (
    <div>
      <h1 className='font-display text-2xl tracking-tight md:text-3xl'>{t('nav.profile')}</h1>
      <p className='text-muted mt-1 mb-6 text-sm'>{session?.email}</p>
      <ProfileForm
        defaults={{
          firstName: profile?.firstName ?? '',
          lastName: profile?.lastName ?? '',
          telephone: profile?.telephone ?? '',
        }}
      />
    </div>
  );
}
