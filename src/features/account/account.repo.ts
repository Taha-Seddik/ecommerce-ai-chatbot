import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function getUserProfile(userId: string) {
  const [u] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      telephone: users.telephone,
      adresse: users.adresse,
      city: users.city,
      zipCode: users.zipCode,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return u ?? null;
}

export type UserProfile = NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;

export async function updateUserProfile(
  userId: string,
  data: { firstName: string; lastName: string; telephone?: string; passwordHash?: string },
): Promise<void> {
  await db
    .update(users)
    .set({
      firstName: data.firstName,
      lastName: data.lastName,
      telephone: data.telephone || null,
      ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
    })
    .where(eq(users.id, userId));
}

export async function updateUserAddress(
  userId: string,
  data: { adresse: string; city: string; zipCode: string; telephone?: string },
): Promise<void> {
  await db
    .update(users)
    .set({
      adresse: data.adresse,
      city: data.city,
      zipCode: data.zipCode,
      ...(data.telephone ? { telephone: data.telephone } : {}),
    })
    .where(eq(users.id, userId));
}
