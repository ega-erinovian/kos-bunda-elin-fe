export default interface AdminUser {
  id: string;
  nama: string;
  email: string;
  role: "OWNER" | "STAFF";
}
