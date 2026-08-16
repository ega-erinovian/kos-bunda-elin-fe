import { AlertTriangle, RefreshCw } from "lucide-react";

type RoomListErrorProps = {
  onRetry: () => void;
  title?: string;
};

export function RoomListError({ onRetry, title = "Gagal memuat data kamar" }: RoomListErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <p className="text-body-md font-semibold text-on-surface">{title}</p>
        <p className="mt-1 text-label-sm text-on-surface-variant">
          Periksa koneksi internet kamu dan coba lagi.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-label-md text-on-primary transition-colors hover:bg-primary/90"
      >
        <RefreshCw className="h-4 w-4" />
        Coba Lagi
      </button>
    </div>
  );
}
