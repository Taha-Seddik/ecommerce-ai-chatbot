# Norden — modern e-commerce

A production-grade **e-commerce storefront + admin panel**: **trilingual (English / Français / العربية with full
right-to-left support)**, **multi-currency**, server-rendered and SEO-optimized, with a fully type-safe,
feature-foldered architecture.

> **Portfolio project.** A ground-up rebuild of an older Express + Sequelize + MySQL SSR shop, re-engineered with
> current best practices. Generic placeholder brand (**Norden**, home & lifestyle goods) — no real customers.

`Next.js 16 (App Router · RSC · Server Actions)` · `React 19` · `TypeScript (strict)` · `Drizzle ORM + SQLite` ·
`Tailwind v4 + HeroUI v3` · `next-intl` · `Stripe`

<!-- Live demo: <url> — see Deployment. -->

## Screenshots

| Storefront (EN) | Arabic (RTL) | Product detail | Admin |
| --- | --- | --- | --- |
| ![Home](docs/screenshots/home-en.png) | ![Arabic RTL](docs/screenshots/home-ar.png) | ![Product](docs/screenshots/product.png) | ![Admin](docs/screenshots/admin.png) |

## Highlights a reviewer might care about

- **Type-safe everything** — env vars validated with Zod at boot (and hard-failed in production if the JWT secret is
  weak); all data access is typed end-to-end with Drizzle; `strict` TypeScript with zero `any`.
- **Money done right** — prices stored as **integer minor units** (no floats); currency conversion happens at the
  edge with integer rates; a `toStripeMinorUnits` helper handles 3-decimal currencies (e.g. TND) correctly.
- **Payments you can trust** — Stripe Checkout creates a *pending* order, and the **signature-verified webhook is the
  single source of truth**: it’s idempotent (atomic claim, safe under retries), decrements stock, and clears the cart
  in one transaction. Cash-on-Delivery works with no keys.
- **Genuine i18n + RTL** — three locales with locale-prefixed routing, a dedicated Arabic font, and right-to-left
  layout built on **CSS logical properties** (`inset-s/inset-e`, `ms/ps`, mirrored icons) — not a hacky `dir` flip.
- **Rendering strategy on purpose** — product pages are **ISR** (statically prerendered, hourly revalidate) with
  `generateMetadata`, hreflang, and JSON-LD; auth-dependent UI is isolated to client islands so cacheable pages stay
  cacheable.
- **Security by default** — custom JWT (jose) in an httpOnly/SameSite cookie, role guards in middleware **and**
  re-checked in every Server Action (defense in depth), ownership checks on orders, and uploads validated by
  re-encoding through `sharp` (never trusting the client MIME type).

## Features

**Storefront** — home (hero, value props, sale banner, featured rail, category grid); product listing & category
pages with server-side sort, pagination, subcategory chips, and a **density toggle** (items-per-row); product detail
with a slider/lightbox gallery, reviews, related products, ISR + JSON-LD; **instant search popup** + a full
`/search` page with **faceted filters** (category buckets, price range, in-stock); cart (slide-over drawer + page,
guest cart persisted to `localStorage`, merged into the DB on login); **wishlist**; **verified product reviews**;
multi-step **checkout** (address → COD/card); order confirmation & history; account (profile, addresses, orders).

**Admin** (`/admin`, role-guarded) — dashboard KPIs (revenue, pending, low-stock); products CRUD (localized content,
image upload, publish/feature); category hierarchy CRUD; order management (status transitions); customers; homepage
CMS settings.

**Platform** — EN/FR/AR + RTL, multi-currency (USD/EUR/TND) via a cookie-backed switcher, one-click **demo login**,
sitemap + robots + structured data, accessible components (skip link, ARIA, keyboard, focus-visible), `next/image`
optimization, and CI (type-check + lint + tests + build).

## Tech stack & rationale

