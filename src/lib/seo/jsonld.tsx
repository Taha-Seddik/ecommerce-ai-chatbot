import type { ProductDetail } from '@/features/products/products.repo';
import { pickLocale } from '@/lib/content';
import { discountedCents } from '@/lib/money';

/** Product structured data (schema.org) for rich search results. */
export function ProductJsonLd({ product, locale }: { product: ProductDetail; locale: string }) {
  const price = (discountedCents(product.priceCents, product.discountPercentage) / 100).toFixed(2);

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pickLocale(product.title, locale),
    description: pickLocale(product.description, locale),
    image: product.images.map((i) => i.url),
    sku: product.reference,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: product.currency,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(product.ratingCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingAvg,
        reviewCount: product.ratingCount,
      },
    }),
  };

  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
