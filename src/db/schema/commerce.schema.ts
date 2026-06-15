import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { products } from './catalog.schema';
import { pk, timestamps } from './helpers';
import { users } from './users.schema';

export const carts = sqliteTable(
  'carts',
  {
    id: pk(),
    userId: text().references(() => users.id, { onDelete: 'cascade' }),
    // Optional cross-device guest cart keyed by an httpOnly cookie (localStorage is the default).
    anonToken: text(),
    ...timestamps(),
  },
  (t) => [index('carts_user_idx').on(t.userId), index('carts_anon_idx').on(t.anonToken)],
);

export const cartItems = sqliteTable(
  'cart_items',
  {
    id: pk(),
    cartId: text()
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer().notNull().default(1),
  },
  (t) => [uniqueIndex('cart_items_uq').on(t.cartId, t.productId)],
);

export const wishlists = sqliteTable(
  'wishlists',
  {
    id: pk(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ...timestamps(),
  },
  (t) => [uniqueIndex('wishlists_user_uq').on(t.userId)],
);

export const wishlistItems = sqliteTable(
  'wishlist_items',
  {
    id: pk(),
    wishlistId: text()
      .notNull()
      .references(() => wishlists.id, { onDelete: 'cascade' }),
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('wishlist_items_uq').on(t.wishlistId, t.productId)],
);

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  items: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, { fields: [wishlistItems.wishlistId], references: [wishlists.id] }),
  product: one(products, { fields: [wishlistItems.productId], references: [products.id] }),
}));
