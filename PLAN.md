# Plan: Kost Bunda Elin FE — Frontend-First, Backend-Synchronized

> The frontend still ships and tests each feature against a mocked transport first; it does not wait
> for backend implementation readiness. What changed is **contract governance**: this plan is now
> synchronized to `PLAN_BE.md`'s consolidated API contract. The frontend and backend no longer have
> competing wire-contract precedence. Paths, methods, request/response DTOs, status codes, auth gates,
> pagination, and additive fields in this document must remain equivalent to `PLAN_BE.md` §2.
>
> Backend-only implementation details — Prisma schema, migrations, jobs/cron, provider plumbing,
> transaction boundaries, retry/backoff, and response mappers — remain owned by `PLAN_BE.md`. FE build
> order remains user-value-driven and may differ from backend phase order. Any future wire-contract
> change must be versioned and applied to **both** plans plus the Phase 9 `CONTRACT.md`; neither side may
> silently override the other.
>
> `DESIGN.md` (tokens/components) and `AGENTS.md` (architecture/workflow) remain the source of truth for
> *how* to build the frontend. This document defines *what* to build, the FE-first sequence, and the exact
> shared API surface it consumes.

---

## Reconciliation applied in this revision

This revision adopts the backend reconciliation decisions directly into FE instead of leaving them as
backend-side proposals: explicit `Pagination`; payment detail embedding; optional
`PaymentRecord.financialTransactionId`; required idempotency header; `MessageTemplate` read shape;
notification/transaction `page` + `pageSize`; report additive metrics; concrete dashboard groups;
Decimal-as-number enforcement; intentional status casing; and documentation of the backend-only template
create + WhatsApp webhook endpoints. It also removes the unsupported FE assumption that a deposit
forfeiture mutation already exists.

---

## 0. How this works: mock transport, not mock hooks

The trick that makes "FE first" actually possible without every hook secretly being fake:

- **`src/hooks/api/*` is written once, for real.** It calls the existing `lib/api.ts` fetch
  wrapper against real relative URLs (`/api/pembayaran/:id/payments`, etc.), exactly as it would
  against a live backend. It contains **no mock/real branching** — that would mean shipping and
  testing different code than what eventually goes to production.
- **The network boundary is mocked instead**, via [MSW](https://mswjs.io) (Mock Service Worker):
  - `src/mocks/handlers/*.ts` — one file per resource, each handler implementing the exact
    contract frozen at the end of the matching phase below (validates the request shape, applies
    the mutation to an in-memory fixture store, returns the exact response shape).
  - `src/mocks/browser.ts` — starts the MSW worker in the browser; enabled only when
    `NEXT_PUBLIC_API_MODE=mock` (set in `.env.local` during FE-only development).
  - `src/mocks/server.ts` — starts MSW's Node server for tests (Vitest/Testing Library setup),
    always on in the test environment regardless of `NEXT_PUBLIC_API_MODE`.
  - `src/mocks/fixtures/*.ts` — seed data per resource (a handful of tenants, bills, accounts,
    etc.) that handlers read/mutate in memory, reset between test files.
- **Flipping to the real backend later is a one-line change**: set
  `NEXT_PUBLIC_API_MODE=live` (or simply don't start the worker in production, which is the
  default). No component, hook, or type changes are allowed at that point. If live integration
  requires an FE type/shape patch, that is a contract-drift defect to reconcile in both plans.
- `ponytail:` MSW is a new dependency. Justified because there's no other way to build and test
  this many multi-step mutation flows (create → refetch → invalidate → verify side effects) as
  full round trips without either a live backend or hand-rolled per-hook fetch stubs duplicated
  across every test file. It's dev/test-only — never included in the production bundle.

### Phase discipline

Each phase below:
1. **UI** — components (mobile + desktop, per DESIGN.md), same as a normal feature build.
2. **Contract** — the endpoint(s) this screen needs, written as the literal interface the backend
   must satisfy. This is frozen once the phase's tests pass against the mock — later phases only
   *add* new contracts, they don't silently change an already-frozen one (if a later phase truly
   needs a shape change, it says so explicitly, versioned, same discipline the backend plan itself
   uses for additive-only migrations).
3. **Mock fixtures/handlers** — what's needed to make the UI in (1) fully exercise the contract in
   (2) locally.
4. **Acceptance criteria** — FE-observable first (renders, validates, mutates the mock store,
   refetches correctly). Live-backend verification is not required to finish an FE-first phase, but
   a contract smoke pass against live endpoints becomes mandatory before production integration.

### Backend synchronization rules

The shared wire contract follows these cross-cutting rules from `PLAN_BE.md`:

- All FE-facing routes require authentication. The WhatsApp verification/delivery webhook routes are
  backend-only public endpoints and are listed in Phase 2 for completeness, but FE never calls them.
- `[OWNER]` means the action is role-gated server-side. FE mirrors the gate for UX, but never treats
  hiding/disabling a control as authorization.
- Requests are scoped to the authenticated admin's property. FE does not choose another property as
  an implicit request context. Cross-property/not-owned resource access is handled as not-found where
  the backend contract specifies that behavior.
