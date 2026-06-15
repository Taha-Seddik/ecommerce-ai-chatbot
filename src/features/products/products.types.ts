/** Shared product types/constants safe to import from client and server. */

export const PAGE_SIZE = 12;

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'rating';
export const PRODUCT_SORTS: ProductSort[] = ['newest', 'price_asc', 'price_desc', 'rating'];

/** Coerce a raw searchParam value into a valid sort / page. */
export function parseSort(value: string | string[] | undefined): ProductSort {
  const v = Array.isArray(value) ? value[0] : value;
  return PRODUCT_SORTS.includes(v as ProductSort) ? (v as ProductSort) : 'newest';
}

export function parsePage(value: string | string[] | undefined): number {
  const v = Array.isArray(value) ? value[0] : value;
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export type ProductCardData = {
  id: string;
  slug: string;
  title: { en: string; fr: string };
  priceCents: number;
  currency: string;
  discountPercentage: number;
  thumbnail: string | null;
  ratingAvg: number;
  ratingCount: number;
  stock: number;
  isFeatured: boolean;
};
