import { BRAND } from '@/lib/brand';
import { env } from '@/lib/env';

/** Organization + WebSite (with SearchAction) structured data, rendered site-wide. */
export function SiteJsonLd({ locale }: { locale: string }) {
  const base = env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  const data = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND.name, url: base },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: BRAND.name,
      url: `${base}/${locale}`,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${base}/${locale}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
