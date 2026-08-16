type MobileTenantCardActiveBadgeProps = {
  aktif: boolean;
};

export function MobileTenantCardActiveBadge({ aktif }: MobileTenantCardActiveBadgeProps) {
  return (
    <span
      className={`shrink-0 flex gap-1.5 items-center rounded-full px-2.5 py-1 text-label-sm w-fit ${
        aktif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}
    >
      <div className={`h-2 w-2 rounded-full ${aktif ? "bg-green-700" : "bg-red-600"}`} />
      {aktif ? "Aktif" : "Tidak Aktif"}
    </span>
  );
}
