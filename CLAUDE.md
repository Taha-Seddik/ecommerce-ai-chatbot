@AGENTS.md

# CLAUDE.md — Norden

Project guide and coding conventions for this repository. Read this **and `design.md`** before
writing code. This is a portfolio-grade, production-quality modern ecommerce demo — hold the bar high:
clean architecture, typed end-to-end, accessible, fast, and beautiful.

> ⚠️ This repo uses **Next.js 16** (App Router) — APIs and file conventions differ from older Next.
> Notably, middleware is now **Proxy** (`src/proxy.ts`). When unsure, check `node_modules/next/dist/docs/`.

---

## 1. Tech stack (locked)

| Concern             | Choice                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Framework           | Next.js 16 — App Router, React Server Components, Server Actions                              |
| Language            | TypeScript (strict)                                                                           |
| UI                  | **HeroUI v3** + **Tailwind CSS v4** — CSS-first, **no provider**, no `tailwind.config` plugin |
| Theming / dark mode | CSS variables (see `design.md`) + `next-themes` (class strategy)                              |
| ORM / DB            | **Drizzle ORM** + **libSQL** (file-based SQLite, `file:./data/app.db`; Turso URL in prod)     |
| Auth                | Custom JWT — `jose` (httpOnly cookie) + `bcryptjs` + user/admin roles                         |
| Payments            | Stripe (test mode) + Cash on Delivery                                                         |
| i18n                | `next-intl` — bilingual EN/FR, `[locale]` segment + multi-currency                            |
| Validation          | Zod + `drizzle-zod`; forms via `react-hook-form` + zod resolver                               |
| Client state        | Zustand (guest cart, persisted)                                                               |
| URL state           | `nuqs` (typed `searchParams` for catalog filters)                                             |

> **HeroUI v3 notes (do NOT copy v2/NextUI tutorials):** v3 is CSS-first. Styling comes from
> `@import '@heroui/styles'` in `globals.css` (it pulls in Tailwind v4 too). There is **no `HeroUIProvider`**.
> The brand/primary color is the **`--accent`** token (e.g. `Button variant='primary'` uses it).
> Components follow React Aria Components patterns — use `onPress` (not `onClick`), `isDisabled`, etc.

---

## 2. Folder structure

Feature-folder organization, carried over from the legacy app and adapted to the App Router.

```
src/
  app/
    providers.tsx              # 'use client' — next-themes only (HeroUI needs no provider)
    [locale]/
      layout.tsx               # root layout: fonts, <html lang>, NextIntlClientProvider, setRequestLocale
      page.tsx                 # home
      (storefront)/…           # products, category, search, cart, checkout, wishlist, account, (auth)
      (admin)/admin/…          # dashboard, products, categories, orders, users, reviews, settings
    api/…                      # route handlers: stripe/webhook, uploads, sitemap, robots
    globals.css                # @import '@heroui/styles' + brand tokens + @theme fonts
  i18n/
    routing.ts navigation.ts request.ts
  proxy.ts                     # next-intl middleware (+ auth guard from Phase 4)
  db/
    index.ts                   # libSQL client + drizzle({ casing: 'snake_case' })
    schema/*.schema.ts         # one file per aggregate; barrel in index.ts
    queries/* mutations/*      # data-access layer (reads / writes)
    seed.ts
  features/<name>/             # products, cart, orders, auth, checkout, reviews, wishlist, admin
    components/  hooks/  <name>.repo.ts  <name>.service.ts  <name>.actions.ts  <name>.schema.ts  <name>.types.ts
  components/{ui,layout}/      # shared: Container, Navbar, Footer, ProductCard, ProductGallery, …
  lib/                         # cn.ts, env.ts, brand.ts, auth/, jwt, money, currency, storage/, stripe
messages/{en,fr}.json         # next-intl catalogs (namespaced)
drizzle/                      # committed SQL migrations (incl. FTS5)
data/app.db                   # gitignored, persisted on the VPS
public/uploads/               # gitignored, persisted on the VPS
```

**Layering (preserve the legacy repository pattern):**
`Server Component / Server Action / route handler → *.service.ts (business logic) → *.repo.ts (Drizzle) → db`.
Never query Drizzle directly from a component or an action body.

---

## 3. Naming conventions (carried over from the legacy app)

- **Files:** camelCase with descriptive suffixes — `*.service.ts`, `*.repo.ts`, `*.actions.ts`
  (Server Actions), `*.schema.ts` (Zod/Drizzle), `*.types.ts`, `*.utils.ts`; hooks `useFoo.ts`;
  components camelCase `*.tsx` (e.g. `productCard.tsx`). App Router special files keep Next's names
  (`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`).
- **Variables / functions:** camelCase. **DB columns:** camelCase in TS → `snake_case` in SQLite
  automatically (`casing: 'snake_case'`). **Types / interfaces / components:** PascalCase.
  **Enums / unions:** PascalCase name, camelCase/PascalCase values (mirror legacy `OrderStatus`).
