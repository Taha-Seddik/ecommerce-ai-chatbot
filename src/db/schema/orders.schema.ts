import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { products } from './catalog.schema';
import { ONLINE_PAYMENT_STATUSES, ORDER_STATUSES, PAYMENT_METHODS } from './enums';
import { pk, timestamps } from './helpers';
import { users } from './users.schema';

/** Shipping address snapshotted onto the order (keeps history stable if the user edits their address). */
export type OrderAddress = {
  fullName?: string;
  email?: string;
  adresse: string;
  telephone: string;
  telephone2?: string;
  zipCode?: string;
  city?: string;
  moreInfos?: string;
};

export const orders = sqliteTable(
  'orders',
  {
    id: pk(),
    reference: text().notNull(),
    // Nullable for guest checkout; email captured separately.
    userId: text().references(() => users.id, { onDelete: 'set null' }),
    email: text(),
    amountCents: integer().notNull(),
    currency: text().notNull().default('USD'),
    status: text({ enum: ORDER_STATUSES }).notNull().default('PendingApproval'),
    paymentMethod: text({ enum: PAYMENT_METHODS }).notNull(),
    onlinePaymentStatus: text({ enum: ONLINE_PAYMENT_STATUSES }),
    addressDetails: text({ mode: 'json' }).$type<OrderAddress>(),
    invoicePath: text(),
    stripeSessionId: text(),
    stripePaymentIntentId: text(),
    gatewayResponse: text({ mode: 'json' }).$type<Record<string, unknown>>(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('orders_reference_uq').on(t.reference),
    index('orders_user_idx').on(t.userId),
    index('orders_status_idx').on(t.status),
  ],
);

export const orderItems = sqliteTable(
  'order_items',
  {
    id: pk(),
    orderId: text()
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: text().references(() => products.id, { onDelete: 'set null' }),
    // Snapshot title + unit price at purchase time so order history never changes.
    titleSnapshot: text().notNull(),
    unitPriceCents: integer().notNull(),
    quantity: integer().notNull(),
  },
  (t) => [index('order_items_order_idx').on(t.orderId)],
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
