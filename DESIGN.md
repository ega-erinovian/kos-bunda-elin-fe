# Design Reference — Kos Bunda Elin FE

Single source of truth for the visual language of this app. Everything here is
derived from the actual shipped code (`src/app/globals.css`, the `ui/` primitives,
and the admin room + dashboard sections). When in doubt: **be consistent, mobile-first**.

> Reference implementation files:
> - Mobile list UI: `src/components/features/admin/room/MobileRoomSection.tsx`
> - Desktop list UI: `src/components/features/admin/room/DesktopRoomSection.tsx`
> - Mobile dashboard: `src/components/features/admin/dashboard/dashboard-mobile.tsx`
> - Desktop dashboard: `src/components/features/admin/dashboard/dashboard-desktop.tsx`
> - Tokens: `src/app/globals.css`
> - Primitives: `src/components/ui/`

---

## 1. Guiding principles

1. **Mobile first.** Design for the small screen, then scale up. Every page ships
   two variants and toggles them by breakpoint — never a single compromised layout.
   ```tsx
   <MobileRoomSection />  // "md:hidden"
   <DesktopRoomSection /> // "hidden md:block"
   ```
2. **Consistency beats cleverness.** Same job → same component, same size, same
   radius, same color, same spacing. No bespoke one-off styling.
3. **System, not collage.** Use tokens from `globals.css`. Never hardcode a color,
   radius, or shadow that already exists as a token.
4. **Calm surfaces, one loud accent.** Neutral warm grays (`surface`) carry the UI;
   `primary` green is used sparingly for actions and active states.

---

## 2. Design tokens

### 2.1 Color

| Role | Token | Hex | Used for |
|---|---|---|---|
| Page background | `surface` / `background` | `#faf9f6` | App shell, page bg |
| Surface (raised) | `card` / `surface-container-lowest` | `#ffffff` | Cards, panels, inputs bg |
| Card alt / skeleton fill | `surface-container` | `#efeeeb` | Low-emphasis blocks |
| Skeleton high | `surface-container-highest` | `#e3e2e0` | Skeleton bars |
| Row hover | `muted` | `#efeeeb` | Row hover, muted bg |
| Primary text | `on-surface` / `foreground` | `#1a1c1a` | Headings, primary text |
| Secondary text | `on-surface-variant` / `muted-foreground` | `#424842` | Captions, icons, placeholders |
| **Primary (brand)** | `primary` | `#47664b` | Buttons, FAB, active filters, accents |
| On primary | `on-primary` | `#ffffff` | Text/icon on `primary` |
| Primary tint | `primary/10` | — | Filter button active bg, icon chips |
| Secondary (cream) | `secondary` | `#e9e0be` | Alt buttons, bottom-nav active pill |
| On secondary | `secondary-foreground` | `#696348` | Text/icon on `secondary` |
| Container tints | `secondary-container` / `error-container` | `#e9e0be` / `#ffdad6` | Soft icon/status chips |
| Error / destructive | `error` / `destructive` | `#ba1a1a` | Danger text, error states |
| Borders | `border` / `outline-variant` | `#c2c8bf` | Outlines, dividers |

### 2.2 Typography

- `font-sans` = Inter, `font-heading` = Plus Jakarta Sans.
- Headings always use `font-heading`. Body/UI text uses `font-sans`.

| Token | Size / Lh / Wt | Use |
|---|---|---|
| `heading-xl` | 40 / 1.2 / 700 | Hero metric value |
| `heading-lg` | 32 / 1.2 / 600 | Desktop page title |
| `heading-md` | 24 / 1.4 / 600 | Section titles, price values |
| `heading-lg-mobile` | 24 / 1.3 / 600 | Mobile page title, card title |
| `body-lg` | 18 / 1.6 / 400 | Long-form (rare) |
| `body-md` | 16 / 1.6 / 400 | Card descriptions, empty state |
| `label-md` | 14 / 1.2 / 500 | Buttons, list text, captions |
| `label-sm` | 12 / 1.2 / 500 | Badges, timestamps, small meta |

**Rule:** titles → `font-heading`, everything else → `font-sans`. Never mix.

