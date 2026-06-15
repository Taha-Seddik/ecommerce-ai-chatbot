import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { wishlistItems, wishlists } from '@/db/schema';

async function getOrCreateWishlistId(userId: string): Promise<string> {
  const [existing] = await db.select({ id: wishlists.id }).from(wishlists).where(eq(wishlists.userId, userId)).limit(1);
  if (existing) return existing.id;
  const [created] = await db.insert(wishlists).values({ userId }).returning({ id: wishlists.id });
  return created.id;
}

export async function getUserWishlistIds(userId: string): Promise<string[]> {
  const [w] = await db.select({ id: wishlists.id }).from(wishlists).where(eq(wishlists.userId, userId)).limit(1);
  if (!w) return [];
  const rows = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.wishlistId, w.id));
  return rows.map((r) => r.productId);
}

export async function setUserWishlist(userId: string, ids: string[]): Promise<void> {
  const wishlistId = await getOrCreateWishlistId(userId);
  await db.transaction(async (tx) => {
    await tx.delete(wishlistItems).where(eq(wishlistItems.wishlistId, wishlistId));
    if (ids.length) await tx.insert(wishlistItems).values(ids.map((productId) => ({ wishlistId, productId })));
  });
}

export async function mergeUserWishlist(userId: string, ids: string[]): Promise<string[]> {
  const existing = await getUserWishlistIds(userId);
  const merged = Array.from(new Set([...existing, ...ids]));
  await setUserWishlist(userId, merged);
  return merged;
}
