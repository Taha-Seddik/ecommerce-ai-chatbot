'use server';

import { searchProducts } from '@/features/products/products.repo';
import { pickLocale } from '@/lib/content';

export type SearchHit = {
  slug: string;
  title: string;
  thumbnail: string | null;
  priceCents: number;
  discountPercentage: number;
};

export async function quickSearch(q: string, locale: string): Promise<SearchHit[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  const { rows } = await searchProducts({ q: term, page: 1 });
  return rows.slice(0, 6).map((p) => ({
    slug: p.slug,
    title: pickLocale(p.title, locale),
    thumbnail: p.thumbnail,
    priceCents: p.priceCents,
    discountPercentage: p.discountPercentage,
  }));
}
