'use server';

import { createId } from '@paralleldrive/cuid2';
import { revalidatePath } from 'next/cache';
import { ORDER_STATUSES, type OrderStatus } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/session';
import { slugify } from '@/lib/slug';
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  updateCategory,
  updateOrderStatus,
  updateProduct,
} from './admin.repo';
import { categoryAdminSchema, productAdminSchema } from './admin.schema';

export type AdminResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const ref = () => `NRD-${createId().slice(0, 6).toUpperCase()}`;
const refreshStorefront = () => revalidatePath('/', 'layout');

export async function createProductAction(input: unknown): Promise<AdminResult<{ id: string }>> {
  const session = await requireAdmin();
  const parsed = productAdminSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'validation' };
  const d = parsed.data;
  const product = await createProduct({
    title: { en: d.titleEn, fr: d.titleFr },
    description: { en: d.descriptionEn, fr: d.descriptionFr },
    reference: d.reference || ref(),
    slug: slugify(d.titleEn),
    priceCents: Math.round(d.price * 100),
    currency: d.currency || 'USD',
    discountPercentage: d.discountPercentage,
    stock: d.stock,
    categoryId: d.categoryId || null,
    isFeatured: d.isFeatured,
    isPublished: d.isPublished,
    images: d.images,
    createdById: session.userId,
  });
  refreshStorefront();
  return { ok: true, data: { id: product.id } };
}

export async function updateProductAction(id: string, input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = productAdminSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'validation' };
  const d = parsed.data;
  await updateProduct(id, {
    title: { en: d.titleEn, fr: d.titleFr },
    description: { en: d.descriptionEn, fr: d.descriptionFr },
    reference: d.reference || ref(),
    slug: slugify(d.titleEn),
    priceCents: Math.round(d.price * 100),
    currency: d.currency || 'USD',
    discountPercentage: d.discountPercentage,
    stock: d.stock,
    categoryId: d.categoryId || null,
    isFeatured: d.isFeatured,
    isPublished: d.isPublished,
    images: d.images,
  });
  refreshStorefront();
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<AdminResult> {
  await requireAdmin();
  await deleteProduct(id);
  refreshStorefront();
  return { ok: true };
}

export async function createCategoryAction(input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = categoryAdminSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'validation' };
  const d = parsed.data;
  await createCategory({
    title: { en: d.titleEn, fr: d.titleFr },
    slug: d.slug || slugify(d.titleEn),
    parentCategoryId: d.parentCategoryId || null,
    sortOrder: d.sortOrder ?? 0,
    show: d.show,
    image: d.image || null,
  });
  refreshStorefront();
  return { ok: true };
}

export async function updateCategoryAction(id: string, input: unknown): Promise<AdminResult> {
  await requireAdmin();
  const parsed = categoryAdminSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'validation' };
  const d = parsed.data;
  await updateCategory(id, {
    title: { en: d.titleEn, fr: d.titleFr },
    slug: d.slug || slugify(d.titleEn),
    parentCategoryId: d.parentCategoryId || null,
    sortOrder: d.sortOrder ?? 0,
    show: d.show,
    image: d.image || null,
  });
  refreshStorefront();
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<AdminResult> {
  await requireAdmin();
  await deleteCategory(id);
  refreshStorefront();
  return { ok: true };
}

export async function updateOrderStatusAction(id: string, status: string): Promise<AdminResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status as OrderStatus)) return { ok: false, error: 'validation' };
  await updateOrderStatus(id, status as OrderStatus);
  revalidatePath('/', 'layout');
  return { ok: true };
}
