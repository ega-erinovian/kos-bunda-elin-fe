export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "QRIS" | "E_WALLET" | "OTHER";

export interface PaymentRecord {
  id: string;
  pembayaranId: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  amountPaid: number;
  referenceNumber?: string;
  notes?: string;
  financialAccountId?: string;
  createdByAdmin?: {
    id: string;
    nama: string;
  };
  createdAt: string;
}

export interface CreatePaymentRecordInput {
  pembayaranId: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  amountPaid: number;
  referenceNumber?: string;
  notes?: string;
  financialAccountId?: string;
}

export interface AddPaymentResponse {
  paymentRecord: PaymentRecord;
  pembayaran: {
    id: string;
    status: string;
    totalDibayar: number;
    tanggalBayar?: string;
  };
  warning?: "overpaid";
}
