'use server';

import { getProductsByIds } from '@/features/products/products.repo';
import { getSession } from '@/lib/auth/session';
import { pickLocale } from '@/lib/content';
import { discountedCents } from '@/lib/money';
import { getUserCartLines, mergeGuestLines, setUserCart } from './cart.repo';
import type { CartView, SimpleLine } from './cart.types';

/** Enrich raw {productId, quantity} lines with authoritative product data + totals. */
export async function resolveCart(lines: SimpleLine[], locale: string): Promise<CartView> {
  const valid = lines.filter((l) => l.quantity > 0);
  const products = await getProductsByIds(valid.map((l) => l.productId));
  const byId = new Map(products.map((p) => [p.id, p]));

  const viewLines = valid.flatMap((l) => {
    const p = byId.get(l.productId);
    if (!p) return [];
    const quantity = Math.min(l.quantity, p.stock);
    if (quantity <= 0) return [];
    const unitPriceCents = discountedCents(p.priceCents, p.discountPercentage);
    return [
      {
        productId: p.id,
        slug: p.slug,
        title: pickLocale(p.title, locale),
        thumbnail: p.thumbnail,
        unitPriceCents,
        currency: p.currency,
        quantity,
        stock: p.stock,
        lineTotalCents: unitPriceCents * quantity,
      },
    ];
  });

  return {
    lines: viewLines,
    subtotalCents: viewLines.reduce((sum, l) => sum + l.lineTotalCents, 0),
    itemCount: viewLines.reduce((sum, l) => sum + l.quantity, 0),
    currency: viewLines[0]?.currency ?? 'USD',
  };
}

/** Persist the cart to the DB for logged-in users; no-op for guests. Best-effort: the client store stays
 *  the source of truth for the session, so a transient DB/session issue never breaks add-to-cart. */
export async function persistCartAction(lines: SimpleLine[]): Promise<void> {
  const session = await getSession();
  if (!session) return;
  try {
    await setUserCart(session.userId, lines);
  } catch (err) {
    console.error('persistCartAction failed; keeping client cart', err);
  }
}

/** Merge the guest cart into the user's DB cart on login; returns the merged lines. */
export async function mergeGuestCartAction(lines: SimpleLine[]): Promise<SimpleLine[]> {
  const session = await getSession();
  if (!session) return lines;
  return mergeGuestLines(session.userId, lines);
}

/** Load the logged-in user's DB cart (for hydration); empty for guests. */
export async function getServerCartAction(): Promise<SimpleLine[]> {
  const session = await getSession();
  if (!session) return [];
  return getUserCartLines(session.userId);
}
