export default interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "tenant";
  adminRole?: "OWNER" | "STAFF";
}
