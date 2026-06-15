import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
