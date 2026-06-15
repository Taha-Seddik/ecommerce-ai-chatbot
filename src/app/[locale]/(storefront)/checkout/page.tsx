import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { getUserProfile } from '@/features/account/account.repo';
import { CheckoutForm } from '@/features/checkout/checkoutForm';
import { getSession } from '@/lib/auth/session';
import { isStripeEnabled } from '@/lib/stripe';

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('checkout');

  const session = await getSession();
  const profile = session ? await getUserProfile(session.userId) : null;
  const defaults = profile
    ? {
        fullName: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        telephone: profile.telephone ?? '',
        adresse: profile.adresse ?? '',
        city: profile.city ?? '',
        zipCode: profile.zipCode ?? '',
      }
    : {};

  return (
    <Container className='py-10 md:py-14'>
      <h1 className='font-display mb-8 text-3xl tracking-tight md:text-4xl'>{t('title')}</h1>
      <CheckoutForm locale={locale} defaults={defaults} stripeEnabled={isStripeEnabled} />
    </Container>
  );
}
