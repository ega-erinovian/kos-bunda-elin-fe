export default interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomId: string;
  roomNumber?: string;
  checkInDate: string;
  rentDueDate: number;
  status: "active" | "inactive" | "overdue";
  createdAt: string;
  updatedAt: string;
}
