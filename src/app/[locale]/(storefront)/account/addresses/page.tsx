import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getUserProfile } from '@/features/account/account.repo';
import { AddressForm } from '@/features/account/addressForm';
import { getSession } from '@/lib/auth/session';

export default async function AddressesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  const profile = session ? await getUserProfile(session.userId) : null;
  const t = await getTranslations('account');

  return (
    <div>
      <h1 className='font-display text-2xl tracking-tight md:text-3xl'>{t('nav.addresses')}</h1>
      <p className='text-muted mt-1 mb-6 text-sm'>{t('addressHint')}</p>
      <AddressForm
        defaults={{
          adresse: profile?.adresse ?? '',
          city: profile?.city ?? '',
          zipCode: profile?.zipCode ?? '',
          telephone: profile?.telephone ?? '',
        }}
      />
    </div>
  );
}
