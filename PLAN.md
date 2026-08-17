# Plan: Kost Bunda Elin FE — Frontend-First (FE ships complete; backend implements to match)

> This plan inverts the relationship implied by `PLAN_kost-bunda-elin-be_v2.md`. Nothing here
> waits for a backend endpoint to exist. Every phase ships a **fully working, fully testable**
> screen against a **mocked API layer**, and every phase ends by freezing a **contract** — exact
> endpoint, method, request shape, response shape, status codes — that the backend must implement
> afterward. Where the backend plan's shapes agree with a contract below, great, reuse them as
> implementation detail (DB schema, migrations, provider plumbing are still the backend's own
> concern). **Where they disagree, this document wins.** The backend plan should be revised to
> match this one, not the other way around.
>
> `DESIGN.md` (tokens/components) and `AGENTS.md` (architecture/workflow) are unchanged as the
> source of truth for *how* to build. This document only adds *what* to build and *in what order*
> — an order driven entirely by user-facing value and FE dependency, never by backend readiness.

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
  default). No component, hook, or type changes. This is the actual mechanism that lets "backend
  depends on frontend" be true rather than aspirational — the frontend's behavior is already fully
  defined and tested before a single backend line exists.
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
4. **Acceptance criteria** — entirely FE-observable (renders, validates, mutates the mock store,
   refetches correctly). None of them say "verify against the live backend," because there isn't
   one yet.

---

## 1. Foundations (build first, before any feature phase)

### 1.1 Contract types — `src/types/`

Every new domain type is written **as the contract**, not copied from an existing backend draft.
One file per resource, barrel-exported from `src/types/index.ts`, same pattern as the existing
`room.ts`/`tenant.ts`:

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
                            # IncomeStatementReport
└── audit-log.ts            # AuditLogEntry
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
POST /api/pembayaran/:id/payments
  headers: { "Idempotency-Key": string }
  body: {
    paymentMethod: "CASH" | "BANK_TRANSFER" | "QRIS" | "E_WALLET" | "OTHER";
    paymentDate: string;          // ISO date, not > now + 1 day
    amountPaid: number;           // > 0
    referenceNumber?: string;     // max 100 chars
    notes?: string;               // max 500 chars
    financialAccountId?: string;  // uuid, format-checked only at this layer
  }
  → 201 {
    paymentRecord: PaymentRecord;
    pembayaran: { id, status, totalDibayar, tanggalBayar };
    warning?: "overpaid";
  }
  Same Idempotency-Key + same body replayed → 200 with the original result, not a second record.

GET /api/pembayaran/:id/payments
  → 200 { data: PaymentRecord[] }   // ordered by paymentDate ascending

GET /api/pembayaran?status=belum_bayar|sebagian|lunas|terlambat|akan_jatuh_tempo|menunggak
  → unchanged shape, "sebagian" is a new accepted filter value
```

`PaymentRecord`:
```ts
interface PaymentRecord {
  id: string;
  pembayaranId: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  amountPaid: number;
  referenceNumber?: string;
  notes?: string;
  financialAccountId?: string;
  createdByAdmin?: { id: string; nama: string };
  createdAt: string;
}
```

**Mock fixtures/handlers:** seed 3–4 bills across `BELUM_BAYAR`/`SEBAGIAN`/`LUNAS`/`TERLAMBAT`;
handler recomputes `status`/`totalDibayar` in-memory using the same four-branch rule the backend
plan documents (`totalDibayar<=0` + overdue → `TERLAMBAT`, etc.) so the mock's behavior is a real
functional twin, not just a canned response; handler enforces the idempotency-key replay behavior.

**Acceptance criteria:**
- [ ] Recording a partial payment updates status/progress against the mock without a full reload.
- [ ] A double-submit (same key) against the mock produces exactly one record — provable in a test
      without a real backend.
- [ ] Payment history renders newest-relevant action within 2 taps from the bill list.

---

## Phase 2 — Notifications (templates, reminder config, manual send, sweep, delivery, resend)

Built as one phase, channel-agnostic and WhatsApp-inclusive from the start — there's no backend
rollout order to stagger around, so the channel selector simply offers `WEB_PUSH` and `WHATSAPP`
together from day one.

**UI:**
- `MessageTemplateList.tsx` / `MessageTemplateEditForm.tsx` — one row per `jenis` × `channel`;
  edit form has a placeholder-token legend (`{{nama}}`, etc.) validated client-side against a
  shared whitelist constant (kept in one place so it can't drift from whatever validates it later).
- `NotificationLogList.tsx` — filterable by channel/status/date; status badges map to tokens
  (`FAILED`→`error`, `DELIVERED`/`READ`→`primary`, `PENDING`/`SENT`→neutral); row-level "Resend"
  action enabled only when `status === "FAILED"`.
- `ReminderConfigForm.tsx` — `offsets` as an add/remove chip input (client-validated: sorted,
  distinct integers in `[-30, 30]`), `channels` multi-select (`WEB_PUSH`, `WHATSAPP`), `active`
  toggle.
- Bill detail — "Send reminder now" action; OWNER-only "Run sweep now" with confirmation.
- OWNER-gated actions render disabled-with-tooltip for non-OWNER admins (UX courtesy; the real
  boundary is the contract's own auth rule, enforced by whoever implements it).

**Contract (frozen by this phase):**
```
GET   /api/message-template?channel=WEB_PUSH|WHATSAPP           → 200 { data: MessageTemplate[] }
PATCH /api/message-template/:id   { isi: string }                → 200 MessageTemplate   [OWNER]

