export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "tenant";
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  price: number;
  status: "occupied" | "available" | "maintenance";
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
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

export interface Payment {
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

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PushSubscriptionBody {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
