import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  telephone: z.string().max(30).optional().or(z.literal('')),
  password: z.string().min(8).optional().or(z.literal('')),
});

export const addressSchema = z.object({
  adresse: z.string().min(3).max(200),
  city: z.string().min(1).max(80),
  zipCode: z.string().min(2).max(20),
  telephone: z.string().max(30).optional().or(z.literal('')),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