| Area | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16** App Router, RSC, Server Actions | Server-first data flow; less client JS; SEO-friendly SSR/ISR |
| UI | **HeroUI v3 + Tailwind v4** | CSS-first theming (no runtime provider), accessible primitives |
| DB / ORM | **Drizzle + libSQL (SQLite file)** | Ships as a single file — zero DB server on the VPS; Turso-ready; type-safe queries, no engine binary (vs Prisma) |
| Auth | **Custom JWT** (`jose` + `bcryptjs`) | Edge-safe, httpOnly cookie, role-based; no third-party dependency |
| Payments | **Stripe Checkout** + Cash on Delivery | Hosted card flow + webhook source-of-truth; COD for no-key demos |
| i18n | **next-intl** | Locale routing, ICU messages, RTL-friendly |
| State | **Zustand** (persisted) | Tiny guest cart/wishlist store, merged server-side on login |
| Validation | **Zod** | One schema for env, forms, and Server Action inputs |

Coding conventions: [`CLAUDE.md`](./CLAUDE.md) · Design system: [`design.md`](./design.md).

## Architecture

```
Server Component / Server Action / route handler
        → feature service           (business logic)
        → *.repo.ts  (Drizzle)       (data access, `import 'server-only'`)
        → SQLite (libSQL)
```

- **Reads** run directly in Server Components via the repo layer; **mutations** go through `'use server'` actions that
  authorize → Zod-validate → mutate → `revalidate`. Client interactivity lives in small islands (`'use client'`).
- **Feature folders** (`src/features/<name>`): products, categories, cart, checkout, orders, auth, wishlist, reviews,
  currency, search, admin — each with its repo/actions/schema/components.
- **Data model** — cuid2 text PKs; money as integer cents + currency; translatable `title`/`description` stored as
  localized `{ en, fr, ar? }` JSON (selected per request, falls back to `en`); **order items snapshot** title + unit
  price so history never changes; denormalized `ratingAvg`/`ratingCount` recomputed in a transaction.

## Getting started

```bash
npm install
cp .env.example .env        # defaults boot the app locally as-is
npm run db:migrate          # create the SQLite schema
npm run db:seed             # demo catalog: 16 categories, 29 products, 87 images, 30 reviews, 5 users
npm run dev                 # http://localhost:4000  →  /en  (also /fr, /ar)
```

**Demo accounts** (or use the one-click buttons on the login page):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@norden.example` | `password123` |
| Customer | `customer@norden.example` | `password123` |

**Enabling Stripe (optional).** Add test keys to `.env` (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) and forward the
webhook with `stripe listen --forward-to localhost:4000/api/stripe/webhook`. Without keys, the card option is hidden
and Cash on Delivery works fully.

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` / `build` / `start` | develop / build (standalone) / serve — port **4000** |
| `test` | Vitest unit tests (money, currency, order refs, slugs) |
| `type-check` / `lint` / `format` | `tsc --noEmit` / ESLint / Prettier |
| `db:generate` / `db:migrate` / `db:seed` / `db:studio` | Drizzle workflows |

## Deployment

**Hostinger VPS (standalone + PM2 + Nginx):**

```bash
git pull && npm ci && npm run build
npx drizzle-kit migrate                                   # run migrations before reload
cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
pm2 start ecosystem.config.cjs    # or: pm2 reload norden
```

Set a strong `JWT_SECRET` and the real `NEXT_PUBLIC_BASE_URL` in the server env (production **requires** a non-default
secret). Keep `data/app.db` and `public/uploads/` **outside** the build artifact so they survive redeploys; Nginx
terminates TLS and reverse-proxies to the app port; register the Stripe webhook at
`https://<domain>/api/stripe/webhook`. A `Dockerfile` is included as an alternative (mount `data/` + `public/uploads/`
as volumes).

**Vercel variant:** point `DATABASE_URL` at a **Turso** URL (+ `DATABASE_AUTH_TOKEN`) and set `STORAGE_DRIVER=s3`
(Vercel’s filesystem is ephemeral) — no schema or query changes needed.

## Project notes & roadmap

Deliberately scoped as a focused portfolio piece. Not yet built (clear next steps, not blockers): order-confirmation
email (Resend), recently-viewed rail, toast notifications, Playwright e2e, SQLite FTS5 ranking (search currently uses
`LIKE`), and richer admin (Tiptap editor). Out of scope by design: product variants, coupons, inventory reservation,
PDF invoices. Product imagery uses curated Unsplash photography.
