// Edge-safe (used by both the proxy and server components) — do NOT import 'server-only' here.
import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/lib/env';

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ALG = 'HS256';

export type SessionPayload = {
  userId: string;
  email: string;
  roles: string[];
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, roles: payload.roles })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: [ALG] });
    if (!payload.sub) return null;
    return {
      userId: payload.sub,
      email: (payload.email as string) ?? '',
      roles: (payload.roles as string[]) ?? [],
    };
  } catch {
    return null;
  }
}
