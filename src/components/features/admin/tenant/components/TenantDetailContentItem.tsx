type TenantDetailContentItemProps = {
  label: string;
  value: string;
  showDivider?: boolean;
};

export function TenantDetailContentItem({
  label,
  value,
  showDivider = false,
}: TenantDetailContentItemProps) {
  return (
    <>
      {showDivider && <hr className="border-outline-variant/30" />}
      <div className="flex items-center justify-between">
        <span className="text-label-md text-on-surface-variant">{label}</span>
        <span className="text-body-md text-on-surface">{value}</span>
      </div>
    </>
  );
}
