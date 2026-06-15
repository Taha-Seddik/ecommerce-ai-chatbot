import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getLocale } from 'next-intl/server';
import { type SessionPayload, signSession, verifySession } from '@/lib/jwt';

const COOKIE = 'session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Read + verify the session cookie. Cached per request. */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
});

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Require an authenticated user; redirect to login otherwise. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }
  return session;
}

/** Require an admin; redirect otherwise. (Defense-in-depth on top of the proxy guard.) */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  const locale = await getLocale();
  if (!session) redirect(`/${locale}/login`);
  if (!session.roles.includes('admin')) redirect(`/${locale}`);
  return session;
}
