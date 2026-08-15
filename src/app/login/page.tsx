import { AdminLoginPage } from "@/components/features/admin/auth/login/AdminLoginPage";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return <AdminLoginPage reason={reason} />;
}
