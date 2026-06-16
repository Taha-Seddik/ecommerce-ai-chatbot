'use server';

import { getProductBySlug } from '@/features/products/products.repo';
import { pickLocale } from '@/lib/content';

export type QuickViewData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceCents: number;
  discountPercentage: number;
  currency: string;
  stock: number;
  ratingAvg: number;
  ratingCount: number;
  image: string | null;
};

export async function getQuickView(slug: string, locale: string): Promise<QuickViewData | null> {
  const p = await getProductBySlug(slug);
  if (!p) return null;
  return {
    id: p.id,
    slug: p.slug,
    title: pickLocale(p.title, locale),
    description: pickLocale(p.description, locale),
    priceCents: p.priceCents,
    discountPercentage: p.discountPercentage,
    currency: p.currency,
    stock: p.stock,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    image: p.images[0]?.url ?? p.thumbnail ?? null,
  };
}
