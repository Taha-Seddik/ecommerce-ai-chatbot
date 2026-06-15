import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { CartHydrator } from '@/features/cart/cartHydrator';
import { WishlistHydrator } from '@/features/wishlist/wishlistHydrator';

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  return (
    <>
      <a
        href='#main'
        className='focus:bg-foreground focus:text-background sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2'>
        {t('skipToContent')}
      </a>
      <CartHydrator />
      <WishlistHydrator />
      <Navbar locale={locale} />
      <main id='main' className='flex-1'>
        {children}
      </main>
      <Footer locale={locale} />
    </>
  );
}
