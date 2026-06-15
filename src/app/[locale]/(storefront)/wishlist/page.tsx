import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { WishlistGrid } from '@/features/wishlist/wishlistGrid';

export default async function WishlistPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('wishlist');

  return (
    <Container className='py-12 md:py-16'>
      <h1 className='font-display mb-8 text-3xl tracking-tight md:text-4xl'>{t('title')}</h1>
      <WishlistGrid />
    </Container>
  );
}
