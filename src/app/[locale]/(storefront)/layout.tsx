import { setRequestLocale } from 'next-intl/server';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';

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
      <Navbar locale={locale} />
      <main className='flex-1'>{children}</main>
      <Footer locale={locale} />
    </>
  );
}
