'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { db } from '@/db';
import { roles, userRoles, users } from '@/db/schema';
import { clearSessionCookie, getSession, setSessionCookie } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/password';
import { loginSchema, registerSchema } from './auth.schema';

export type ActionResult = { ok: true } | { ok: false; error: 'validation' | 'emailTaken' | 'invalidCredentials' };

async function rolesForUser(userId: string): Promise<string[]> {
  const rows = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
  return rows.map((r) => r.name);
}

export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'validation' };

  const { email, password } = parsed.data;
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, error: 'invalidCredentials' };
  }

  await setSessionCookie({ userId: user.id, email: user.email, roles: await rolesForUser(user.id) });
  return { ok: true };
}

export async function registerAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'validation' };

  const { email, password, firstName, lastName } = parsed.data;
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { ok: false, error: 'emailTaken' };

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, firstName, lastName })
    .returning({ id: users.id, email: users.email });

  const [userRole] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, 'user')).limit(1);
  if (userRole) await db.insert(userRoles).values({ userId: user.id, roleId: userRole.id });

  await setSessionCookie({ userId: user.id, email: user.email, roles: ['user'] });
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  const locale = await getLocale();
  redirect(`/${locale}`);
}

/** Lightweight session summary for client header hydration (keeps pages static). */
export async function getAccountSummaryAction(): Promise<{ email: string; isAdmin: boolean } | null> {
  const session = await getSession();
  return session ? { email: session.email, isAdmin: session.roles.includes('admin') } : null;
}
