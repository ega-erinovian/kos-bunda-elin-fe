export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="py-12 text-center text-body-md text-on-surface-variant">
      {message ?? "Tidak ada kamar yang ditemukan."}
    </div>
  );
}
