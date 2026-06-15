import { relations } from 'drizzle-orm';
import { type AnySQLiteColumn, index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { MEDIA_TYPES } from './enums';
import { type LocalizedText, createdAt, pk, timestamps } from './helpers';
import { users } from './users.schema';

export const categories = sqliteTable(
  'categories',
  {
    id: pk(),
    slug: text().notNull(),
    title: text({ mode: 'json' }).$type<LocalizedText>().notNull(),
    image: text(),
    icon: text(),
    show: integer({ mode: 'boolean' }).notNull().default(true),
    // Self-referential hierarchy (top-level category → sub-categories).
    parentCategoryId: text().references((): AnySQLiteColumn => categories.id, { onDelete: 'set null' }),
    sortOrder: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('categories_slug_uq').on(t.slug), index('categories_parent_idx').on(t.parentCategoryId)],
);

export const products = sqliteTable(
  'products',
  {
    id: pk(),
    reference: text().notNull(),
    slug: text().notNull(),
    title: text({ mode: 'json' }).$type<LocalizedText>().notNull(),
    description: text({ mode: 'json' }).$type<LocalizedText>().notNull(),
    descriptionHtml: text({ mode: 'json' }).$type<LocalizedText>(),
    // Denormalized first image for fast listing/card rendering.
    thumbnail: text(),
    priceCents: integer().notNull(),
    currency: text().notNull().default('USD'),
    shippingCostCents: integer().notNull().default(0),
    discountPercentage: integer().notNull().default(0),
    stock: integer().notNull().default(0),
    lowStockThreshold: integer().notNull().default(5),
    dimensions: text(),
    addToPacks: integer({ mode: 'boolean' }).notNull().default(false),
    // Denormalized from `reviews`, recomputed in a transaction on review changes.
    ratingAvg: real().notNull().default(0),
    ratingCount: integer().notNull().default(0),
    isPublished: integer({ mode: 'boolean' }).notNull().default(true),
    isFeatured: integer({ mode: 'boolean' }).notNull().default(false),
    categoryId: text().references(() => categories.id, { onDelete: 'set null' }),
    createdById: text().references(() => users.id, { onDelete: 'set null' }),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex('products_slug_uq').on(t.slug),
    uniqueIndex('products_reference_uq').on(t.reference),
    index('products_category_idx').on(t.categoryId),
    index('products_price_idx').on(t.priceCents),
    index('products_published_idx').on(t.isPublished),
    index('products_featured_idx').on(t.isFeatured),
    index('products_created_idx').on(t.createdAt),
  ],
);

export const productImages = sqliteTable(
  'product_images',
  {
    id: pk(),
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    type: text({ enum: MEDIA_TYPES }).notNull().default('Image'),
    url: text().notNull(),
    thumbnailUrl: text(),
    alt: text(),
    width: integer(),
    height: integer(),
    blurDataUrl: text(),
    sortOrder: integer().notNull().default(0),
  },
  (t) => [index('product_images_product_idx').on(t.productId)],
);

export const reviews = sqliteTable(
  'reviews',
  {
    id: pk(),
    productId: text()
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer().notNull(), // 1..5, enforced in Zod
    title: text(),
    body: text(),
    isVerifiedPurchase: integer({ mode: 'boolean' }).notNull().default(false),
    isApproved: integer({ mode: 'boolean' }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [
    index('reviews_product_idx').on(t.productId),
    uniqueIndex('reviews_one_per_user_uq').on(t.productId, t.userId),
  ],
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
    relationName: 'categoryHierarchy',
  }),
  children: many(categories, { relationName: 'categoryHierarchy' }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  createdBy: one(users, { fields: [products.createdById], references: [users.id] }),
  images: many(productImages),
  reviews: many(reviews),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));
