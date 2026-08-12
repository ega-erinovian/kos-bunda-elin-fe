import { LoginForm } from "@/components/features/auth/LoginForm";
import { BrandLogo } from "./components/BrandLogo";
import { FeaturesSection } from "./components/FeaturesSection";

export function AdminLoginPage() {
  return (
    <main className="min-h-dvh bg-surface">
      <div className="grid min-h-dvh lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-primary p-10 text-on-primary lg:flex">
          <BrandLogo variant="sidebar" />
          <FeaturesSection />
          <p className="text-label-md text-on-primary/80">© 2026 Kos Bunda Elin</p>
        </div>

        <div className="w-full flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full">
            <div className="mb-8 w-full lg:hidden">
              <BrandLogo variant="mobile" />
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
