# design.md — Norden Design System

The single source of truth for visual design. Every page and component follows these tokens and rules.
If something isn't covered here, match the nearest existing pattern and propose an addition in the same PR.

**Aesthetic:** _Editorial Atelier_ (light/default) + _Nocturne Luxe_ (dark) — premium, warm-minimal,
magazine-grade. Generous whitespace, bold product photography, one disciplined accent, serif display + clean UI sans.

> **Implementation:** tokens live as CSS variables in `src/app/globals.css`, overriding HeroUI v3's
> defaults (unlayered, so they win over HeroUI's `@layer theme`). HeroUI v3 is **CSS-first** — there is no
> `tailwind.config` and no `heroui()` plugin. The brand/primary color is HeroUI's **`--accent`** token.

---

## 1. Principles

1. Restraint over decoration. Whitespace is a feature. One accent, used sparingly.
2. Photography leads — the product is the hero; UI recedes.
3. Editorial hierarchy — Fraunces for voice, Inter for function.
4. Warm, never cold — neutrals are warm-tinted; pure `#fff` / `#000` are banned.
5. Motion with intent — subtle, fast, accessible; never gimmicky on commerce actions.
6. Consistency = premium — reuse tokens and components; never one-off colors/spacing.

---

## 2. Color tokens

Use **semantic Tailwind classes** (`bg-background`, `text-foreground`, `bg-surface`, `text-muted`,
`border-border`, and `variant='primary'` for accent). **Never hardcode hex in components.** HeroUI maps each
`--token` to a `--color-token` utility automatically.

### Light — "Editorial Atelier" (`:root, .light, [data-theme='light']`)

| Token                 | Hex                                 | Use                                         |
| --------------------- | ----------------------------------- | ------------------------------------------- |
| `--background`        | `#F7F6F3`                           | page canvas (warm paper)                    |
| `--surface`           | `#FFFFFF`                           | cards, panels                               |
| `--surface-secondary` | `#EDEBE6`                           | raised wells, filter sidebar                |
| `--surface-tertiary`  | `#DDD9D0`                           | hover wells, skeletons                      |
| `--foreground`        | `#24221C`                           | primary text                                |
| `--muted`             | `#6E6757`                           | secondary text                              |
| `--accent`            | `#C2613A` (fg `#FFFFFF`)            | **primary** — CTAs, links, active state     |
| `--default`           | `#EDEBE6`                           | neutral buttons/chips                       |
| `--success`           | `#2F7D5B`                           | success/admin (refined legacy forest green) |
| `--warning`           | `#C2902B` · `--danger` `#B23A38`    | status only                                 |
| `--border`            | `#E6E2D9` · `--separator` `#ECE9E2` | hairlines                                   |
| `--focus`             | `var(--accent)`                     | focus rings                                 |

### Dark — "Nocturne Luxe" (`.dark, [data-theme='dark']`)

| Token                                                      | Hex                               |
| ---------------------------------------------------------- | --------------------------------- |
| `--background`                                             | `#15140F`                         |
| `--surface` / `--surface-secondary` / `--surface-tertiary` | `#1F1D17` / `#28251D` / `#322E24` |
| `--foreground` / `--muted`                                 | `#F1EFE8` / `#A39C8B`             |
| `--accent` (fg)                                            | `#D4A24C` (`#15140F`) — gold luxe |
| `--default`                                                | `#28251D` · `--border` `#2E2A20`  |
| `--success` / `--warning` / `--danger`                     | `#3E9C73` / `#D4A24C` / `#D46A66` |

**Rules:** one primary action per view. Status colors only for status (badges, alerts, validation).
Min contrast 4.5:1 (3:1 large). Verify both modes.

---

## 3. Typography

Loaded via `next/font/google` as CSS vars; exposed as Tailwind families `font-display`, `font-sans`, `font-mono`.

- **Display / headings:** Fraunces (variable serif) → `font-display`.
- **Body / UI:** Inter → `font-sans` (kept from the legacy app).
- **Mono (SKU, order IDs, admin tables):** JetBrains Mono → `font-mono`.

| Role            | Size                                  | Font    | Weight  |
| --------------- | ------------------------------------- | ------- | ------- |
| display (hero)  | `text-6xl`–`text-7xl`                 | display | 400–500 |
| h1 / h2         | `text-5xl` / `text-3xl`–`4xl`         | display | 500     |
| h3 (card/PDP)   | `text-2xl`                            | display | 600     |
| body            | `text-base` (1.6 lh)                  | sans    | 400     |
| small / meta    | `text-sm`                             | sans    | 400     |
| eyebrow / label | `text-xs uppercase tracking-[0.18em]` | sans    | 600     |
| price           | `text-lg .tabular`                    | sans    | 600     |

Headings line-height 1.05–1.2; body 1.6; reading measure ≤ `max-w-prose`. Prices & numeric tables use `.tabular`
(`font-variant-numeric: tabular-nums`).

---

## 4. Spacing, layout, radius, shadow

- 4px base scale (Tailwind). Use the scale — no arbitrary px.
- Container: `<Container>` = `mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8`.
- Section rhythm: `py-16 md:py-24 lg:py-32`. Be generous.
- Product grid: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6`.
- Radius: base `--radius: 0.625rem` (10px); use `rounded-lg/xl/2xl`; feature media `rounded-2xl`.
- Borders: hairline 1px `border-border`. Avoid heavy borders.
- Shadows (warm, custom): `shadow-soft` at rest, `shadow-lifted` on hover (200ms). No harsh gray shadows;
  dark mode uses near-black ambient (HeroUI handles this).

---

## 5. Components — usage rules

Build on HeroUI v3 primitives; wrap project patterns in `components/ui` or feature folders. Never fight HeroUI
internals with `!important` — use props + token classes.

- **Buttons:** primary CTA = `variant='primary'` (accent). Strong neutral / "Add to cart" = `variant='secondary'`.
  Ghost = `variant='ghost'`; bordered = `variant='outline'`. Sizes `sm|md|lg`. Use `onPress`, `isDisabled`,
  `isIconOnly`. One primary button per view.
- **ProductCard:** `surface` bg, 1:1 `next/image`, hover image-swap + zoom (1.04) + `shadow-lifted`, quick-add
  on hover (always tappable on touch), title (Inter 600), price (`.tabular`), wishlist heart, sale/new badge.
- **ProductGallery (PDP):** main image + thumbnail rail (desktop) / swipe carousel (mobile), zoom on hover,
  sticky buy-box ≥ lg.
- **Navbar:** sticky, transparent-over-hero → solid on scroll, condenses on scroll. Right cluster: search,
  language, currency, account, cart count.
- **CartDrawer:** HeroUI `Drawer` (right), thumbnails + qty steppers, free-ship progress, sticky checkout CTA, empty state.
- **FiltersSidebar:** `surface-secondary` accordion (price/category/…), active-filter chips, URL-synced; mobile = bottom-sheet.
- **Forms:** HeroUI Input/Select, inline validation (`danger`), helper text in `muted`.
- **Badges/Chips:** status only — "Sale" `danger-soft`, "New" `secondary`/`accent-soft`.

### Do / Don't

- ✅ Semantic tokens, the type scale, the spacing scale, shared layout wrappers, skeleton + empty + error states.
- ❌ Hardcoded hex, arbitrary font sizes/spacing, pure `#fff`/`#000`, more than one accent, layout-shifting or
  bounce/spring animation on commerce actions.

---

## 6. Responsive & accessibility

- Breakpoints (Tailwind): sm 640 · md 768 · lg 1024 · xl 1280. Mobile-first; design 375px first.
- Grid 2 → 3 → 4 cols; filters become a bottom-sheet < lg. Tap targets ≥ 44px. Sticky mobile add-to-cart bar on PDP.
- WCAG 2.1 AA: contrast ≥ 4.5:1; visible focus rings (never removed — React Aria provides them); full keyboard
  operability; `alt` on product images (decorative `alt=''`); ARIA labels on icon-only buttons; respect
  `prefers-reduced-motion`; `<html lang>` set per locale.

---

## 7. Motion

- Framer Motion for orchestration (optional; HeroUI v3 has built-in component transitions).
- Durations: UI 150–300ms; section/hero reveals ≤ 500ms. Easing: entrances `easeOut`; premium glides
  `cubic-bezier(0.22, 1, 0.36, 1)`.
- Patterns: card hover zoom + image-swap; staggered fade-up on `whileInView` (60–80ms); sticky header condense;
  fly-to-cart / count pop. Animate only `transform`/`opacity`. Gate everything behind `prefers-reduced-motion`.

---

## 8. Keeping pages consistent

Every page: `<Container>`, section rhythm, one H1, the type scale, semantic tokens, shared Navbar/Footer,
skeleton + empty + error states, reuse of ProductCard/ProductGallery/FiltersSidebar. New visual pattern? Add a
reusable component and document it here in the same PR. Screenshot **light and dark**.
