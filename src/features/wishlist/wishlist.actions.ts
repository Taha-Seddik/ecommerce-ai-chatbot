'use server';

import { getProductsByIds } from '@/features/products/products.repo';
import type { ProductCardData } from '@/features/products/products.types';
import { getSession } from '@/lib/auth/session';
import { getUserWishlistIds, mergeUserWishlist, setUserWishlist } from './wishlist.repo';

export async function resolveWishlist(ids: string[]): Promise<ProductCardData[]> {
  if (!ids.length) return [];
  const products = await getProductsByIds(ids);
  // Preserve the wishlist order.
  const byId = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is ProductCardData => Boolean(p));
}

export async function persistWishlistAction(ids: string[]): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await setUserWishlist(session.userId, ids);
}

export async function mergeWishlistAction(ids: string[]): Promise<string[]> {
  const session = await getSession();
  if (!session) return ids;
  return mergeUserWishlist(session.userId, ids);
}

export async function getServerWishlistAction(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];
  return getUserWishlistIds(session.userId);
}
