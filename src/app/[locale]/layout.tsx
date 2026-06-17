import type { Metadata } from 'next';
import { Cairo, Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Providers } from '@/app/providers';
import { BRAND } from '@/lib/brand';
import { env } from '@/lib/env';
import { SiteJsonLd } from '@/lib/seo/siteJsonLd';
import { routing } from '@/i18n/routing';
import '../globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });
// Arabic-capable family, applied for the `ar` locale (see globals.css html[lang='ar']).
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  title: { default: `${BRAND.name} — ${BRAND.taglineEn}`, template: `%s · ${BRAND.name}` },
  description: BRAND.descriptionEn,
  alternates: { languages: { en: '/en', fr: '/fr' } },
  openGraph: { type: 'website', siteName: BRAND.name },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for this locale.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${cairo.variable}`}>
      <body className='bg-background text-foreground flex min-h-dvh flex-col font-sans antialiased'>
        <SiteJsonLd locale={locale} />
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
