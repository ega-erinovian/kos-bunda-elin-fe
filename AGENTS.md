<!-- BEGIN:nextjs-agent-rules -->
# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

This app runs **Next.js 16.2.10 + React 19.2.4 + React 19.2 (Canary features)**. The following breaking changes are ALREADY in effect here:

- **Async Request APIs only** — `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are async. Access them with `await` (e.g. `await props.params`). Synchronous access is removed.
- **Turbopack by default** — `next dev` / `next build` use Turbopack. No `--turbopack` flags needed. Output goes to `.next/dev` for dev.
- **`next lint` is removed** — run `npm run lint` (ESLint CLI) directly. `next build` no longer lints.
- **`middleware` → `proxy`** — the convention is now `proxy.ts` exporting `proxy`. Don't introduce `middleware`.
- **`cacheLife` / `cacheTag` are stable** (no `unstable_` prefix). `revalidateTag(tag, profile)` requires a `cacheLife` profile as its 2nd arg.
- **React Compiler** — `reactCompiler: true` in `next.config.ts` is stable and auto-memoizes. Don't hand-write memoization where the compiler handles it.
- **React 19.2** — View Transitions (`<ViewTransition>`), `useEffectEvent`, and `Activity` are available. Use them when they genuinely simplify code, not for ceremony.
- **`next/image`** — use `remotePatterns`/`localPatterns`, not deprecated `domains`. Quality is clamped to configured `qualities`.
<!-- END:nextjs-agent-rules -->

# Kos Bunda Elin FE — Agent Guide

## 0. Identity & stack

- **Stack:** Next.js 16.2.10 (App Router, `src/`), React 19.2.4, TypeScript (strict), Tailwind v4, shadcn/ui primitives on `@base-ui/react`, TanStack Query, TanStack Table.
- **Path alias:** `@/*` → `src/*`.
- **Primary skills to apply while working here:**
  - **Ponytail** — be a lazy senior dev. Laziness = efficiency, not carelessness. **The best code is the code never written.**
  - **Design taste / frontend** — the visual system is defined in `DESIGN.md`. When styling, follow it instead of inventing new tokens or one-off classes.

## 1. Workflow — understand first, then climb the ladder

Never start writing before you understand the change. Trace the full flow: every file the change touches, every caller of the functions involved. Laziness that skips comprehension ships a confident wrong fix.

### The Ponytail ladder (stop at the first rung that holds)

1. **Does this need to exist at all?** Speculative need = skip it (YAGNI).
2. **Already in this codebase?** A hook, util, type, or component that already does this → reuse it. Look before you write. Re-implementing what's a few files over is the most common slop.
3. **Stdlib / native platform does it?** Use it (CSS over JS, native HTML over a lib, `Intl` for currency/date over a lib).
4. **Already-installed dependency solves it?** Use it — do NOT add a new dependency for what a few lines can do.
5. **Can it be one line?** One line.
6. **Only then:** the minimum code that works.

### Rules

- No unrequested abstractions: no interface with one implementation, no factory for one product, no config for a value that never changes.
- Deletion over addition. Boring over clever. Fewest files possible. Shortest working diff wins.
- **Bug fix = root cause, not symptom.** Before editing, grep every caller of the function you're about to touch. Fix it once, where all callers route through — not just the path the ticket names.
- Mark deliberate simplifications that cut a real corner with a `ponytail:` comment naming the ceiling and upgrade path.
- **Never be lazy about:** input validation, error handling that prevents data loss, security, accessibility, or anything explicitly requested.

## 2. Scalable architecture (this repo's conventions)

### Feature-first organization

- **`src/components/features/<feature>/`** — feature-scoped components, co-located with their `constants.ts`, `types.ts`, and `mappers.ts`. Example: `src/components/features/admin/room/`.
- **`src/components/ui/`** — shadcn/ui primitives only (Button, Card, Table, …). No feature logic lives here. Reuse these; don't rebuild them.
- **`src/components/layout/`** — app shell: navbar, admin layout, bottom nav.
- **`src/hooks/api/`** — thin, reusable TanStack Query hooks that wrap the API layer (e.g. `use-rooms.ts`), one per resource.
- **`src/hooks/features/<feature>/`** — feature state/derived hooks composed on top of `hooks/api` (e.g. `useRooms`). Keep API concerns out of components.
- **`src/lib/`** — framework-agnostic infrastructure: `api.ts` (fetch wrapper + auth refresh), `auth.ts`, `utils.ts` (`cn`, formatters).
- **`src/providers/`** — global context providers (Query, Auth).
- **`src/types/`** — shared API types, barrel-exported via `index.ts`.

### Rules that keep it scalable

- **One responsibility per file.** Components render; hooks hold logic; mappers translate API shapes to view models; constants/types stay colocated.
- **Presentation vs. data separated.** Data comes from `hooks/api` / `hooks/features`, never from `fetch` inline in a component.
- **Mobile-first, twin-variant screens.** Per `DESIGN.md`, pages ship a mobile variant (`md:hidden`) and a desktop variant (`hidden md:block`) sharing the same data hook. Never build one compromised layout.
- **Follow the feature template.** When adding to a feature, mirror the existing `constants.ts` / `types.ts` / `mappers.ts` / component structure. Consistency beats cleverness.
- **Shared view models go through mappers.** If the raw API type leaks UI concerns (e.g. formatting, display labels), map it in a `mappers.ts`, not inside a component.

## 3. Clean code & maintainability

- **Naming:** intention-revealing names. Verb-prefix handlers (`handleSearch`, `handlePageChange`), noun types. Match existing naming style per directory.
- **Types over `any`.** Use the colocated/`src/types` types. Derive where possible. Keep `strict` on — no silent escapes.
- **Keep files small and focused.** If a component or hook is doing two jobs, extract. If it's big enough to need a section comment, it's probably two files.
- **Heavy logic → hooks (>100 lines).** Any heavy logic block exceeding ~100 lines (derived state, data transforms, effects, handlers, validation) must be extracted into a hook (`src/hooks/features/<feature>/use-*.ts` or colocated `use-*.ts`), not left inline in a component. Components orchestrate hooks + render; hooks own logic. Exception: trivial glue (<100 lines) stays inline.
- **Components ≤300 lines.** No component file may exceed 300 lines. When approaching the limit, split by responsibility into smaller sub-components co-located in the same feature folder (e.g. `RoomCard.tsx`, `RoomFilters.tsx`, `RoomTable.tsx`). Sub-component files must use **PascalCase** (matching the exported component name). Composition over monolith — keep each piece focused, maintainable, and sustainable.
- **No dead code.** Delete unused exports, constants, and branches as you work.
- **Formatting/static checks:** Prettier + ESLint flat config are wired. Run `npm run format:fix` and `npm run lint` before finishing.
- **Comments** are for `ponytail:` ceilings and non-obvious rationale — never restate the code.
- **Do not over-memoize.** With the React Compiler enabled, prefer plain values; reach for `useMemo`/`useCallback` only for stable hook arguments that preserve semantics (e.g. Query keys/params) — not as a performance habit.

## 4. Client/Server Component boundaries

- **Default to Server Components.** Only add `"use client"` when you need state, effects, browser APIs, or event handlers.
- **Keep client components at the leaves.** Push interactive bits down so most of the tree stays server-rendered. Don't sprinkle `"use client"` on pages or layouts that just compose children.
- **Server Components do the fetching** when data is read at request time; client components receive props. Interactive/refetching lists use TanStack Query hooks instead.
- **Do not pass non-serializable values** (functions, class instances) from Server to Client Components.

## 5. Data & caching

- **Server data fetching:** prefer `fetch` with `cacheLife`/`cacheTag` (stable in v16) or plain async components. Cache by tags, revalidate with `revalidateTag(tag, profile)`.
- **Client data fetching:** use the existing TanStack Query hooks in `hooks/api`. Follow `QueryProvider` defaults (`staleTime: 5 * 60 * 1000`, `retry: 1`, no refetch on window focus).
- **Mutations:** `useMutation` from `@tanstack/react-query`; invalidate/refetch the affected queries on success (see `hooks/features`).
- **Auth:** go through `src/lib/api.ts` (handles `credentials: include`, 401 refresh, and the `auth:unauthorized` event) and `src/providers/auth-provider.tsx`. Never call the API directly for auth.
- **API responses are wrapped** — use the actual response types in `src/types/` (e.g. `PaginatedResponse<T>`, `AuthResponse`). Don't guess shapes.

## 6. UI & styling

- **Single source of truth: `DESIGN.md`.** All colors, typography, spacing, radius, shadow, and breakpoint rules live there. Read it before styling; follow it exactly.
- **Tokens, not raw values.** Use the design tokens from `globals.css` (`surface`, `primary`, `on-surface-variant`, `shadow-ambient-*`, …). Never hardcode a color/radius/shadow that already has a token.
- **`cn()` everywhere.** Use `cn` from `@/lib/utils` for conditional classes — never string concatenation.
- **shadcn/ui primitives first.** Check `src/components/ui/` before building a control. Customize via props/className, don't fork the primitive.
- **Accessibility is non-negotiable.** Semantic elements, real labels, focus-visible states, keyboard support, contrast. It's part of the definition of done.

## 7. Types & domain modeling

- Domain types live in `src/types/` (Room, Tenant, Payment, User, …) and are re-exported from `src/types/index.ts`. Add new domain types there, not in component files.
- Feature-specific UI types (filter options, display enums) live in the feature's `types.ts`.
- Map API → view with `mappers.ts`; keep `"semua"`-style filter sentinels and display labels out of the API layer.

## 8. Definition of done (check before finishing)

1. Read the relevant Next.js 16 doc from `node_modules/next/dist/docs/` for any framework API you touch.
2. Reused existing hooks/components/utils instead of re-implementing (Ponytail rung 2).
3. No new dependency added for something a few lines already cover.
4. Wrote the minimum code that works; no speculative abstraction, no dead code.
5. Followed `DESIGN.md` tokens and conventions; mobile + desktop variants verified.
6. Followed the feature-folder structure and import conventions (`@/`).
7. `npm run lint` passes and `npm run format:fix` is clean. TypeScript `strict` compiles.
8. Left a runnable check for any non-trivial logic (a small test/self-check), per Ponytail.