### 2.3 Spacing (Tailwind v4 dynamic scale, base `--spacing: 4px`)

| Use | Value | Class |
|---|---|---|
| Gutter / page margin (mobile) | 16px | `px-4` / `p-4` |
| Page margin (desktop) | 40px | `px-10` |
| Card padding | 16px | `p-4` |
| Section gap | 24px | `space-y-6` / `gap-6` |
| Between sections | 32px | `space-y-8` |
| Compact gap | 8px | `gap-2` |

### 2.4 Radius

| Token | Value | Canonical use |
|---|---|---|
| `rounded-lg` | 12px | Buttons, inputs, select triggers, chips, icon cells, rows |
| `rounded-xl` | 16px | Mobile cards, panels, sheets corners, inline error card |
| `rounded-2xl` | 16px (= `xl`) | Mobile skeleton cards |
| `rounded-3xl` | 24px | Desktop panels / metric cards / table shell |
| `rounded-full` | pill | Badges, avatars, icon chips on surfaces, FABs, progress bars |

> `--radius-xl` and `--radius-2xl` are both 16px in tokens — treat them as the same step.

### 2.5 Shadow (ambient, green-tinted)

| Token | Value | Use |
|---|---|---|
| `shadow-ambient-sm` | `0 2px 10px -2px rgba(134,167,137,0.05)` | Bordered cards, small elevation |
| `shadow-ambient-md` | `0 4px 20px -2px rgba(134,167,137,0.08)` | **Default elevation** for panels/cards |
| `shadow-ambient-lg` | `0 8px 30px -4px rgba(134,167,137,0.12)` | FAB, floating elements |

**Rule:** prefer `shadow-ambient-*` utility classes. Do not inline the rgba string
again (several components already duplicate it inline — see §5).

### 2.6 Breakpoints

| Prefix | Width | Meaning |
|---|---|---|
| mobile | `< 768px` | Default. `md:hidden` sections |
| `md` | `768px` | Switch to desktop layout |
| `lg` | `1024px` | Desktop grid breakouts (e.g. dashboard `lg:grid-cols-3`) |

---

## 3. Canonical component specs

### 3.1 Page header

```
title          font-heading heading-lg-mobile (mobile) → heading-lg (md), text-on-surface
greeting       text-sm text-muted-foreground (above title, dashboard only)
subtitle       text-sm text-muted-foreground / body-md
actions        right-aligned column on mobile, row on md (PageHeader children)
```

### 3.2 Buttons

- Base: `rounded-lg`, text `label-md` (14px).
- Heights: `h-8` default · `h-7` sm · `h-9` lg · icon `size-8`.
- Variants: `default` (`bg-primary`), `outline` (`border-border bg-background`),
  `secondary` (`bg-secondary`), `ghost`, `destructive` (`bg-destructive/10 text-destructive`).
- **Rule:** one primary action per view is filled `primary`; all others are
  `outline` / `ghost` / `secondary`.

### 3.3 Inputs & controls

- Base: `rounded-lg`, `h-8`, `border-input`, `px-2.5`.
- **Mobile search field (canonical):** `h-11.5 rounded-xl pl-10` with a
  `Search` icon at `left-3`, `border-secondary-container`, `shadow-ambient-sm`.
- **Desktop search field (canonical):** `h-11.5 rounded-xl border-outline-variant
  bg-surface-container-lowest pl-12 shadow-sm`.
- Filter button (mobile): `h-11.5 w-11.5 rounded-xl`; active state
  `border-primary bg-primary/10 text-primary`, badge `h-4 w-4 rounded-full bg-primary`.
- **Rule:** all interactive controls on the same row share the same height
  (46px on mobile search rows, 32px on desktop toolbars).

### 3.4 Select (desktop filters)

- Trigger: `rounded-lg`, `h-8`, `border-border bg-background`, icon `h-4 w-4`.
- Popup: `rounded-lg bg-popover ring-1 ring-foreground/10`, items `rounded-md px-1.5 py-1`.

### 3.5 Cards

