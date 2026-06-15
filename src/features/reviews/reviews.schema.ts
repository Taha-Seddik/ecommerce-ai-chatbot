import { z } from 'zod';

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().or(z.literal('')),
  body: z.string().max(1000).optional().or(z.literal('')),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