GET   /api/notification-log?penyewaId=&channel=&status=&from=&to=
                                                                  → 200 { data: NotificationLog[]; pagination }
POST  /api/notification-log/:id/resend                          → 201 NotificationLog (new row, independent id)

GET   /api/reminder-config                                       → 200 ReminderConfig
PATCH /api/reminder-config  { offsets: number[]; channels: NotificationChannel[]; active: boolean }
                                                                  → 200 ReminderConfig   [OWNER]

POST  /api/notification/reminders/send   { pembayaranId } | { penyewaId }
                                                                  → 200 { sent: NotificationLog[]; skipped: { reason: string }[] }
POST  /api/notification/reminders/run-sweep                      → 200 { sent: number; skipped: number }   [OWNER]
```

Shared types:
```ts
type NotificationChannel = "WEB_PUSH" | "WHATSAPP" | "EMAIL" | "SMS";
type NotificationStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";

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

**Mock fixtures/handlers:** seed templates for the existing `jenis` values across both channels;
seed a notification log with at least one row in each status (including `FAILED`, so Resend is
testable); the "same-day dedupe" rule from the backend plan is honored by the mock too — a second
manual send for the same bill/channel/day returns a `skipped` entry, not a duplicate row, so the
UI's "already sent today" messaging is built and tested against real (mocked) behavior, not
assumed.

**Acceptance criteria:**
- [ ] Templates, log, and reminder config are all readable/editable against the mock, including
      the WhatsApp channel from first ship.
- [ ] Resend produces a new, independently-tracked mock row.
- [ ] A second same-day manual send is visibly reported as skipped, not silently duplicated.

---

## Phase 3 — Finance Ledger (accounts, categories, manual transactions, audit log)

**UI:**
- `FinanceAccountList.tsx` / `FinanceAccountForm.tsx` — name, type (CASH/BANK/E_WALLET/QRIS/
  OTHER), conditional `bankName`/`accountNumber` (BANK only), `openingBalance`.
- `FinanceCategoryList.tsx` / `FinanceCategoryForm.tsx` — tabbed by INCOME/EXPENSE; seeded
  defaults (RENT, LATE_FEE, … / ELECTRICITY, WATER, …) carry a "system category" badge but remain
  editable, not hard-locked.
