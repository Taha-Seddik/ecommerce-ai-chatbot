---
name: clean-architecture
description: >-
  Structure and build TypeScript / Next.js projects the clean way — feature-folder layout, layered
  data access (component/action → service → repo → db), server-first components, typed end-to-end,
  validation at every boundary, and a strict definition-of-done. Use when scaffolding a new app,
  adding a feature / module / page / endpoint, reviewing structure, or refactoring toward a clean
  architecture. The defaults below assume Next.js (App Router) + TypeScript; keep the principles even
  when the stack differs, and always defer to a project's own CLAUDE.md/AGENTS.md when present.
---

# Clean architecture & project structure

How I want projects built: production-grade, typed end-to-end, server-first, and organized by feature.
Hold the bar high — if it isn't clean, typed, and polished, it isn't done. Follow these conventions
unless the repo's own docs (CLAUDE.md / AGENTS.md / README) say otherwise — those win.

## Principles

- **Typed end-to-end.** TypeScript strict; **no `any`**, no unchecked casts. Types flow from the DB
  schema to the UI. Prefer inferring types from a single source (schema, Zod) over re-declaring them.
- **Server-first.** Do work on the server by default. Push client-side code (state, effects, browser
  APIs) to the leaves and keep it small.
- **One way to do each thing.** One DB client, one money formatter, one auth helper, one `cn()`. No
  duplicated utilities. Reuse before you add.
- **Explicit, validated boundaries.** Anything crossing a trust boundary (user input, API payloads,
  env vars) is validated with a schema (Zod) at the edge. Never trust the client.
- **Colocate by feature, not by file type.** A feature owns its types, schema, data access, logic,
  actions, and components together.
- **Comments explain _why_, not _what_.** Minimal, in English. The code says what; comments say why.

## Folder structure (feature folders)

```
src/
  app/                         # routes only (framework files: page/layout/route/loading/error)
  features/<name>/             # one folder per domain concept (products, cart, auth, orders, …)
    <name>.types.ts            # shared types (safe for client + server)
    <name>.schema.ts           # Zod / validation schemas
    <name>.repo.ts             # data access (DB queries) — server-only
    <name>.service.ts          # business logic — orchestrates repos, no framework/DB details leak out
    <name>.actions.ts          # server actions / mutation entry points ('use server')
    components/                # feature-specific UI
    hooks/                     # feature-specific client hooks
  components/{ui,layout}/      # shared, generic, reusable UI (no business logic)
  lib/                         # cross-cutting: env.ts, cn.ts, money, auth, db client, third-party SDK wrappers
  db/ (or server/db)           # schema/*, the single client, migrations, seed
```

- Group **server-only** code (DB access, secrets, SDK calls) under a clear boundary (`*.repo.ts`,
  `server/`, or `import 'server-only'`) so it can never be bundled to the client.
- Keep `app/` thin: routes wire things together and render; logic lives in `features/` and `lib/`.

## Layering — never skip a layer

```
Component / Server Action / route handler  →  service (business logic)  →  repo (data access)  →  db
```

- **Reads** happen in Server Components through a repo/service. **Never query the DB inline** in a
  component, action body, or route handler.
- **Mutations** go through a Server Action that does, in order: **(1) authorize → (2) validate input
  with Zod → (3) call the service → (4) revalidate the cache → (5) return a typed result** (e.g.
  `ActionResult<T>` — a discriminated `{ ok: true; data } | { ok: false; error }`). Re-validate
  server-side with the same schema even if the client already did.
- A repo knows about the DB; a service knows about the domain; a component knows about neither's
  internals. Dependencies point inward.

## Server vs Client components

- Default to **Server Components**. Add `'use client'` only for state, effects, event handlers, browser
  APIs, or interactive UI libs — and keep those components small and at the leaves.
- No data/secret access on the client. Pass typed props down from server to client leaves.
- Route handlers (`app/api/.../route.ts`) are for webhooks, external callbacks, and public endpoints —
  not for things a Server Action or Server Component should do.

## Naming

- **Files:** camelCase with intent-revealing suffixes — `*.service.ts`, `*.repo.ts`, `*.actions.ts`,
  `*.schema.ts`, `*.types.ts`, `*.utils.ts`; hooks `useFoo.ts`; components `productCard.tsx`. Keep the
  framework's special filenames (`page.tsx`, `layout.tsx`, `route.ts`, …).
- **Code:** camelCase variables/functions; PascalCase types/interfaces/components; enums/unions PascalCase.
- **No hardcoded user-facing strings** — go through i18n (`t('…')`); keep keys in sync across locales.

## Data, money, env

- **Money = integer minor units (cents) + a currency code.** Never floats. Format only at the edge.
- **Validate env with Zod** in one place (`lib/env.ts`); fail fast in production on missing/weak values.
  Only `NEXT_PUBLIC_*` (or the framework's public prefix) may reach the client.
- **Localized content** stored as JSON (`{ en, fr, … }`) and resolved by locale in the repo layer; UI
  chrome strings live in message catalogs, not the DB.
- One DB client, created once. Declare columns in camelCase and map to snake_case via the ORM's casing
  option. Migrations are generated and committed; don't hand-edit generated SQL.

## Code style

- Prettier: 2-space, single quotes (incl. JSX), semicolons, `trailingComma: all`, `arrowParens: always`,
  printWidth ~120, Tailwind class sorting. ESLint on. Run **type-check + lint before every commit**.
- **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`), imperative, ≤72 chars.
  Never commit secrets, local DBs, or upload dirs.

## Adding a feature (recipe)

1. Add the route under `app/…` (Server Component `page.tsx` + `loading.tsx` / `error.tsx`).
2. Create/extend `features/<name>/` — `*.types.ts`, `*.schema.ts`, `*.repo.ts`, `*.service.ts`,
   `*.actions.ts`, plus `components/`.
3. Read in the Server Component via the service; pass typed props to client leaves.
4. Mutations via a Server Action (authorize → validate → service → revalidate → typed result).
5. Reuse existing design tokens & shared components. Add i18n keys to **all** locales.
6. Cover async views with skeleton + empty + error states.

## Definition of done

- `type-check` + `lint` clean; no `any`; no console errors.
- Inputs validated at the boundary; authorization enforced server-side.
- Fully keyboard-accessible; light + dark both clean; no layout shift; responsive + RTL-safe if the app
  is localized.
- Reused existing utilities/components instead of duplicating. If it isn't polished, it isn't done.
