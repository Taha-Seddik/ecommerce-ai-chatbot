import type { MetadataRoute } from 'next';
import { getNavCategories } from '@/features/categories/categories.repo';
import { getAllProductSlugs } from '@/features/products/products.repo';
import { routing } from '@/i18n/routing';
import { env } from '@/lib/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  const [slugs, navCategories] = await Promise.all([getAllProductSlugs(), getNavCategories()]);
  const categories = navCategories.flatMap((top) => [top, ...top.children]);

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    const prefix = `${base}/${locale}`;
    entries.push({ url: prefix, changeFrequency: 'weekly', priority: 1 });
    for (const path of ['/products', '/search']) {
      entries.push({ url: `${prefix}${path}`, changeFrequency: 'weekly', priority: 0.7 });
    }
    for (const c of categories) {
      entries.push({ url: `${prefix}/category/${c.slug}`, changeFrequency: 'weekly', priority: 0.6 });
    }
    for (const slug of slugs) {
      entries.push({ url: `${prefix}/products/${slug}`, changeFrequency: 'weekly', priority: 0.8 });
    }
  }
  return entries;
}