- Every monetary field documented as `number` must remain a JSON number. A stringified Prisma Decimal
  is a contract failure and the MSW handlers/tests must reject or expose that drift.
- Status query values remain lowercase while `StatusPembayaran` response values remain uppercase. This
  asymmetry is intentional.
- Shared pagination shape:

```ts
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
```

  Paginated endpoints accept optional `page`/`pageSize` and the backend defaults to `1`/`50`.

### FE phase ↔ backend phase map

| FE phase | Backend phase(s) required for live parity |
|---|---|
| Phase 1 — Payments & Billing | Phase 5, extended by Phase 12 |
| Phase 2 — Notifications | Phases 6, 8, 9, 10 |
| Phase 3 — Finance Ledger | Phases 11, 12 |
| Phase 4 — Expenses | Phase 13 |
| Phase 5 — Receivables & Aging | Phase 14 |
| Phase 6 — Tenant Deposits | Phase 15 |
| Phase 7 — Financial Reports | Phase 16 |
| Phase 8 — Dashboard Expansion | Phase 17 |
| Phase 9 — Contract Freeze / Handoff | Phases 18, 20, 21 for backend verification/docs |

---

## 1. Foundations (build first, before any feature phase)

### 1.1 Contract types — `src/types/`

Every new domain type is written **as the synchronized contract**, matching `PLAN_BE.md` §2 rather
than a stale backend draft or an FE-only guess. One file per resource, barrel-exported from
`src/types/index.ts`, same pattern as the existing `room.ts`/`tenant.ts`:

```
src/types/
├── payment-record.ts   # PaymentRecord, PaymentMethod, CreatePaymentRecordInput, AddPaymentResponse
├── notification.ts     # NotificationChannel, NotificationStatus, NotificationLog,
│                        # MessageTemplate, ReminderConfig
├── finance.ts           # FinancialAccount, FinancialCategory, FinancialTransaction,
│                        # FinancialAccountType, CategoryType, TransactionType, TransactionSource
├── expense.ts            # Expense (view over FinancialTransaction, type=EXPENSE)
├── receivable.ts         # ReceivableByTenant, ReceivableSummary, AgingBucket, AgingReport
├── deposit.ts             # Deposit, DepositStatus
├── report.ts              # DashboardReport, RevenueReport, ExpenseReport, CashFlowReport,
│                           # IncomeStatementReport
├── audit-log.ts           # AuditLogEntry
└── pagination.ts          # Pagination
```

Extend the existing `Pembayaran` type additively (new optional/defaulted fields only — same
non-breaking discipline the backend plan itself uses, so whichever side lands first never breaks
the other):

```ts
export type StatusPembayaran = "BELUM_BAYAR" | "SEBAGIAN" | "LUNAS" | "TERLAMBAT";

export interface Pembayaran {
  // ...existing fields unchanged...
  totalDibayar: number;
  paymentRecords?: PaymentRecord[]; // present on detail fetches only
}
```

### 1.2 Mock infrastructure — `src/mocks/`

```
src/mocks/
├── browser.ts              # setupWorker(...handlers), started from a client root when
│                            # NEXT_PUBLIC_API_MODE === "mock"
├── server.ts                # setupServer(...handlers), started in test setup file
├── handlers/
│   ├── pembayaran.ts        # extends existing bill handlers with the payments sub-resource
│   ├── notification.ts
│   ├── finance.ts
│   ├── expense.ts
│   ├── receivable.ts
│   ├── deposit.ts
│   ├── report.ts
│   └── audit-log.ts
└── fixtures/
    ├── tenants.ts, kamar.ts, pembayaran.ts   # extend existing fixtures if already present;
    │                                          # create if this is the first mock data in the repo
    ├── finance.ts, notifications.ts, deposits.ts
    └── reset.ts                                # exported resetFixtures() called in test afterEach
```

Handlers are the actual implementation of "does this look and behave like the real backend" —
they enforce the same validation rules the contract promises (400 on bad shape, 404 on
not-found/cross-tenant, 409-equivalent on a dedupe/idempotency collision) so tests written against
the mock genuinely catch contract violations, not just happy-path rendering.

### 1.3 `src/hooks/api/` — written once, real interface

Same list as any normal build, no mock-awareness inside the files themselves:

```
use-payment-records.ts, use-message-templates.ts, use-notification-logs.ts,
use-reminder-config.ts, use-reminders.ts, use-finance-accounts.ts, use-finance-categories.ts,
use-finance-transactions.ts, use-expenses.ts, use-receivables.ts, use-deposits.ts, use-reports.ts,
use-audit-log.ts
```

### 1.4 Navigation / IA

Same additions as any normal build — new **Notifications** and **Finance** (with Accounts,
Categories, Transactions, Expenses, Receivables, Deposits, Reports children) sections in the
sidebar (desktop) / reached via dashboard quick actions and a "More" sheet on mobile (DESIGN.md
§3.15 reserves bottom nav for primary destinations only). Routes:

```
src/app/admin/notifications/{page.tsx, log/page.tsx, settings/page.tsx}
src/app/admin/finance/{accounts,categories,transactions,audit-log,expenses,receivables,deposits,reports}/page.tsx
```

