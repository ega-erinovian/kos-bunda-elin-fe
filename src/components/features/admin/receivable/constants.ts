import type { AgingLabel } from "@/types";

export const AGING_BUCKET_ORDER: AgingLabel[] = ["current", "1-30", "31-60", "61-90", "90+"];

export const AGING_BUCKET_LABELS: Record<AgingLabel, string> = {
  current: "Belum jatuh tempo",
  "1-30": "1–30 hari",
  "31-60": "31–60 hari",
  "61-90": "61–90 hari",
  "90+": ">90 hari",
};

// ponytail: neutral → error severity ramp from existing tokens; revisit if DESIGN.md adds chart tokens
export const AGING_BUCKET_FILLS: Record<AgingLabel, string> = {
  current: "var(--color-surface-container-highest)",
  "1-30": "var(--color-secondary-fixed-dim)",
  "31-60": "var(--color-tertiary-container)",
  "61-90": "var(--color-tertiary)",
  "90+": "var(--color-error)",
};