- `FinanceTransactionList.tsx` — filters: type, category, account, date range. Manual-entry form
  only ever offers `MANUAL_INCOME`/`MANUAL_EXPENSE` as selectable sources — other `TransactionSource`
  values are never rendered as options at all (they're system-only, set by Phase 1/6/7 flows).
  Row-level soft-delete, OWNER-gated, standard confirm dialog.
- `AuditLogList.tsx` (OWNER-only route) — entity/action/admin/before-after, plain formatted block
  inside a Card (no new diff-viewer dependency unless one already exists in the repo — check first).
- `PaymentRecordForm.tsx` (Phase 1) — now enable the `financialAccountId` select for real, wired
  to `useFinanceAccounts()`.
- `PaymentHistoryList.tsx` (Phase 1) — each record's "View transaction" link now resolves for real.

**Contract (frozen by this phase):**
```
GET    /api/finance/accounts                                    → 200 { data: FinancialAccount[] }
POST   /api/finance/accounts     { name, type, bankName?, accountNumber?, openingBalance }
                                                                  → 201 FinancialAccount
PATCH  /api/finance/accounts/:id                                 → 200 FinancialAccount

GET    /api/finance/categories?type=INCOME|EXPENSE               → 200 { data: FinancialCategory[] }
POST   /api/finance/categories   { type, code, name }             → 201 FinancialCategory
PATCH  /api/finance/categories/:id                                → 200 FinancialCategory

GET    /api/finance/transactions?type=&categoryId=&accountId=&from=&to=
                                                                  → 200 { data: FinancialTransaction[]; pagination }
POST   /api/finance/transactions  { accountId, categoryId, amount, transactionDate, description?,
                                     referenceNumber?, source: "MANUAL_INCOME" | "MANUAL_EXPENSE" }
                                                                  → 201 FinancialTransaction
PATCH  /api/finance/transactions/:id  { description?, referenceNumber?, categoryId? }
                                                                  → 200 FinancialTransaction
DELETE /api/finance/transactions/:id                              → 204   [OWNER, soft delete]

GET    /api/audit-log?entity=&entityId=&propertyId=&from=&to=    → 200 { data: AuditLogEntry[] }   [OWNER]
```

Now that this phase exists, Phase 1's contract is **extended, not changed**: a successful
`POST /api/pembayaran/:id/payments` response additionally includes a `financialTransactionId` on
the returned `paymentRecord` once linked (still additive — old consumers of the Phase 1 shape are
unaffected).

**Mock fixtures/handlers:** seed one Cash + one Bank account, the full default category list from
the backend plan's request (RENT, LATE_FEE, PARKING, LAUNDRY, OTHER_INCOME / ELECTRICITY, WATER,
INTERNET, SALARY, CLEANING, MAINTENANCE, REPAIR, TAX, SUPPLIES, SECURITY, RENOVATION, MARKETING,
ADMINISTRATIVE, OTHER_EXPENSE); the Phase 1 payment handler now also inserts a matching
`FinancialTransaction` (`source: "RENT_PAYMENT"`) into the finance fixture store on every payment,
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
- [ ] Status transitions in the mock match the lifecycle exactly (HELD → PARTIALLY_REFUNDED/
      REFUNDED, or → FORFEITED via a separate explicit action).
- [ ] Deposits never render anywhere labeled "revenue"/"income" — cross-checked against Phase 7's
      report screens once both exist.

---

## Phase 7 — Financial Reports

**UI:** `ReportDateRangePicker.tsx` (shared, URL-search-param-backed range) +
`RevenueReportPanel.tsx` (billed vs cash-based, both labeled, never merged into one number),
`ExpenseReportPanel.tsx`, `CashFlowReportPanel.tsx`, `IncomeStatementReportPanel.tsx` (statement
layout, `body-md`/`label-md` typography, not chart/metric-card styling), `OccupancyPanel.tsx`
(reuse the dashboard's existing occupancy calc if present), `ReportsDashboardPanel.tsx` (landing
tab).

**Contract (frozen by this phase):**
```
GET /api/reports/dashboard?from=&to=          → 200 DashboardReport
GET /api/reports/transactions?from=&to=&type=&categoryId=  → 200 { data: FinancialTransaction[] }
GET /api/reports/revenue?from=&to=            → 200 RevenueReport
GET /api/reports/expenses?from=&to=           → 200 ExpenseReport
GET /api/reports/cash-flow?from=&to=          → 200 CashFlowReport
GET /api/reports/income-statement?from=&to=   → 200 IncomeStatementReport
GET /api/reports/receivables                  → thin alias of Phase 5's endpoint
GET /api/reports/receivables/aging             → thin alias of Phase 5's endpoint
```
```ts
interface RevenueReport {
  billedRevenue: number; cashRevenue: number; expectedRevenue: number; collectionRate: number;
}
interface ExpenseReport { totalExpenses: number; byCategory: { categoryId: string; amount: number }[] }
interface CashFlowReport { inflow: number; outflow: number; net: number }
interface IncomeStatementReport { totalIncome: number; totalExpenses: number; netOperatingIncome: number }
interface DashboardReport {
  revenue: RevenueReport; expenses: ExpenseReport; cashFlow: CashFlowReport;
  occupancyRate: number;
}
```

