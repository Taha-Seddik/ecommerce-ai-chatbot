import { setRequestLocale } from 'next-intl/server';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { CartHydrator } from '@/features/cart/cartHydrator';

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <CartHydrator />
      <Navbar locale={locale} />
      <main className='flex-1'>{children}</main>
      <Footer locale={locale} />
    </>
  );
}
