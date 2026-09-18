import type {
  FinancialAccount,
  FinancialCategory,
  FinancialTransaction,
  AuditLogEntry,
} from "@/types";

function nid() {
  return `fin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const nowIso = () => new Date().toISOString();

export let financeAccounts: FinancialAccount[] = [
  {
    id: "fin-acc-cash",
    name: "Cash",
    type: "CASH",
    openingBalance: 0,
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "fin-acc-bank",
    name: "BCA Utama",
    type: "BANK",
    bankName: "BCA",
    accountNumber: "1234567890",
    openingBalance: 5000000,
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export let financeCategories: FinancialCategory[] = [
  // INCOME
  {
    id: "cat-rent",
    type: "INCOME",
    code: "RENT",
    name: "Sewa Kamar",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-late-fee",
    type: "INCOME",
    code: "LATE_FEE",
    name: "Denda Keterlambatan",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-parking",
    type: "INCOME",
    code: "PARKING",
    name: "Parkir",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-laundry",
    type: "INCOME",
    code: "LAUNDRY",
    name: "Laundry",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-other-income",
    type: "INCOME",
    code: "OTHER_INCOME",
    name: "Pemasukan Lain",
    active: true,
    createdAt: nowIso(),
  },
  // EXPENSE
  {
    id: "cat-electricity",
    type: "EXPENSE",
    code: "ELECTRICITY",
    name: "Listrik",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-water",
    type: "EXPENSE",
    code: "WATER",
    name: "Air",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-internet",
    type: "EXPENSE",
    code: "INTERNET",
    name: "Internet",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-salary",
    type: "EXPENSE",
    code: "SALARY",
    name: "Gaji",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-cleaning",
    type: "EXPENSE",
    code: "CLEANING",
    name: "Kebersihan",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-maintenance",
    type: "EXPENSE",
    code: "MAINTENANCE",
    name: "Perawatan",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-repair",
    type: "EXPENSE",
    code: "REPAIR",
    name: "Perbaikan",
    active: true,
    createdAt: nowIso(),
  },
  { id: "cat-tax", type: "EXPENSE", code: "TAX", name: "Pajak", active: true, createdAt: nowIso() },
  {
    id: "cat-supplies",
    type: "EXPENSE",
    code: "SUPPLIES",
    name: "Perlengkapan",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-security",
    type: "EXPENSE",
    code: "SECURITY",
    name: "Keamanan",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-renovation",
    type: "EXPENSE",
    code: "RENOVATION",
    name: "Renovasi",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-marketing",
    type: "EXPENSE",
    code: "MARKETING",
    name: "Pemasaran",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-administrative",
    type: "EXPENSE",
    code: "ADMINISTRATIVE",
    name: "Administrasi",
    active: true,
    createdAt: nowIso(),
  },
  {
    id: "cat-other-expense",
    type: "EXPENSE",
    code: "OTHER_EXPENSE",
    name: "Pengeluaran Lain",
    active: true,
    createdAt: nowIso(),
  },
];

export let financeTransactions: FinancialTransaction[] = [
  {
    id: "fin-trx-seed-1",
    accountId: "fin-acc-cash",
    categoryId: "cat-electricity",
    type: "EXPENSE",
    source: "MANUAL_EXPENSE",
    amount: 450000,
    transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Tagihan listrik Januari",
    referenceNumber: "PLN-001",
    vendorName: "PLN",
    receiptUrl: "https://example.com/receipts/pln-jan.pdf",
    createdAt: nowIso(),
  },
  {
    id: "fin-trx-seed-2",
    accountId: "fin-acc-bank",
    categoryId: "cat-water",
    type: "EXPENSE",
    source: "MANUAL_EXPENSE",
    amount: 320000,
    transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Tagihan air Februari",
    referenceNumber: "PAM-002",
    vendorName: "PDAM Tirta",
    createdAt: nowIso(),
  },
  {
    id: "fin-trx-seed-3",
    accountId: "fin-acc-cash",
    categoryId: "cat-cleaning",
    type: "EXPENSE",
    source: "MANUAL_EXPENSE",
    amount: 150000,
    transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Jasa kebersihan mingguan",
    vendorName: "Mitra Bersih",
    createdAt: nowIso(),
  },
];

export let auditLogs: AuditLogEntry[] = [
  {
    id: "audit-1",
    entity: "FinancialTransaction",
    entityId: "fin-trx-seed-1",
    action: "TRANSACTION_CREATED",
    afterValue: { amount: 450000 },
    adminId: "admin-1",
    createdAt: nowIso(),
  },
];

export function resetFinance() {
  financeAccounts = [
    {
      id: "fin-acc-cash",
      name: "Cash",
      type: "CASH",
      openingBalance: 0,
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "fin-acc-bank",
      name: "BCA Utama",
      type: "BANK",
      bankName: "BCA",
      accountNumber: "1234567890",
      openingBalance: 5000000,
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  financeCategories = [
    {
      id: "cat-rent",
      type: "INCOME",
      code: "RENT",
      name: "Sewa Kamar",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-late-fee",
      type: "INCOME",
      code: "LATE_FEE",
      name: "Denda Keterlambatan",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-parking",
      type: "INCOME",
      code: "PARKING",
      name: "Parkir",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-laundry",
      type: "INCOME",
      code: "LAUNDRY",
      name: "Laundry",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-other-income",
      type: "INCOME",
      code: "OTHER_INCOME",
      name: "Pemasukan Lain",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-electricity",
      type: "EXPENSE",
      code: "ELECTRICITY",
      name: "Listrik",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-water",
      type: "EXPENSE",
      code: "WATER",
      name: "Air",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-internet",
      type: "EXPENSE",
      code: "INTERNET",
      name: "Internet",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-salary",
      type: "EXPENSE",
      code: "SALARY",
      name: "Gaji",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-cleaning",
      type: "EXPENSE",
      code: "CLEANING",
      name: "Kebersihan",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-maintenance",
      type: "EXPENSE",
      code: "MAINTENANCE",
      name: "Perawatan",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-repair",
      type: "EXPENSE",
      code: "REPAIR",
      name: "Perbaikan",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-tax",
      type: "EXPENSE",
      code: "TAX",
      name: "Pajak",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-supplies",
      type: "EXPENSE",
      code: "SUPPLIES",
      name: "Perlengkapan",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-security",
      type: "EXPENSE",
      code: "SECURITY",
      name: "Keamanan",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-renovation",
      type: "EXPENSE",
      code: "RENOVATION",
      name: "Renovasi",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-marketing",
      type: "EXPENSE",
      code: "MARKETING",
      name: "Pemasaran",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-administrative",
      type: "EXPENSE",
      code: "ADMINISTRATIVE",
      name: "Administrasi",
      active: true,
      createdAt: nowIso(),
    },
    {
      id: "cat-other-expense",
      type: "EXPENSE",
      code: "OTHER_EXPENSE",
      name: "Pengeluaran Lain",
      active: true,
      createdAt: nowIso(),
    },
  ];

  financeTransactions = [
    {
      id: "fin-trx-seed-1",
      accountId: "fin-acc-cash",
      categoryId: "cat-electricity",
      type: "EXPENSE",
      source: "MANUAL_EXPENSE",
      amount: 450000,
      transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Tagihan listrik Januari",
      referenceNumber: "PLN-001",
      vendorName: "PLN",
      receiptUrl: "https://example.com/receipts/pln-jan.pdf",
      createdAt: nowIso(),
    },
    {
      id: "fin-trx-seed-2",
      accountId: "fin-acc-bank",
      categoryId: "cat-water",
      type: "EXPENSE",
      source: "MANUAL_EXPENSE",
      amount: 320000,
      transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Tagihan air Februari",
      referenceNumber: "PAM-002",
      vendorName: "PDAM Tirta",
      createdAt: nowIso(),
    },
    {
      id: "fin-trx-seed-3",
      accountId: "fin-acc-cash",
      categoryId: "cat-cleaning",
      type: "EXPENSE",
      source: "MANUAL_EXPENSE",
      amount: 150000,
      transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Jasa kebersihan mingguan",
      vendorName: "Mitra Bersih",
      createdAt: nowIso(),
    },
  ];

  auditLogs = [
    {
      id: "audit-1",
      entity: "FinancialTransaction",
      entityId: "fin-trx-seed-1",
      action: "TRANSACTION_CREATED",
      afterValue: { amount: 450000 },
      adminId: "admin-1",
      createdAt: nowIso(),
    },
  ];
}

// helpers for cross-module writes (used by pembayaran handler)
export function createLinkedTransactionForPayment(params: {
  paymentRecordId: string;
  pembayaranId: string;
  penyewaId?: string;
  accountId: string;
  amount: number;
  paymentDate: string;
  referenceNumber?: string;
  periodeBulan?: number;
  periodeTahun?: number;
}) {
  const trx: FinancialTransaction = {
    id: nid(),
    accountId: params.accountId,
    categoryId: "cat-rent",
    pembayaranId: params.pembayaranId,
    paymentRecordId: params.paymentRecordId,
    tenantId: params.penyewaId,
    type: "INCOME",
    source: "RENT_PAYMENT",
    amount: params.amount,
    transactionDate: new Date(params.paymentDate).toISOString(),
    description:
      params.periodeBulan && params.periodeTahun
        ? `Pembayaran sewa ${params.periodeBulan}/${params.periodeTahun}`
        : "Pembayaran sewa",
    referenceNumber: params.referenceNumber,
    createdAt: nowIso(),
  };
  financeTransactions.push(trx);

  const entry: AuditLogEntry = {
    id: nid(),
    entity: "FinancialTransaction",
    entityId: trx.id,
    action: "TRANSACTION_CREATED",
    afterValue: trx,
    adminId: "admin-1",
    createdAt: nowIso(),
  };
  auditLogs.push(entry);

  return trx;
}

export function resolveDefaultAccountId(requestedId?: string): string {
  if (requestedId) {
    const found = financeAccounts.find((a) => a.id === requestedId && a.active);
    if (found) return found.id;
    // if not found, let caller treat as 404 — but we still mirror BE which throws 404 for explicit bad id
    // this helper is only for fallback when id is undefined; if caller passes bad id we should not fallback
    return requestedId;
  }
  const cash = financeAccounts.find((a) => a.type === "CASH" && a.active);
  if (cash) return cash.id;
  const anyActive = financeAccounts.find((a) => a.active);
  if (anyActive) return anyActive.id;
  // auto-create Cash if none (mirrors BE)
  const newAcc: FinancialAccount = {
    id: nid(),
    name: "Cash",
    type: "CASH",
    openingBalance: 0,
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  financeAccounts.push(newAcc);
  return newAcc.id;
}