**Mock fixtures/handlers:** every number here is computed from the same fixture store Phases
1/3/4/6 already mutate — no report-specific fixture is hand-authored, which is exactly what makes
this phase catch cross-feature bugs (e.g. a deposit accidentally leaking into revenue) before any
backend exists.

**Acceptance criteria:**
- [ ] Every metric in the backend plan's Phase 16 table has a visible home.
- [ ] Changing the shared date range updates every panel from one control.
- [ ] A deposit transaction (Phase 6) never shows up in `RevenueReport`, provable against the mock.

---

## Phase 8 — Dashboard Expansion

**UI:** modify `dashboard-mobile.tsx`/`dashboard-desktop.tsx` — add metric cards (same `MetricCard`
primitive, same grid): reminders sent today, failed messages needing attention (links to Phase 2's
filtered log), total receivables, net operating income this month. Mobile grid cards use
`heading-lg`, not `heading-xl` (DESIGN.md §5 fix #8, applied proactively).

**Contract:** `GET /api/dashboard/summary?from=&to=` response type gains optional `finance` and
`notifications` keys — additive only, existing `kamar`/`pembayaran` keys untouched.

**Acceptance criteria:**
- [ ] Existing dashboard cards are pixel-for-pixel unchanged.
- [ ] "Failed messages" card is a live, clickable count against the mock, not a static number.

---

## Phase 9 — Contract Freeze, Full Test Pass, and Backend Handoff

**Objective:** Lock every contract from Phases 1–8 into one consolidated reference, and prove the
whole FE works end-to-end against mocks with no gaps — this is the artifact that makes "backend
depends on frontend" concrete instead of aspirational.

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

**Handoff instructions (put at the top of `CONTRACT.md`):**
> Implement every endpoint in this document exactly as specified — path, method, request shape,
> response shape, status codes, and the stated auth/role gates. Internal implementation choices
> (database schema, migrations, cron scheduling, third-party provider integration, retry/backoff
> mechanics) are entirely up to the backend team; `PLAN_kost-bunda-elin-be_v2.md` is a reasonable
> reference for that internal detail and can still guide schema/migration decisions where it
> doesn't conflict with the contract here. Where it does conflict, this document is authoritative
> — the frontend was built and tested against these shapes; changing them after the fact is a
> breaking change to already-shipped, already-tested UI, not a free adjustment.

**Acceptance criteria:**
- [ ] `CONTRACT.md` alone is sufficient for someone who has never read this plan to implement a
      backend that the existing frontend works against unmodified.
- [ ] Every phase's acceptance criteria above pass in CI against the mock, with zero live network
      calls anywhere in the suite.
- [ ] Flipping `NEXT_PUBLIC_API_MODE` to `live` against a backend that honors `CONTRACT.md`
      requires no frontend code change — verified as a checklist item once a backend exists, not
      before.

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
                                 #   deposit, report, audit-log (§1.1)

CONTRACT.md   # NEW, repo root — consolidated API contract, Phase 9 deliverable
```

## Appendix: definition of done (per phase)

1. Reused existing hooks/components/primitives before writing new ones (Ponytail rung 2/4).
2. Mobile (`md:hidden`) and desktop (`hidden md:block`) variants both built, same data hook.
3. Followed `DESIGN.md` tokens exactly — no new hardcoded color/radius/shadow.
4. Contract for this phase is written down (this document) before or alongside the UI, not
   reverse-engineered from whatever the UI happened to call.
5. Mock handlers enforce the contract's validation rules, not just its happy path.
6. OWNER-gated actions gated in the UI as UX courtesy; the mock enforces the real rule too, so the
   test suite catches a UI that forgets the gate.
7. `npm run lint` / `npm run format:fix` clean, TypeScript strict compiles.
8. Tests added: at least one validation-rejection + one happy-path per new form/mutation.
