import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { verifySession } from './lib/jwt';

const intlMiddleware = createMiddleware(routing);

// Match /account/** (auth required) and /admin/** (admin role required), with or without a locale prefix.
const PROTECTED = /^\/(?:en|fr)?\/?(?:account|admin)(?:\/|$)/;
const ADMIN = /^\/(?:en|fr)?\/?admin(?:\/|$)/;

const localeOf = (pathname: string) => (pathname.split('/')[1] === 'fr' ? 'fr' : 'en');

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PROTECTED.test(pathname)) {
    const token = req.cookies.get('session')?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      const url = new URL(`/${localeOf(pathname)}/login`, req.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (ADMIN.test(pathname) && !session.roles.includes('admin')) {
      return NextResponse.redirect(new URL(`/${localeOf(pathname)}`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
