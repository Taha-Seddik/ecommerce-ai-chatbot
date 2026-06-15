import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().min(1).max(80),
  email: z.email(),
  telephone: z.string().min(3).max(30),
  adresse: z.string().min(3).max(200),
  city: z.string().min(1).max(80),
  zipCode: z.string().min(2).max(20),
  moreInfos: z.string().max(300).optional().or(z.literal('')),
  paymentMethod: z.enum(['cod', 'card']),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