- Base: `rounded-xl`, padding 16px, `gap-4` inside.
- `variant="bordered"`: `border border-outline-variant bg-surface shadow-ambient-sm`.
- `variant="default"`: `bg-card ring-1 ring-foreground/10`.
- **Mobile room card:** header row = title + `StatusBadge`; description with inline
  `h-4 w-4` icon; footer = price caption + `h-8 w-8 rounded-full` overflow button
  (`hover:bg-primary/5 hover:text-primary`).

### 3.6 Badges & status chips

- **Pill badge:** `rounded-full px-3 py-1 text-label-sm` + dot `h-1.5 w-1.5 rounded-full`,
  dot and text share the semantic color.
- Colors must map to tokens, not raw palette (see §5 fix list):
  - Occupied → `error` family · Available → success/`primary` family · Maintenance → neutral.

### 3.7 List rows (desktop)

- Row: `px-6 py-4`, `border-t border-border/30`, `hover:bg-muted/30`.
- Icon cell: `h-10 w-10 rounded-lg` (square, not pill) with `h-5 w-5` icon.
- Inline actions: `rounded-lg p-2` icon buttons, `text-on-surface-variant`,
  `hover:text-primary` (edit) / `hover:text-destructive` (delete).

### 3.8 Icon chips on surfaces (pill variant)

- Mobile metric / quick action / activity icon: `rounded-full`, sizes —
  `p-2` (metric), `h-12 w-12` (quick action), `h-10 w-10` (activity).
- Desktop metric icon wrapper: `rounded-xl p-3` (see §5 — currently deviates).

### 3.9 Metric cards

- **Mobile:** `rounded-xl p-6`, `grid grid-cols-2 gap-4`; value `font-heading heading-xl`,
  label `text-sm text-muted-foreground`; one card per row may be the `primary` accent
  (with `bg-white/10` blur orb decoration); default cards use `shadow-ambient-md`.
- **Desktop:** `rounded-3xl p-6 bg-surface shadow-ambient-md`, `hover:border-secondary`;
  icon chip `rounded-xl p-3`, label `body-md text-on-surface-variant`, value
  `heading-lg`, optional `h-2 rounded-full` progress bar (`bg-surface-variant` track,
  `bg-primary` fill).

### 3.10 Panels (desktop widgets)

- Activity feed & push logs: `rounded-3xl bg-surface p-6 shadow-ambient-md`.
- Panel header: `font-heading heading-md` title; divider `border-b border-border`.
- List items: `rounded-xl p-4`, `hover:border-surface-variant hover:bg-primary/5`.

### 3.11 Sheet (mobile filters)

- `SheetContent side="right"`, `w-3/4 sm:max-w-sm`, `rounded` corners on the
  open edge, `p-6`, no close button by default.
- Filter chips: `rounded-lg border px-4 py-2 text-label-md`; active
  `border-primary bg-primary text-on-primary`, inactive `border-outline-variant bg-surface text-on-surface-variant`.
- Footer action: `flex-1 rounded-lg border border-outline-variant py-3` (Reset).

### 3.12 Pagination

- **Mobile:** centered, `gap-4 py-2`, `size-icon` outline buttons, `label-sm` range text
  (`"1–5 dari 20"`).
- **Desktop:** `border-t border-border/30 px-6 py-4`, range left (`text-sm muted`),
  two `size-icon` outline buttons right.

### 3.13 Feedback states

- **Skeleton (mobile):** `rounded-xl border border-border/30 bg-surface p-4`,
  bars `bg-surface-container-highest`, avatar `h-8 w-8 rounded-full`.
- **Skeleton (desktop):** rows with `h-10 w-10 rounded-lg` icon block.
- **Error:** `rounded-xl border border-destructive/20 bg-destructive/5`,
  icon `h-12 w-12 rounded-full bg-destructive/10 text-destructive`, retry button
  `rounded-xl bg-primary px-4 py-2`.
- **Empty:** `py-12 text-center body-md text-on-surface-variant`.

### 3.14 Floating action (mobile)

- **Canonical:** `fixed bottom-24 right-4`, single action
  `h-14 w-14 rounded-2xl bg-primary text-on-primary shadow-ambient-lg`, icon `h-6 w-6`.
