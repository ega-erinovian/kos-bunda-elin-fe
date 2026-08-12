import { Home } from "lucide-react";

type BrandLogoVariant = "sidebar" | "mobile";

interface BrandLogoProps {
  variant: BrandLogoVariant;
}

export function BrandLogo({ variant }: BrandLogoProps) {
  if (variant === "mobile") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary">
          <Home className="h-7 w-7" />
        </span>
        <div>
          <p className="font-heading text-heading-md font-bold text-on-surface">Kos Bunda Elin</p>
          <p className="text-label-md text-on-surface-variant">Sistem Manajemen Kos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-on-primary/15">
        <Home className="h-6 w-6" />
      </span>
      <div>
        <p className="font-heading text-lg font-bold">Kos Bunda Elin</p>
        <p className="text-label-md text-on-primary/80">Sistem Manajemen Kos</p>
      </div>
    </div>
  );
}
