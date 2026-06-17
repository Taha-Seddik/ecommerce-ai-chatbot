import 'server-only';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  type OnlinePaymentStatus,
  type OrderAddress,
  type OrderStatus,
  type PaymentMethod,
  cartItems,
  carts,
  orderItems,
  orders,
  products,
} from '@/db/schema';
import { makeOrderRef } from '@/lib/orderRef';

export type OrderItemInput = {
  productId: string;
  titleSnapshot: string;
  unitPriceCents: number;
  quantity: number;
};

export type CreateOrderInput = {
  userId: string | null;
  email: string | null;
  currency: string;
  amountCents: number;
  paymentMethod: PaymentMethod;
  status?: OrderStatus;
  onlinePaymentStatus?: OnlinePaymentStatus;
  address: OrderAddress;
  items: OrderItemInput[];
  decrementStock?: boolean;
};

export async function createOrder(input: CreateOrderInput) {
  const reference = makeOrderRef();
  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        reference,
        userId: input.userId ?? undefined,
        email: input.email ?? undefined,
        amountCents: input.amountCents,
        currency: input.currency,
        status: input.status ?? 'PendingApproval',
        paymentMethod: input.paymentMethod,
        onlinePaymentStatus: input.onlinePaymentStatus,
        addressDetails: input.address,
      })
      .returning();

    await tx.insert(orderItems).values(input.items.map((i) => ({ orderId: order.id, ...i })));

    if (input.decrementStock) {
      for (const i of input.items) {
        await tx
          .update(products)
          .set({ stock: sql`max(0, ${products.stock} - ${i.quantity})` })
          .where(eq(products.id, i.productId));
      }
    }
    return order;
  });
}

export async function setOrderStripeSession(orderId: string, sessionId: string): Promise<void> {
  await db.update(orders).set({ stripeSessionId: sessionId }).where(eq(orders.id, orderId));
}

export async function getOrderById(id: string) {
  return db.query.orders.findFirst({ where: eq(orders.id, id), with: { items: true } });
}

export type OrderWithItems = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;

export async function getUserOrders(userId: string) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
  });
}

/** Webhook entry point: mark paid, decrement stock, clear the user's cart. Idempotent. */
export async function markOrderPaid(orderId: string, paymentIntentId?: string): Promise<void> {
  await db.transaction(async (tx) => {
    // Atomically claim the order — only the first delivery flips it to Approved, so concurrent
    // webhook retries can't double-decrement stock (the conditional WHERE + returning is the lock).
    const claimed = await tx
      .update(orders)
      .set({ status: 'Approved', onlinePaymentStatus: 'Success', stripePaymentIntentId: paymentIntentId })
      .where(and(eq(orders.id, orderId), ne(orders.status, 'Approved')))
      .returning({ userId: orders.userId });
    if (claimed.length === 0) return; // already processed

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      if (item.productId) {
        await tx
          .update(products)
          .set({ stock: sql`max(0, ${products.stock} - ${item.quantity})` })
          .where(eq(products.id, item.productId));
      }
    }

    const userId = claimed[0]?.userId;
    if (userId) {
      const [cart] = await tx.select({ id: carts.id }).from(carts).where(eq(carts.userId, userId)).limit(1);
      if (cart) await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }
  });
}

/** Mark a pending online order as failed (session expired / payment declined). Never touches a paid order. */
export async function markOrderFailed(orderId: string): Promise<void> {
  await db
    .update(orders)
    .set({ status: 'Failed', onlinePaymentStatus: 'Failed' })
    .where(and(eq(orders.id, orderId), ne(orders.status, 'Approved')));
}
