# Norden — modern ecommerce (demo)

A production-quality, bilingual (EN/FR) ecommerce storefront + admin, built as a portfolio piece.
Premium "Editorial Atelier" design, server-rendered product pages, and a clean, typed architecture.

> Generic demo with a placeholder brand (**Norden**). A modern rebuild of an older Express/Sequelize SSR shop.

## Tech stack

- **Next.js 16** (App Router, RSC, Server Actions) + **React 19** + **TypeScript** (strict)
- **HeroUI v3** + **Tailwind CSS v4** (CSS-first theming, light/dark)
- **Drizzle ORM** + **libSQL** (file-based SQLite — just a file, no DB server; Turso-ready)
- Custom **JWT** auth (`jose` + httpOnly cookies + `bcryptjs`, user/admin roles)
- **Stripe** (test mode) + Cash on Delivery
- **next-intl** (EN/FR routing) + multi-currency
- Zod + drizzle-zod, react-hook-form, Zustand, nuqs

See [`CLAUDE.md`](./CLAUDE.md) for conventions and [`design.md`](./design.md) for the design system.

## Getting started

```bash
npm install
cp .env.example .env        # adjust values as needed
npm run db:migrate          # create the SQLite schema   (after Phase 1)
npm run db:seed             # load demo catalog          (after Phase 1)
npm run dev                 # http://localhost:3000 → /en
```

## Scripts

| Script                                                 | Purpose                              |
| ------------------------------------------------------ | ------------------------------------ |
| `dev` / `build` / `start`                              | develop / build (standalone) / serve |
| `type-check` / `lint` / `format`                       | `tsc --noEmit` / ESLint / Prettier   |
| `db:generate` / `db:migrate` / `db:seed` / `db:studio` | Drizzle workflows                    |

## Deployment

- **Hostinger VPS:** `next build` (standalone) + PM2 + Nginx. `data/app.db` and `public/uploads/` live
  outside the build artifact and persist across redeploys; run `npm run db:migrate` before reload.
- **Vercel:** swap the libSQL file URL for a Turso URL and set `STORAGE_DRIVER=s3`.

## Roadmap

Built feature-by-feature: scaffold → schema/seed → catalog → product detail → auth → cart → checkout
(Stripe + COD) → account → search/facets → admin → i18n/currency → enhancements (wishlist, reviews) →
SEO/a11y → tests/CI. See the project plan for details.
