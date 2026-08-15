import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  children?: ReactNode;
};

export function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-heading text-heading-md text-on-surface">{title}</h2>
      {children}
    </div>
  );
}
