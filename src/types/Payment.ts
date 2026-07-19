export default interface Payment {
  id: string;
  tenantId: string;
  tenantName?: string;
  roomNumber?: string;
  amount: number;
  month: number;
  year: number;
  status: "paid" | "pending" | "late" | "partial";
  paidAt?: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