- Stacked variant (dashboard): two `rounded-full p-4` buttons (`secondary` + `primary`),
  `flex flex-col gap-3`, same `bottom-24 right-4` anchor.

> ⚠️ Both FAB styles currently live at the same anchor — only one may render per
> screen. Keep the pattern singular per page (see §5).

### 3.15 Bottom nav (mobile shell)

- `fixed bottom-0`, `rounded-t-xl`, `bg-background`, `px-4 py-3`,
  shadow `0 -4px 20px -2px rgba(134,167,137,0.08)`.
- Active item: `scale-95 rounded-full bg-secondary px-4 py-1.5 text-secondary-foreground`.

### 3.16 Page shell

- `main`: `pb-28 pt-16` (mobile, clears bottom nav + FAB) → `md:ml-64 md:pb-8 md:pt-16`.
- Content container: `mx-auto max-w-300 px-4 py-6 md:px-10 md:py-12`.

---

## 4. Mobile-first workflow checklist

1. Build the mobile variant first (`md:hidden`), then the desktop variant (`hidden md:block`).
2. Use the same data hook / logic for both variants (see `useRooms`) — only presentation differs.
3. Keep identical content parity: don't hide information on desktop that exists on mobile.
4. Respect tap targets: controls ≥ 44px on mobile (search `h-11.5`, FAB `h-14`).
5. Confirm both variants in the same commit; run `npm run lint` / typecheck.

---

## 5. Known inconsistencies — fix these, don't repeat them

| # | Location | Problem | Correct approach |
|---|---|---|---|
| 1 | `StatusBadge` / `constants.ts` | Uses raw palette (`bg-red-100`, `bg-green-100`, `text-red-600`, `text-green-700`) | Map to semantic tokens: occupied → `error-container` family, available → `primary`/success, maintenance → neutral `surface-variant` |
| 2 | `metric-card.tsx`, `quick-actions.tsx`, `admin-layout.tsx` | `boxShadow`/`shadow-[...]` duplicates `shadow-ambient-md` | Use `shadow-ambient-md` class |
| 3 | `MobileRoomSection.tsx` vs `DesktopRoomSection.tsx` | Mobile search uses `border-secondary-container`; desktop uses `border-outline-variant` + `bg-surface-container-lowest` | Pick one border + bg convention for search fields |
| 4 | Icon chip shape | `rounded-full` (metric, activity, quick actions) vs `rounded-xl p-3` (desktop metric) vs `rounded-lg` (room row) | Pill `rounded-full` on surfaces; square `rounded-lg` only for table/list-row icon cells |
| 5 | Radius drift | Mobile room cards `rounded-xl`, skeletons `rounded-2xl`, desktop panels `rounded-3xl` | Mobile cards = `rounded-xl`; desktop panels = `rounded-3xl`; nothing in between |
| 6 | FAB | Two conflicting styles (single `rounded-2xl h-14 w-14` vs stacked `rounded-full`) at same anchor | Pick one canonical pattern per page (prefer the `h-14 w-14 rounded-2xl` single FAB) |
| 7 | Token alias | `--radius-xl` == `--radius-lg` == `0.75rem` while `rounded-xl` in Tailwind = 16px | Be explicit: use `rounded-xl`/`rounded-2xl` classes, not `--radius-*` |
| 8 | Mobile metric value | `heading-xl` (40px) inside 2-col grid can overflow on narrow screens | Keep `heading-xl` only for hero metrics; consider `heading-lg` for grid cards |

---

## 6. Quick reference (copy-paste snippets)

```tsx
// Mobile card surface
"rounded-xl border border-outline-variant bg-surface shadow-ambient-sm"

// Desktop panel surface
"rounded-3xl bg-surface p-6 shadow-ambient-md"

// Page title
"font-heading text-heading-lg-mobile font-bold text-on-surface md:text-heading-lg"

// Section title
"font-heading text-heading-md text-on-surface"

// Secondary text
"text-label-sm text-on-surface-variant"

// Primary action button
"rounded-xl bg-primary px-4 py-2 text-label-md text-on-primary hover:bg-primary/90"

// Icon chip (pill) on a surface
"flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
```