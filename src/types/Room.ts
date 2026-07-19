export default interface Room {
  id: string;
  number: string;
  floor: number;
  price: number;
  status: "occupied" | "available" | "maintenance";
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}
