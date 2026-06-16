# Norden — modern ecommerce (demo)

A production-quality, **bilingual (EN/FR)**, **multi-currency** ecommerce storefront **+ admin panel**, built as a
portfolio piece. Clean, retail-grade design, server-rendered & SEO-optimized product pages, and a fully-typed
architecture.

> Generic demo with a placeholder brand (**Norden**, home & lifestyle goods) — a modern rebuild of an older
> Express/Sequelize/MySQL SSR shop.

## Tech stack

- **Next.js 16** (App Router, React Server Components, Server Actions) + **React 19** + **TypeScript** (strict)
- **HeroUI v3** + **Tailwind CSS v4** — CSS-first theming
- **Drizzle ORM** + **libSQL** (file-based SQLite — ships as a single file, no DB server; Turso-ready)
- Custom **JWT** auth — `jose` + httpOnly cookies + `bcryptjs`, user/admin roles, proxy route guards
- **Stripe** (test mode) + Cash on Delivery, webhook-confirmed orders
- **next-intl** (EN/FR routing) + client multi-currency conversion (USD/EUR/TND)
- Zod + drizzle-zod, Zustand, nuqs, Vitest

Conventions: [`CLAUDE.md`](./CLAUDE.md) · Design system: [`design.md`](./design.md)

## Features

**Storefront** — home (hero + featured + categories), product listing & category pages (server-side sort,
pagination, hierarchy), product detail (gallery, rich description, **ISR + JSON-LD**, reviews, related), full-text
search with **faceted filters**, cart (drawer + page, guest + DB, merge-on-login), checkout (address + COD/Stripe),
order confirmation & history, **wishlist**, **product reviews**, accounts (profile, addresses, orders).

**Admin** (`/admin`, role-guarded) — dashboard KPIs, products CRUD (localized EN/FR, image upload, publish/feature),
categories CRUD (hierarchy), orders management (status updates), customers, low-stock & revenue at a glance.

**Platform** — bilingual routing + multi-currency, instant search popup, sitemap/robots, structured data, accessible
(skip link, focus, ARIA, keyboard), optimized images, CI (typecheck + lint + tests + build).

## Getting started

```bash
npm install
cp .env.example .env        # defaults work out of the box for local dev
npm run db:migrate          # create the SQLite schema
npm run db:seed             # load the demo catalog (16 categories, 29 products, reviews, users)
npm run dev                 # http://localhost:3000 → /en
```

**Demo login:** `admin@norden.example` / `password123` (admin) · `customer@norden.example` / `password123`

To enable Stripe checkout, add test keys to `.env` (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) and run `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
Without keys, Cash on Delivery works fully and the card option is disabled.

## Scripts

| Script                                                 | Purpose                              |
| ------------------------------------------------------ | ------------------------------------ |
| `dev` / `build` / `start`                              | develop / build (standalone) / serve |
| `test`                                                 | Vitest unit tests                    |
| `type-check` / `lint` / `format`                       | `tsc --noEmit` / ESLint / Prettier   |
| `db:generate` / `db:migrate` / `db:seed` / `db:studio` | Drizzle workflows                    |

## Architecture

`Server Component / Server Action / route handler → *.service|*.repo (Drizzle) → db`. Reads run in Server
Components; mutations go through Zod-validated Server Actions. Money is stored as integer cents; product/category
text is localized `{ en, fr }` JSON. See `CLAUDE.md` for the full layout.

## Deployment

**Hostinger VPS (PM2 + Nginx):**

```bash
git pull && npm ci && npm run build
npx drizzle-kit migrate                                  # before restart
cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
pm2 start ecosystem.config.cjs   # or: pm2 reload norden
```

Keep `data/app.db` and `public/uploads/` **outside** the build artifact (stable paths) so they survive redeploys;
Nginx terminates TLS and reverse-proxies to the app port. A `Dockerfile` is included as an alternative (mount
`data/` and `public/uploads/` as volumes).

**Vercel:** swap the libSQL file URL for a **Turso** URL (`DATABASE_URL` + `DATABASE_AUTH_TOKEN`) and set
`STORAGE_DRIVER=s3` (Vercel's filesystem is ephemeral) — no schema/query changes needed.

## Roadmap / not yet built

Order-confirmation email (Resend), quick-view modal, recently-viewed, product variants, coupon codes, FTS5
full-text ranking, Playwright e2e, real-image seed data. (Search currently uses `LIKE`; product imagery is
placeholder.)
