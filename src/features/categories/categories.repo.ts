import 'server-only';
import { asc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { categories } from '@/db/schema';

export type Category = typeof categories.$inferSelect;

/** Top-level categories (no parent), ordered for nav/home. */
export async function getTopCategories(): Promise<Category[]> {
  return db.select().from(categories).where(isNull(categories.parentCategoryId)).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return row ?? null;
}

export async function getChildCategories(parentId: string): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.parentCategoryId, parentId))
    .orderBy(asc(categories.sortOrder));
}

/** Top categories each with their children — used by the navbar and homepage grid. */
export async function getNavCategories(): Promise<(Category & { children: Category[] })[]> {
  const all = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  return all
    .filter((c) => c.parentCategoryId === null)
    .map((top) => ({ ...top, children: all.filter((c) => c.parentCategoryId === top.id) }));
}
