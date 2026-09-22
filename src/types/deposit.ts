export type DepositStatus = "HELD" | "PARTIALLY_REFUNDED" | "REFUNDED" | "FORFEITED";

export interface Deposit {
  id: string;
  penyewaId: string;
  amountReceived: number;
  receivedDate: string;
  deductionAmount: number;
  deductionReason?: string;
  refundAmount?: number;
  refundDate?: string;
  status: DepositStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReceiveDepositInput {
  penyewaId: string;
  amountReceived: number;
  receivedDate: string;
}

export interface DeductDepositInput {
  deductionAmount: number;
  deductionReason: string;
}

export interface RefundDepositInput {
  refundAmount: number;
  refundDate: string;
}

export interface DepositListParams {
  penyewaId?: string;
  status?: DepositStatus;
}

export interface DepositListResponse {
  success: boolean;
  data: Deposit[];
}

export interface DepositSingleResponse {
  success: boolean;
  data: Deposit;
}
