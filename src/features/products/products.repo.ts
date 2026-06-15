import 'server-only';
import { cache } from 'react';
import { type SQL, and, asc, desc, eq, inArray, ne, sql } from 'drizzle-orm';
import { db } from '@/db';
import { products, reviews, users } from '@/db/schema';
import { PAGE_SIZE, type ProductCardData, type ProductSort } from './products.types';

export { PAGE_SIZE };
export type { ProductCardData, ProductSort };

function orderFor(sort: ProductSort): SQL {
  switch (sort) {
    case 'price_asc':
      return asc(products.priceCents);
    case 'price_desc':
      return desc(products.priceCents);
    case 'rating':
      return desc(products.ratingAvg);
    default:
      return desc(products.createdAt);
  }
}

// Lightweight column set for cards/grids — no joins, no heavy text.
const cardColumns = {
  id: products.id,
  slug: products.slug,
  title: products.title,
  priceCents: products.priceCents,
  currency: products.currency,
  discountPercentage: products.discountPercentage,
  thumbnail: products.thumbnail,
  ratingAvg: products.ratingAvg,
  ratingCount: products.ratingCount,
  stock: products.stock,
  isFeatured: products.isFeatured,
};

export async function getProductsByIds(ids: string[]): Promise<ProductCardData[]> {
  if (!ids.length) return [];
  return db.select(cardColumns).from(products).where(inArray(products.id, ids)) as Promise<ProductCardData[]>;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  return db
    .select(cardColumns)
    .from(products)
    .where(and(eq(products.isPublished, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit) as Promise<ProductCardData[]>;
}

export type ListProductsOptions = {
  categoryIds?: string[];
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export type ListProductsResult = {
  rows: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export async function listProducts(opts: ListProductsOptions = {}): Promise<ListProductsResult> {
  const sort = opts.sort ?? 'newest';
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? PAGE_SIZE;

  const where = and(
    eq(products.isPublished, true),
    opts.categoryIds && opts.categoryIds.length ? inArray(products.categoryId, opts.categoryIds) : undefined,
  );

  const [rows, totals] = await Promise.all([
    db
      .select(cardColumns)
      .from(products)
      .where(where)
      .orderBy(orderFor(sort))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ total: sql<number>`count(*)` })
      .from(products)
      .where(where),
  ]);

  const total = totals[0]?.total ?? 0;
  return {
    rows: rows as ProductCardData[],
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// --- Product detail ---

// Wrapped in React cache() so generateMetadata + the page share one query per request.
const detailBySlug = cache((slug: string) =>
  db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] },
      category: true,
    },
  }),
);

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof detailBySlug>>>;

export function getProductBySlug(slug: string) {
  return detailBySlug(slug);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: products.slug }).from(products).where(eq(products.isPublished, true));
  return rows.map((r) => r.slug);
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeId: string,
  limit = 4,
): Promise<ProductCardData[]> {
  if (!categoryId) return [];
  return db
    .select(cardColumns)
    .from(products)
    .where(and(eq(products.isPublished, true), eq(products.categoryId, categoryId), ne(products.id, excludeId)))
    .orderBy(desc(products.ratingAvg))
    .limit(limit) as Promise<ProductCardData[]>;
}

export type ProductReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: Date;
  isVerifiedPurchase: boolean;
  firstName: string;
  lastName: string;
};

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      createdAt: reviews.createdAt,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt));
}
