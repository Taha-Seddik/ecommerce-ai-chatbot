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
