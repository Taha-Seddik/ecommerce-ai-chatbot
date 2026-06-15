import 'server-only';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { cartItems, carts, products } from '@/db/schema';
import type { SimpleLine } from './cart.types';

async function getOrCreateCartId(userId: string): Promise<string> {
  const [existing] = await db.select({ id: carts.id }).from(carts).where(eq(carts.userId, userId)).limit(1);
  if (existing) return existing.id;
  const [created] = await db.insert(carts).values({ userId }).returning({ id: carts.id });
  return created.id;
}

export async function getUserCartLines(userId: string): Promise<SimpleLine[]> {
  const [cart] = await db.select({ id: carts.id }).from(carts).where(eq(carts.userId, userId)).limit(1);
  if (!cart) return [];
  return db
    .select({ productId: cartItems.productId, quantity: cartItems.quantity })
    .from(cartItems)
    .where(eq(cartItems.cartId, cart.id));
}

/** Drop lines whose product is gone and clamp quantities to available stock. */
async function clampToStock(lines: SimpleLine[]): Promise<SimpleLine[]> {
  const ids = lines.map((l) => l.productId);
  if (!ids.length) return [];
  const rows = await db
    .select({ id: products.id, stock: products.stock })
    .from(products)
    .where(inArray(products.id, ids));
  const stockById = new Map(rows.map((r) => [r.id, r.stock]));
  return lines
    .filter((l) => stockById.has(l.productId))
    .map((l) => ({ productId: l.productId, quantity: Math.min(l.quantity, stockById.get(l.productId)!) }))
    .filter((l) => l.quantity > 0);
}

/** Replace the user's cart with exactly these lines (clamped). Returns the stored lines. */
export async function setUserCart(userId: string, lines: SimpleLine[]): Promise<SimpleLine[]> {
  const cartId = await getOrCreateCartId(userId);
  const clamped = await clampToStock(lines);
  await db.transaction(async (tx) => {
    await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
    if (clamped.length) {
      await tx.insert(cartItems).values(clamped.map((l) => ({ cartId, productId: l.productId, quantity: l.quantity })));
    }
  });
  return clamped;
}

/** Merge guest lines into the user's cart (qty = max(existing, guest)), clamped. */
export async function mergeGuestLines(userId: string, guestLines: SimpleLine[]): Promise<SimpleLine[]> {
  const existing = await getUserCartLines(userId);
  const byId = new Map<string, number>();
  for (const l of existing) byId.set(l.productId, l.quantity);
  for (const l of guestLines) byId.set(l.productId, Math.max(byId.get(l.productId) ?? 0, l.quantity));
  const merged = Array.from(byId, ([productId, quantity]) => ({ productId, quantity }));
  return setUserCart(userId, merged);
}
