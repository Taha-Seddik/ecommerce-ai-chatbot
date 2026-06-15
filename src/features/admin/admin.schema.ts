import { z } from 'zod';

export const productAdminSchema = z.object({
  titleEn: z.string().min(1).max(120),
  titleFr: z.string().min(1).max(120),
  descriptionEn: z.string().min(1).max(2000),
  descriptionFr: z.string().min(1).max(2000),
  reference: z.string().max(40).optional().or(z.literal('')),
  price: z.number().nonnegative(),
  discountPercentage: z.number().int().min(0).max(100),
  stock: z.number().int().min(0),
  currency: z.string().default('USD'),
  categoryId: z.string().nullable().optional(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  images: z.array(z.string()),
});

export const categoryAdminSchema = z.object({
  titleEn: z.string().min(1).max(80),
  titleFr: z.string().min(1).max(80),
  slug: z.string().max(80).optional().or(z.literal('')),
  parentCategoryId: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  show: z.boolean(),
  image: z.string().optional().or(z.literal('')),
});

export type ProductAdminInput = z.infer<typeof productAdminSchema>;
export type CategoryAdminInput = z.infer<typeof categoryAdminSchema>;
