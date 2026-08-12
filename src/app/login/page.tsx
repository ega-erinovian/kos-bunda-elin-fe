import { Bell, CalendarCheck, Home, HousePlug } from "lucide-react";
import { LoginForm } from "@/components/features/admin/login-form";

const features = [
  {
    icon: HousePlug,
    title: "Kelola kamar & penghuni",
    description: "Pantau status kamar dan data penghuni setiap lantai.",
  },
  {
    icon: CalendarCheck,
    title: "Rekam pembayaran sewa",
    description: "Catat pembayaran bulanan kos dari satu tempat.",
  },
  {
    icon: Bell,
    title: "Pengingat otomatis",
    description: "Terima notifikasi jatuh tempo pembayaran.",
  },
];

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-surface">
      <div className="grid min-h-dvh lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-primary p-10 text-on-primary lg:flex">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-on-primary/15">
              <Home className="h-6 w-6" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold">Kos Bunda Elin</p>
              <p className="text-label-md text-on-primary/80">Sistem Manajemen Kos</p>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="font-heading text-heading-lg font-bold">
              Kelola kos Anda dari satu tempat.
            </h2>
            <ul className="space-y-5">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-on-primary/15">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-heading text-body-lg font-semibold">{feature.title}</p>
                      <p className="text-body-md text-on-primary/80">{feature.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="text-label-md text-on-primary/80">© 2026 Kos Bunda Elin</p>
        </div>

        <div className="w-full flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full">
            <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden w-full">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary">
                <Home className="h-7 w-7" />
              </span>
              <div>
                <p className="font-heading text-heading-md font-bold text-on-surface">
                  Kos Bunda Elin
                </p>
                <p className="text-label-md text-on-surface-variant">Sistem Manajemen Kos</p>
              </div>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