- **i18n keys:** namespaced, dot-style, lowerCamel — `home.cta`, `cart.empty.title`. A key in `en.json`
  must exist in `fr.json` (and vice versa). Never hardcode user-facing strings — use `t('…')`.

---

## 4. Server vs Client components

- Default to **Server Components**. Add `'use client'` only for state, effects, browser APIs, event
  handlers, HeroUI interactive components, or Framer Motion. Keep client components small, at the leaves.
- **Reads:** in Server Components via `db/queries/*` (or feature `*.repo.ts`) — no client data fetching of
  server-renderable data, no DB/secret access on the client.
- **Mutations:** prefer **Server Actions** (`*.actions.ts`, `'use server'`). Every action: (1) authorize,
  (2) Zod-validate, (3) call the service/mutation, (4) `revalidatePath`/`revalidateTag`, (5) return a typed
  `ActionResult`. Re-validate with the same Zod schema server-side — never trust the client.
- **Route handlers** (`app/api/.../route.ts`) only for webhooks (Stripe), external callbacks, sitemap/robots.

---

## 5. Data access — Drizzle + libSQL

- One client in `src/db/index.ts`. Declare columns in **camelCase**; `casing: 'snake_case'` maps them.
- Money is stored as **integer minor units** (cents) + a currency code — never floats. Format at the edge
  with `lib/money.ts`.
- Migrations: `npm run db:generate` then `npm run db:migrate`. Never hand-edit generated SQL (the FTS5
  migration is the one intentional hand-written exception). Seed: `npm run db:seed`. Inspect: `npm run db:studio`.

---

## 6. i18n & currency

- `next-intl` with the `[locale]` segment (`en`, `fr`; default `en`, `localePrefix: 'always'`).
- Call `setRequestLocale(locale)` in every statically-rendered route (layouts + pages).
- Use the locale-aware `Link`/`useRouter` from `src/i18n/navigation.ts`, not `next/link`/`next/navigation`.
- Translatable DB content (product/category title & description) is stored as localized JSON `{ en, fr }`
  and selected by locale in the repo layer. UI chrome strings live in `messages/*.json`.
- Currency is user-selectable (cookie + client store); format via `Intl.NumberFormat`. Never persist converted prices.

---

## 7. Code style — Prettier & ESLint

`.prettierrc` (carried over from legacy): 2-space indent, **single quotes** (incl. JSX), semicolons,
`trailingComma: all`, `bracketSpacing`, `bracketSameLine: true`, `arrowParens: always`, **printWidth 120**,

- `prettier-plugin-tailwindcss` (auto-sorts classes). ESLint = `eslint-config-next` (core-web-vitals).
  Run `npm run type-check && npm run lint` before every commit. Comments: minimal, English, explain **why**.

---

## 8. Adding a feature / page

1. Add the route under `src/app/[locale]/…` (Server Component `page.tsx`) + `loading.tsx` / `error.tsx`.
2. Add/extend `src/features/<name>/` (`*.types.ts`, `*.schema.ts`, `*.repo.ts`, `*.service.ts`, `*.actions.ts`).
3. Fetch in the Server Component via the service; pass typed props to client leaves.
4. Reuse `design.md` tokens & shared components — no new colors/spacing without updating `design.md`.
5. Add i18n keys to **both** `en.json` and `fr.json`. Verify light + dark and keyboard a11y.

---

## 9. Environment & scripts

Env is validated in `src/lib/env.ts` (Zod). See `.env.example`. Only `NEXT_PUBLIC_*` reaches the client.

| Script                                                         | Does                                              |
| -------------------------------------------------------------- | ------------------------------------------------- |
| `npm run dev`                                                  | Next dev server                                   |
| `npm run build` / `start`                                      | production build / serve (`output: 'standalone'`) |
| `npm run type-check`                                           | `tsc --noEmit`                                    |
| `npm run lint` / `format`                                      | ESLint / Prettier write                           |
| `npm run db:generate` / `db:migrate` / `db:seed` / `db:studio` | Drizzle workflows                                 |

---

## 10. Commits & deploy

- **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`), imperative, ≤72 chars.
  Never commit secrets or `data/` / `public/uploads/`.
- **Deploy:** Hostinger VPS — `next build` (standalone) + PM2 + Nginx; `data/app.db` and `public/uploads/`
  live outside the build artifact and persist across redeploys; run `npm run db:migrate` before reload.
  Vercel variant: swap libSQL file → Turso, `STORAGE_DRIVER=s3`.

## 11. Quality bar

Lighthouse ≥ 95. Zero console errors. Fully keyboard-accessible. Light + dark both pixel-clean. No layout
shift. Every async view has skeleton + empty + error states. If it isn't polished, it isn't done.
