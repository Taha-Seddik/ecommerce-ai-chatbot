'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { products, reviews } from '@/db/schema';
import { requireUser } from '@/lib/auth/session';
import { reviewSchema } from './reviews.schema';

export type ReviewResult = { ok: true } | { ok: false; error: 'validation' };

export async function addReviewAction(input: unknown): Promise<ReviewResult> {
  const session = await requireUser();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'validation' };
  const { productId, rating, title, body } = parsed.data;

  await db.transaction(async (tx) => {
    // One review per user/product: update if it exists, else insert.
    const [existing] = await tx
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.userId, session.userId)))
      .limit(1);

    if (existing) {
      await tx
        .update(reviews)
        .set({ rating, title: title || null, body: body || null })
        .where(eq(reviews.id, existing.id));
    } else {
      await tx
        .insert(reviews)
        .values({ productId, userId: session.userId, rating, title: title || null, body: body || null });
    }

    // Recompute denormalized rating fields.
    const [agg] = await tx
      .select({ avg: sql<number>`avg(${reviews.rating})`, cnt: sql<number>`count(*)` })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)));

    await tx
      .update(products)
      .set({ ratingAvg: Math.round(Number(agg?.avg ?? 0) * 10) / 10, ratingCount: Number(agg?.cnt ?? 0) })
      .where(eq(products.id, productId));
  });

  revalidatePath('/', 'layout');
  return { ok: true };
}
