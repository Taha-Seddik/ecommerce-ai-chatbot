import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16 "Proxy" (formerly Middleware). For now this only handles locale
// routing; the JWT auth guard for /account and /admin is composed in here in Phase 4.
export default createMiddleware(routing);

export const config = {
  // Run on everything except API routes, Next internals, and files with an extension.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
