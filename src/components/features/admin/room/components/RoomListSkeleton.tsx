type RoomListSkeletonProps = {
  variant?: "mobile" | "desktop";
};

export function RoomListSkeleton({ variant = "mobile" }: RoomListSkeletonProps) {
  const rows = Array.from({ length: 3 }, (_, i) => i);

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-4 pb-4">
        {rows.map((i) => (
          <div
            key={i}
            className="animate-pulse space-y-3 rounded-2xl border border-border/30 bg-surface p-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-5 w-28 rounded bg-surface-container-highest" />
                <div className="h-4 w-20 rounded bg-surface-container-highest" />
              </div>
              <div className="h-6 w-16 rounded-full bg-surface-container-highest" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-surface-container-highest" />
              <div className="h-4 w-24 rounded bg-surface-container-highest" />
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-surface-container-highest" />
                <div className="h-5 w-20 rounded bg-surface-container-highest" />
              </div>
              <div className="h-8 w-8 rounded-full bg-surface-container-highest" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      {rows.map((i) => (
        <div
          key={i}
          className="flex flex-col gap-4 border-t border-border/30 px-6 py-4 md:flex-row md:items-center md:gap-0"
        >
          <div className="flex flex-2 items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-surface-container-highest" />
            <div className="h-4 w-20 rounded bg-surface-container-highest" />
          </div>
          <div className="h-4 w-28 rounded bg-surface-container-highest md:flex-1" />
          <div className="h-4 w-16 rounded bg-surface-container-highest md:flex-1" />
          <div className="h-4 w-24 rounded bg-surface-container-highest md:flex-1" />
          <div className="h-6 w-20 rounded-full bg-surface-container-highest md:flex-[1.5]" />
        </div>
      ))}
    </div>
  );
}