**Acceptance criteria (Foundations):**
- [ ] `npm run dev` with `NEXT_PUBLIC_API_MODE=mock` serves every existing screen unchanged
      (regression check that MSW doesn't intercept requests it has no handler for in a way that
      breaks already-working screens — pass through un-mocked routes untouched).
- [ ] Test suite starts the MSW node server globally; no test hits a real network call.

---

## Phase 1 — Payments & Billing (record payment, method, partial, history, linked account)

**UI:**
- `PaymentRecordForm.tsx` — `paymentMethod` (select: CASH/BANK_TRANSFER/QRIS/E_WALLET/OTHER),
  `paymentDate` (default today), `amountPaid` (prefilled with `nominal - totalDibayar`),
  `referenceNumber` (optional), `notes` (optional), `financialAccountId` (optional select from
  `useFinanceAccounts()` — see Phase 3; if Phase 3 hasn't shipped yet in build order, ship this
  field disabled/hidden and enable it once Phase 3 lands, rather than blocking Phase 1 on it).
- `PaymentHistoryList.tsx` — records ordered by date: method badge, amount, date, reference,
  recording admin; each record links to its financial transaction once Phase 3 exists.
- `MobilePaymentSection.tsx` / `DesktopPaymentSection.tsx` — modify. `StatusBadge` gains
  `SEBAGIAN` (token-mapped per DESIGN.md §5 fix #1, not raw palette); row shows
  `totalDibayar / nominal` progress when partial.
- Overpayment: mutation response can include `warning: "overpaid"` — shown as a non-blocking
  inline notice (amber/`secondary-container`, not `destructive`).
- `Idempotency-Key` header: client-generated UUID per submit attempt, regenerated only on a
  genuinely new submission (not a retry of the same click) — this is FE-owned insurance against
  double-submit and doubles as the exact mechanism the backend contract below requires it to honor.

**Contract (frozen by this phase):**
```
GET    /api/pembayaran?status=belum_bayar|sebagian|lunas|terlambat|akan_jatuh_tempo|menunggak
  → 200 { data: Pembayaran[] }   // existing list shape; `sebagian` added as accepted filter

GET    /api/pembayaran/:id
  → 200 Pembayaran & { paymentRecords: PaymentRecord[] }
  // paymentRecords is embedded on DETAIL only, never on the list response

POST   /api/pembayaran
  → 201 Pembayaran   // existing create-bill contract unchanged

PATCH  /api/pembayaran/:id
  → 200 Pembayaran   // existing edit: catatan/tanggalJatuhTempo only; status is not client-settable

POST   /api/pembayaran/:id/payments
  headers: { "Idempotency-Key": string }   // required
  body: {
    paymentMethod: "CASH" | "BANK_TRANSFER" | "QRIS" | "E_WALLET" | "OTHER";
    paymentDate: string;          // ISO date, not > now + 1 day
    amountPaid: number;           // > 0
    referenceNumber?: string;     // max 100 chars
    notes?: string;               // max 500 chars
    financialAccountId?: string;  // uuid; format-only before Phase 3/BE Phase 12, existence-checked after
  }
  → 201 {
    paymentRecord: PaymentRecord;
    pembayaran: {
      id: string;
      status: StatusPembayaran;
      totalDibayar: number;
      tanggalBayar: string | null;
    };
    warning?: "overpaid";
  }
  Same Idempotency-Key + same body replayed → 200 with the original result, never a second record.

GET    /api/pembayaran/:id/payments
  → 200 { data: PaymentRecord[] }   // ordered by paymentDate ascending
```

`PaymentRecord`:
```ts
type PaymentMethod = "CASH" | "BANK_TRANSFER" | "QRIS" | "E_WALLET" | "OTHER";

interface PaymentRecord {
  id: string;
  pembayaranId: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  amountPaid: number;
  referenceNumber?: string;
  notes?: string;
  financialAccountId?: string;
  financialTransactionId?: string; // present once BE Phase 12 / FE Phase 3 links the ledger row
  createdByAdmin?: { id: string; nama: string };
  createdAt: string;
}
```

**Live-contract notes:** all routes above require auth; payment resources are property-scoped.
`financialTransactionId` is additive and may be absent before the finance integration exists.

**Mock fixtures/handlers:** seed 3–4 bills across `BELUM_BAYAR`/`SEBAGIAN`/`LUNAS`/`TERLAMBAT`;
handler recomputes `status`/`totalDibayar` in-memory using the same four-branch rule `PLAN_BE.md`
documents: zero paid + overdue → `TERLAMBAT`; zero paid + not overdue → `BELUM_BAYAR`;
`0 < totalDibayar < nominal` → `SEBAGIAN` regardless of due date; `totalDibayar >= nominal` → `LUNAS`.
The handler also sets `tanggalBayar` when the threshold is crossed and enforces idempotency-key replay.

**Acceptance criteria:**
- [ ] Recording a partial payment updates status/progress against the mock without a full reload.
- [ ] A double-submit (same key) against the mock produces exactly one record — provable in a test
      without a real backend.
- [ ] Payment history renders newest-relevant action within 2 taps from the bill list.

---

## Phase 2 — Notifications (templates, reminder config, manual send, sweep, delivery, resend)

Built as one FE phase, channel-agnostic and WhatsApp-inclusive from the start. The mocked UI offers
`WEB_PUSH` and `WHATSAPP` together from day one, while live parity depends on backend Phases 6, 8, 9,
and 10. The FE build order does not need to mirror that backend rollout order.

**UI:**
- `MessageTemplateList.tsx` / `MessageTemplateEditForm.tsx` — one row per `jenis` × `channel`;
  edit form has a placeholder-token legend (`{{nama}}`, etc.) validated client-side against a
  shared whitelist constant (kept in one place so it can't drift from whatever validates it later).
- `NotificationLogList.tsx` — filterable by channel/status/date with page-based pagination from the
  shared `Pagination` DTO; status badges map to tokens (`FAILED`→`error`, `DELIVERED`/`READ`→`primary`,
  `PENDING`/`SENT`→neutral); row-level "Resend" action enabled only when `status === "FAILED"`.
- `ReminderConfigForm.tsx` — `offsets` as an add/remove chip input (client-validated: sorted,
  distinct integers in `[-30, 30]`), `channels` multi-select (`WEB_PUSH`, `WHATSAPP`), `active`
  toggle.
- Bill detail — "Send reminder now" action; OWNER-only "Run sweep now" with confirmation.
- OWNER-gated actions render disabled-with-tooltip for non-OWNER admins (UX courtesy; the real
  boundary is the contract's own auth rule, enforced by whoever implements it).

**Contract (frozen by this phase):**
```
GET    /api/message-template?channel=WEB_PUSH|WHATSAPP
  → 200 { data: MessageTemplate[] }
POST   /api/message-template                                      → 201 MessageTemplate   [OWNER]
  // backend-supported ops/seeding surface; current FE ships no create-template UI
PATCH  /api/message-template/:id   { isi: string }                → 200 MessageTemplate   [OWNER]

GET    /api/notification-log?penyewaId=&channel=&status=&from=&to=&page=&pageSize=
  → 200 { data: NotificationLog[]; pagination: Pagination }
POST   /api/notification-log/:id/resend
  → 201 NotificationLog   // new row, independent id

GET    /api/reminder-config
  → 200 ReminderConfig
PATCH  /api/reminder-config
  { offsets: number[]; channels: NotificationChannel[]; active: boolean }
  → 200 ReminderConfig   [OWNER]

POST   /api/notification/reminders/send
  { pembayaranId: string } | { penyewaId: string }
  → 200 { sent: NotificationLog[]; skipped: { reason: string }[] }
POST   /api/notification/reminders/run-sweep
  → 200 { sent: number; skipped: number }   [OWNER]

# Backend-only public provider endpoints; documented for parity, never called by FE hooks/MSW UI flows
GET    /api/notification/whatsapp/webhook    [public]
POST   /api/notification/whatsapp/webhook    [public]
```

Shared types:
```ts
type NotificationChannel = "WEB_PUSH" | "WHATSAPP" | "EMAIL" | "SMS";
type NotificationStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";

interface MessageTemplate {
  id: string;
  channel: NotificationChannel;
  jenis: string;
  isi: string;
  aktif: boolean;
  updatedAt: string;
}

interface NotificationLog {
  id: string; channel: NotificationChannel; jenis: string;
  recipient: string; status: NotificationStatus;
  isiRingkas: string; sentAt?: string; deliveredAt?: string; readAt?: string;
  failedAt?: string; failureReason?: string;
}

interface ReminderConfig {
  offsets: number[]; channels: NotificationChannel[]; active: boolean; updatedAt: string;
}
```

**Pagination behavior:** `page`/`pageSize` are optional; default `1`/`50`. Filter changes reset the FE
list to page 1.

**Mock fixtures/handlers:** seed templates for the existing `jenis` values across both channels;
seed a notification log with at least one row in each status (including `FAILED`, so Resend is
testable); the "same-day dedupe" rule from `PLAN_BE.md` is honored by the mock too — a second
manual send for the same bill/channel/day returns a `skipped` entry, not a duplicate row, so the
UI's "already sent today" messaging is built and tested against real (mocked) behavior, not
assumed.

**Acceptance criteria:**
- [ ] Templates, log, and reminder config are all readable/editable against the mock, including
      the WhatsApp channel from first ship.
- [ ] Resend produces a new, independently-tracked mock row.
- [ ] A second same-day manual reminder send is visibly reported as skipped, not silently duplicated.
- [ ] A `SEBAGIAN` reminder uses the remaining balance (`nominal - totalDibayar`), and `LUNAS` bills
      are skipped even if a configured reminder offset matches.
- [ ] Manual resend of a `FAILED` log creates a fresh attempt even when normal reminder dedupe would
      suppress another scheduled/manual reminder for the same day.

---

## Phase 3 — Finance Ledger (accounts, categories, manual transactions, audit log)

**UI:**
- `FinanceAccountList.tsx` / `FinanceAccountForm.tsx` — name, type (CASH/BANK/E_WALLET/QRIS/
  OTHER), conditional `bankName`/`accountNumber` (BANK only), `openingBalance`.
- `FinanceCategoryList.tsx` / `FinanceCategoryForm.tsx` — tabbed by INCOME/EXPENSE; seeded
  defaults (RENT, LATE_FEE, … / ELECTRICITY, WATER, …) carry a "system category" badge but remain
  editable, not hard-locked.
- `FinanceTransactionList.tsx` — filters: type, category, account, date range, plus page-based
  pagination from the shared `Pagination` DTO. Manual-entry form only ever offers
  `MANUAL_INCOME`/`MANUAL_EXPENSE` as selectable sources — other `TransactionSource`
  values are never rendered as options at all (they're system-only, set by Phase 1/6/7 flows).
  Row-level soft-delete, OWNER-gated, standard confirm dialog.
- `AuditLogList.tsx` (OWNER-only route) — entity/action/admin/before-after, plain formatted block
  inside a Card (no new diff-viewer dependency unless one already exists in the repo — check first).
- `PaymentRecordForm.tsx` (Phase 1) — now enable the `financialAccountId` select for real, wired
  to `useFinanceAccounts()`.
- `PaymentHistoryList.tsx` (Phase 1) — each record's "View transaction" link now resolves for real.

**Contract (frozen by this phase):**
```
GET    /api/finance/accounts
  → 200 { data: FinancialAccount[] }
POST   /api/finance/accounts
  { name, type, bankName?, accountNumber?, openingBalance }
  → 201 FinancialAccount
PATCH  /api/finance/accounts/:id
  → 200 FinancialAccount

GET    /api/finance/categories?type=INCOME|EXPENSE
  → 200 { data: FinancialCategory[] }
POST   /api/finance/categories   { type, code, name }
  → 201 FinancialCategory
PATCH  /api/finance/categories/:id
  → 200 FinancialCategory

GET    /api/finance/transactions?type=&categoryId=&accountId=&from=&to=&page=&pageSize=
  → 200 { data: FinancialTransaction[]; pagination: Pagination }
POST   /api/finance/transactions
  { accountId, categoryId, amount, transactionDate, description?, referenceNumber?,
    source: "MANUAL_INCOME" | "MANUAL_EXPENSE" }
  → 201 FinancialTransaction
PATCH  /api/finance/transactions/:id
  { description?, referenceNumber?, categoryId? }
  → 200 FinancialTransaction
DELETE /api/finance/transactions/:id
  → 204   [OWNER, soft delete]

GET    /api/audit-log?entity=&entityId=&propertyId=&from=&to=
  → 200 { data: AuditLogEntry[] }   [OWNER]
```

Shared DTOs:
```ts
type FinancialAccountType = "CASH" | "BANK" | "E_WALLET" | "QRIS" | "OTHER";
type CategoryType = "INCOME" | "EXPENSE";
type TransactionType = "INCOME" | "EXPENSE";
type TransactionSource =
  | "RENT_PAYMENT" | "MANUAL_INCOME" | "MANUAL_EXPENSE"
  | "DEPOSIT" | "DEPOSIT_REFUND" | "ADJUSTMENT" | "REFUND";

interface FinancialAccount {
  id: string; name: string; type: FinancialAccountType;
  bankName?: string; accountNumber?: string; openingBalance: number; active: boolean;
}
interface FinancialCategory {
  id: string; type: CategoryType; code: string; name: string; active: boolean;
}
interface FinancialTransaction {
  id: string; accountId: string; categoryId: string; tenantId?: string; pembayaranId?: string;
  paymentRecordId?: string; depositId?: string;
  type: TransactionType; source: TransactionSource; amount: number;
  transactionDate: string; description?: string; referenceNumber?: string;
  vendorName?: string; receiptUrl?: string; createdAt: string; deletedAt?: string;
}
interface AuditLogEntry {
  id: string; entity: string; entityId: string; action: string;
  beforeValue?: unknown; afterValue?: unknown; adminId?: string; createdAt: string;
}
```

Phase 1's `PaymentRecord.financialTransactionId` now resolves when a payment is linked to its ledger
transaction. No Phase 1 consumer changes are required because the field was already optional there.

**Pagination behavior:** `page`/`pageSize` are optional; default `1`/`50`.

**Mock fixtures/handlers:** seed one Cash + one Bank account, the full default category list from
`PLAN_BE.md`'s finance defaults (RENT, LATE_FEE, PARKING, LAUNDRY, OTHER_INCOME / ELECTRICITY, WATER,
INTERNET, SALARY, CLEANING, MAINTENANCE, REPAIR, TAX, SUPPLIES, SECURITY, RENOVATION, MARKETING,
ADMINISTRATIVE, OTHER_EXPENSE); the Phase 1 payment handler now also inserts a matching
`FinancialTransaction` (`source: "RENT_PAYMENT"`) into the finance fixture store on every payment,
using the selected `financialAccountId` or the seeded default Cash account when it is absent,
so Phase 1 screens and Phase 3 screens are provably consistent against each other in the mock, the
same cross-check a real backend transaction would guarantee.

**Acceptance criteria:**
- [ ] Every manual transaction's `source` is restricted to the two manual values, enforced by the
      mock handler (a crafted "wrong" source is rejected, provable in a test).
- [ ] Soft-deleted rows disappear from the default list, remain in the audit log.
- [ ] A payment recorded in Phase 1 shows up as a linked transaction here, in-memory, without a
      real backend.

---

## Phase 4 — Expenses (vendor/receipt, reversal)

**UI:**
- `ExpenseForm.tsx` — category (EXPENSE-type only), account, amount, date, `vendorName`
  (required), `receiptUrl` (optional URL field — no upload pipeline, per explicit scope decision;
  reuse an existing upload component only if one is already in the repo).
- `ReverseTransactionDialog.tsx` (shared with Phase 3's transaction list) — reason required,
  OWNER-gated, shows the resulting offsetting entry inline on success.
- Reversed rows get a "Reversed" tag, stay visible (never removed).

**Contract (frozen by this phase):**
```
POST   /api/expenses            { categoryId, accountId, amount, transactionDate, vendorName,
                                   receiptUrl? }                  → 201 FinancialTransaction (type=EXPENSE)
GET    /api/expenses?categoryId=&accountId=&from=&to=&vendorName= → 200 { data: FinancialTransaction[] }
PATCH  /api/expenses/:id         { vendorName?, receiptUrl?, description? }  → 200 FinancialTransaction
POST   /api/expenses/:id/reverse { reason: string }               → 201 { reversal: FinancialTransaction }  [OWNER]
POST   /api/finance/transactions/:id/reverse { reason: string }   → 201 { reversal: FinancialTransaction }  [OWNER]
```

**Mock fixtures/handlers:** reversal handler inserts a new offsetting row referencing the
original by id/description, never mutates or removes the original — mirrored exactly so a test
can assert "list count goes up by one, original still present" against the mock.

**Acceptance criteria:**
- [ ] Expense creation is blocked client-side without a vendor name, and the mock also rejects it
      server-side (both layers tested, not just one).
- [ ] Reversal is unreachable in the UI for a non-OWNER session; reachable and functional for OWNER.

---

## Phase 5 — Receivables & Aging

**UI:**
- `ReceivablesSummaryCards.tsx` — reuses the existing `MetricCard` primitive (check before
  building a second one): total receivables, unpaid period count, property total.
- `ReceivablesByTenantList.tsx` — per-tenant outstanding + unpaid count, sortable, links to
  payment history.
- `AgingReportChart.tsx` — 5 buckets (Current, 1–30, 31–60, 61–90, >90), neutral→`error` gradient
  by severity; use whatever charting dependency is already installed before adding one.

**Contract (frozen by this phase):**
```
GET /api/receivables                → 200 { data: ReceivableByTenant[] }
GET /api/receivables/summary         → 200 ReceivableSummary
GET /api/receivables/aging           → 200 { buckets: AgingBucket[] }
```
```ts
interface ReceivableByTenant {
  penyewaId: string; nama: string; outstanding: number; unpaidPeriods: number;
}
interface ReceivableSummary {
  totalOutstanding: number; unpaidPeriodCount: number; propertyTotal: number;
}
interface AgingBucket {
  label: "current" | "1-30" | "31-60" | "61-90" | "90+";
  outstanding: number; count: number;
}
```

**Mock fixtures/handlers:** derive these entirely from the Phase 1/3 fixture store on read (never
a separately-seeded, hand-authored number) — this is the mock's version of the backend plan's own
"computed on read, not stored" design decision, and it means a test can change a bill's payment
state and assert the receivables numbers move accordingly, catching real logic bugs.

**Acceptance criteria:**
- [ ] Numbers are always derived, never independently seeded — provable by mutating a bill and
      re-reading receivables in the same test.
- [ ] A `SEBAGIAN` bill contributes only its remaining balance.

---

## Phase 6 — Tenant Deposits

**UI:** `DepositList.tsx`, `DepositReceiveForm.tsx`, `DepositDeductForm.tsx`,
`DepositRefundForm.tsx` — reuses the payment UI's card/row/sheet patterns almost verbatim (status
badge + amount + date + row actions), per DESIGN.md's "same job → same component." Status badges:
`HELD`→neutral, `PARTIALLY_REFUNDED`→amber, `REFUNDED`→`primary`, `FORFEITED`→`error`. Refund form
enforces `deductionAmount + refundAmount <= amountReceived` live, client-side. Tenant detail view
gets an inline deposit-status summary card.

**Contract (frozen by this phase):**
```
POST  /api/deposits              { penyewaId, amountReceived, receivedDate }  → 201 Deposit
GET   /api/deposits?penyewaId=&status=                                        → 200 { data: Deposit[] }
PATCH /api/deposits/:id/deduct   { deductionAmount, deductionReason }         → 200 Deposit
POST  /api/deposits/:id/refund   { refundAmount, refundDate }                → 200 Deposit
```
```ts
type DepositStatus = "HELD" | "PARTIALLY_REFUNDED" | "REFUNDED" | "FORFEITED";
interface Deposit {
  id: string; penyewaId: string; amountReceived: number; receivedDate: string;
  deductionAmount: number; deductionReason?: string;
  refundAmount?: number; refundDate?: string; status: DepositStatus;
}
```

**Acceptance criteria:**
- [ ] Mocked contracted mutations cover `HELD → PARTIALLY_REFUNDED → REFUNDED`; deduction/refund
      arithmetic always enforces `deductionAmount + refundAmount <= amountReceived`.
- [ ] `FORFEITED` is renderable if returned by the backend, but FE does **not** invent a forfeiture
      mutation because `PLAN_BE.md` §2.7 currently exposes no forfeiture endpoint. Add that action only
      after both plans version/freeze an explicit endpoint.
- [ ] Held/refundable deposits never render as rental revenue or income. Deposit cash movement may
      still appear in cash-flow reporting, matching backend accounting semantics.

---

## Phase 7 — Financial Reports

**UI:** `ReportDateRangePicker.tsx` (shared, URL-search-param-backed range) +
`RevenueReportPanel.tsx` (billed vs cash-based, both labeled, never merged into one number; render
`otherIncome` when supplied), `ExpenseReportPanel.tsx` (category totals + optional expense trend),
`CashFlowReportPanel.tsx`, `IncomeStatementReportPanel.tsx` (statement layout, `body-md`/`label-md`
typography, not chart/metric-card styling), `OccupancyPanel.tsx` (reuse the dashboard's existing
occupancy calc if present), `ReportsDashboardPanel.tsx` (landing tab; surface optional `overdueRent`
and revenue-trend metrics when present). The shared range validates `from <= to`; non-dashboard report
requests require both values and FE caps selection to the backend's maximum 3-year range.

**Contract (frozen by this phase):**
```
GET /api/reports/dashboard?from=&to=                       → 200 DashboardReport
GET /api/reports/transactions?from=&to=&type=&categoryId=  → 200 { data: FinancialTransaction[] }
GET /api/reports/revenue?from=&to=                         → 200 RevenueReport
GET /api/reports/expenses?from=&to=                        → 200 ExpenseReport
GET /api/reports/cash-flow?from=&to=                       → 200 CashFlowReport
GET /api/reports/income-statement?from=&to=                → 200 IncomeStatementReport
GET /api/reports/receivables                               → thin alias of Phase 5's endpoint
GET /api/reports/receivables/aging                         → thin alias of Phase 5's endpoint
```
```ts
interface RevenueReport {
  billedRevenue: number;
  cashRevenue: number;
  expectedRevenue: number;
  collectionRate: number;
  otherIncome?: number;
}
interface ExpenseReport {
  totalExpenses: number;
  byCategory: { categoryId: string; amount: number }[];
  trend?: { month: string; amount: number }[];
}
interface CashFlowReport { inflow: number; outflow: number; net: number }
interface IncomeStatementReport {
  totalIncome: number; totalExpenses: number; netOperatingIncome: number;
}
interface DashboardReport {
  revenue: RevenueReport;
  expenses: ExpenseReport;
  cashFlow: CashFlowReport;
  occupancyRate: number;
  overdueRent?: number;
  revenueTrend?: { month: string; billedRevenue: number; cashRevenue: number }[];
}
```

The optional report fields are additive compatibility fields defined by the backend reconciliation. FE
must type them now and render them when present, while remaining compatible with responses containing
only the previously-required fields. `/api/reports/dashboard` may default to the current month; the other
report endpoints require `from` and `to`.

**Mock fixtures/handlers:** every number here is computed from the same fixture store Phases
1/3/4/6 already mutate — no report-specific fixture is hand-authored, which is exactly what makes
this phase catch cross-feature bugs (e.g. a deposit accidentally leaking into revenue) before any
backend exists.

**Acceptance criteria:**
- [ ] Every metric in the backend plan's Phase 16 table has a visible home.
- [ ] Changing the shared date range updates every panel from one control.
- [ ] Held deposit receipts and deposit refunds never contaminate rental revenue or the operating
      income statement, while both remain visible in cash-flow inflow/outflow as real cash movement.
- [ ] Billed revenue and cash revenue diverge correctly for a partially paid bill in the selected range.

---

## Phase 8 — Dashboard Expansion

**UI:** modify `dashboard-mobile.tsx`/`dashboard-desktop.tsx` — add metric cards (same `MetricCard`
primitive, same grid): reminders sent today, failed messages needing attention (links to Phase 2's
filtered log), total receivables, net operating income this month. Mobile grid cards use
`heading-lg`, not `heading-xl` (DESIGN.md §5 fix #8, applied proactively).

**Contract:**
```ts
GET /api/dashboard/summary?from=&to= → 200 {
  kamar: /* existing shape unchanged */;
  pembayaran: /* existing shape unchanged */;
  finance?: {
    totalReceivables: number;
    netOperatingIncomeThisMonth: number;
  };
  notifications?: {
    remindersSentToday: number;
    failedMessagesCount: number;
  };
}
```
`from`/`to` are optional and default to the current month. The two new groups are additive and optional
for backward compatibility; new cards render a safe loading/unavailable state if an older backend omits
them rather than fabricating zero.

**Acceptance criteria:**
- [ ] Existing dashboard cards are pixel-for-pixel unchanged.
- [ ] "Failed messages" card is a live, clickable count against the mock, not a static number.

---

## Phase 9 — Contract Freeze, Full Test Pass, and Backend Handoff

**Objective:** Lock every synchronized contract from Phases 1–8 into one consolidated reference, prove
the FE works end-to-end against mocks, and give both teams one drift-detection target. `CONTRACT.md` is
not an FE-vs-BE precedence document; it is the shared frozen wire contract reproduced from this plan and
`PLAN_BE.md` §2.

**Files to create:**
- `CONTRACT.md` — generated/maintained by hand, one section per phase above, each with the exact
  endpoint list + request/response TypeScript already written in this document, copy-consolidated
  into a single reference so a backend implementer needs to read one file, not nine phase sections
  spread through this plan.
- Component/hook tests for every screen in Phases 1–8 (validation states + happy paths), same
  coverage bar as any other feature work — nothing here is exempted for being "just mocked."
- `src/mocks/` fixtures reach a state where a manual QA pass can walk every feature end-to-end
  (record a payment → see it in finance → see it in receivables → see it in reports → see it on
  the dashboard) entirely offline.

**Synchronization instructions (put at the top of `CONTRACT.md`):**
> This file is the shared FE/BE wire contract. It must stay equivalent to the consolidated API contract
> in `PLAN_BE.md` §2: same paths, methods, request/response DTOs, status codes, pagination, and auth/role
> gates. Backend internals remain governed by `PLAN_BE.md`; frontend composition remains governed by
> `DESIGN.md`, `AGENTS.md`, and this FE plan. Any contract change after freeze is versioned, updated on
> both sides in the same change set, and covered by mock plus backend contract tests. No side silently
> wins a mismatch.

**Acceptance criteria:**
- [ ] `CONTRACT.md` alone is sufficient to implement or verify either side of the API without opening
      the two phase plans, including the backend-only WhatsApp webhook routes explicitly marked as such.
- [ ] `CONTRACT.md` has zero unresolved shape differences against `PLAN_BE.md` §2. Backend `[proposed]`
      addenda adopted here (pagination, `MessageTemplate`, report extras, dashboard groups) are no longer
      left as FE ambiguities.
- [ ] Every FE phase's acceptance criteria pass in CI against MSW with zero accidental live network calls.
- [ ] Backend contract tests (BE Phases 18/20) verify JSON numbers stay numbers, role gates match, and
      paginated DTOs match the shared shape before production integration.
- [ ] Flipping `NEXT_PUBLIC_API_MODE` to `live` against a backend that honors `CONTRACT.md` requires no
      frontend code/type change. A live smoke pass is required before production release.

---

## Appendix: consolidated new folder structure (FE)

```
src/
├── app/admin/
│   ├── notifications/{page.tsx, log/page.tsx, settings/page.tsx}
│   └── finance/{accounts,categories,transactions,audit-log,expenses,receivables,deposits,reports}/page.tsx
├── components/features/admin/
│   ├── payment/        # MODIFIED — PaymentRecordForm, PaymentHistoryList (Phase 1, 3)
│   ├── notification/   # NEW — Phase 2
│   ├── finance/         # NEW — Phase 3
│   ├── expense/         # NEW — Phase 4
│   ├── receivable/      # NEW — Phase 5
│   ├── deposit/          # NEW — Phase 6
│   ├── report/            # NEW — Phase 7
│   └── dashboard/          # MODIFIED — Phase 8
├── hooks/api/               # + one file per resource, listed in §1.3
├── hooks/features/admin/     # + one feature-state hook per new screen
├── mocks/                     # NEW — handlers/, fixtures/, browser.ts, server.ts (§1.2)
└── types/                      # + payment-record, notification, finance, expense, receivable,
                                 #   deposit, report, audit-log, pagination (§1.1)

CONTRACT.md   # NEW, repo root — consolidated API contract, Phase 9 deliverable
```

## Appendix: definition of done (per phase)

1. Reused existing hooks/components/primitives before writing new ones (Ponytail rung 2/4).
2. Mobile (`md:hidden`) and desktop (`hidden md:block`) variants both built, same data hook.
3. Followed `DESIGN.md` tokens exactly — no new hardcoded color/radius/shadow.
4. Contract for this phase is written down before or alongside the UI and matches the corresponding
   `PLAN_BE.md` §2 shape exactly; no FE-only DTO guesses remain.
5. Mock handlers enforce the contract's validation rules, pagination, idempotency/dedupe semantics,
   property isolation behavior, and auth/role gates, not just the happy path.
6. OWNER-gated actions are gated in the UI as UX courtesy; the mock enforces the real rule too, so the
   test suite catches a UI that forgets the gate.
7. Contract tests assert every monetary value typed as `number` is returned as a JSON number, never a
   serialized Decimal string.
8. `npm run lint` / `npm run format:fix` clean, TypeScript strict compiles.
9. Tests added: at least one validation-rejection + one happy-path per new form/mutation.
10. If the corresponding backend phase exists, the live smoke checklist confirms no component, hook,
    query-key, or TypeScript contract change is needed when switching from mock to live.
