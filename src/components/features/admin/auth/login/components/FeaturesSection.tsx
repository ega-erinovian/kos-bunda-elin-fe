import { Bell, CalendarCheck, HousePlug } from "lucide-react";

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

export function FeaturesSection() {
  return (
    <div className="space-y-8">
      <h2 className="font-heading text-heading-lg font-bold">Kelola kos Anda dari satu tempat.</h2>
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
  );
}
