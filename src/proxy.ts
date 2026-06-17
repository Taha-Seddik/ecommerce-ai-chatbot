import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { verifySession } from './lib/jwt';

const intlMiddleware = createMiddleware(routing);

// Match /account/** (auth required) and /admin/** (admin role required), with or without a locale
// prefix. The locale alternation is derived from routing.locales so new locales stay covered.
const localeAlt = routing.locales.join('|');
const PROTECTED = new RegExp(`^/(?:${localeAlt})?/?(?:account|admin)(?:/|$)`);
const ADMIN = new RegExp(`^/(?:${localeAlt})?/?admin(?:/|$)`);

const localeOf = (pathname: string) => {
  const seg = pathname.split('/')[1];
  return (routing.locales as readonly string[]).includes(seg) ? seg : routing.defaultLocale;
};

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
