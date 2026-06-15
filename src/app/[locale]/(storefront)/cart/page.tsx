import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { CartContents } from '@/features/cart/cartContents';

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cart');

  return (
    <Container className='py-12 md:py-16'>
      <h1 className='font-display mb-8 text-3xl tracking-tight md:text-4xl'>{t('title')}</h1>
      <div className='max-w-2xl'>
        <CartContents locale={locale} />
      </div>
    </Container>
  );
}
