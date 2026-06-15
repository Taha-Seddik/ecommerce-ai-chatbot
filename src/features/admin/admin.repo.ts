import 'server-only';
import { count, desc, eq, lte, sql } from 'drizzle-orm';
import { db } from '@/db';
import { type LocalizedText, type OrderStatus, categories, orders, productImages, products, users } from '@/db/schema';

// --- Dashboard ---

export async function getDashboardStats() {
  const [orderRows, revenueRows, pendingRows, productRows, userRows] = await Promise.all([
    db.select({ v: count() }).from(orders),
    db
      .select({ v: sql<number>`coalesce(sum(${orders.amountCents}), 0)` })
      .from(orders)
      .where(eq(orders.status, 'Approved')),
    db.select({ v: count() }).from(orders).where(eq(orders.status, 'PendingApproval')),
    db.select({ v: count() }).from(products),
    db.select({ v: count() }).from(users),
  ]);
  return {
    orderCount: orderRows[0]?.v ?? 0,
    revenueCents: revenueRows[0]?.v ?? 0,
    pendingCount: pendingRows[0]?.v ?? 0,
    productCount: productRows[0]?.v ?? 0,
    userCount: userRows[0]?.v ?? 0,
  };
}

export async function getLowStockProducts(threshold = 5) {
  return db
    .select({ id: products.id, slug: products.slug, title: products.title, stock: products.stock })
    .from(products)
    .where(lte(products.stock, threshold))
    .orderBy(products.stock)
    .limit(8);
}

export async function getRecentOrders(limit = 6) {
  return db.query.orders.findMany({ orderBy: [desc(orders.createdAt)], limit });
}

// --- Products ---

export async function listAllProducts() {
  return db.query.products.findMany({ with: { category: true }, orderBy: [desc(products.createdAt)] });
}

export async function getProductForEdit(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: { images: { orderBy: (i, { asc }) => [asc(i.sortOrder)] } },
  });
}

export type ProductWriteData = {
  title: LocalizedText;
  description: LocalizedText;
  reference: string;
  slug: string;
  priceCents: number;
  currency: string;
  discountPercentage: number;
  stock: number;
  categoryId: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  images: string[];
  createdById?: string;
};

export async function createProduct(d: ProductWriteData) {
  return db.transaction(async (tx) => {
    const [p] = await tx
      .insert(products)
      .values({
        title: d.title,
        description: d.description,
        reference: d.reference,
        slug: d.slug,
        priceCents: d.priceCents,
        currency: d.currency,
        discountPercentage: d.discountPercentage,
        stock: d.stock,
        categoryId: d.categoryId,
        isFeatured: d.isFeatured,
        isPublished: d.isPublished,
        thumbnail: d.images[0] ?? null,
        createdById: d.createdById,
      })
      .returning();
    if (d.images.length) {
      await tx
        .insert(productImages)
        .values(d.images.map((url, i) => ({ productId: p.id, url, sortOrder: i, alt: d.title.en })));
    }
    return p;
  });
}

export async function updateProduct(id: string, d: ProductWriteData) {
  await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({
        title: d.title,
        description: d.description,
        reference: d.reference,
        slug: d.slug,
        priceCents: d.priceCents,
        currency: d.currency,
        discountPercentage: d.discountPercentage,
        stock: d.stock,
        categoryId: d.categoryId,
        isFeatured: d.isFeatured,
        isPublished: d.isPublished,
        thumbnail: d.images[0] ?? null,
      })
      .where(eq(products.id, id));
    await tx.delete(productImages).where(eq(productImages.productId, id));
    if (d.images.length) {
      await tx
        .insert(productImages)
        .values(d.images.map((url, i) => ({ productId: id, url, sortOrder: i, alt: d.title.en })));
    }
  });
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}

// --- Categories ---

export async function listAllCategories() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function getCategoryForEdit(id: string) {
  const [c] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return c ?? null;
}

export type CategoryWriteData = {
  title: LocalizedText;
  slug: string;
  parentCategoryId: string | null;
  sortOrder: number;
  show: boolean;
  image: string | null;
};

export async function createCategory(d: CategoryWriteData) {
  await db.insert(categories).values(d);
}

export async function updateCategory(id: string, d: CategoryWriteData) {
  await db.update(categories).set(d).where(eq(categories.id, id));
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
}

// --- Orders ---

export async function listAllOrders() {
  return db.query.orders.findMany({ orderBy: [desc(orders.createdAt)], with: { items: true } });
}

export async function getAdminOrderById(id: string) {
  return db.query.orders.findFirst({ where: eq(orders.id, id), with: { items: true } });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

// --- Users ---

export async function listAllUsers() {
  return db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
      orderCount: count(orders.id),
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));
}
