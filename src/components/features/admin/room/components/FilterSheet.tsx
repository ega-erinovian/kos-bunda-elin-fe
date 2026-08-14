import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { FilterOption, FloorFilter, FloorOption } from "../types";
import { statusFilterOptions } from "../constants";

type FilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterStatus: FilterOption;
  filterFloor: FloorFilter;
  floorOptions: FloorOption[];
  onStatusChange: (v: FilterOption) => void;
  onFloorChange: (v: FloorFilter) => void;
  onReset: () => void;
};

export function FilterSheet({
  open,
  onOpenChange,
  filterStatus,
  filterFloor,
  floorOptions,
  onStatusChange,
  onFloorChange,
  onReset,
}: FilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto py-6">
          <section>
            <h3 className="mb-3 text-label-md font-semibold text-on-surface">
              Status Kamar
            </h3>
            <div className="flex flex-wrap gap-2">
              {statusFilterOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => onStatusChange(opt.key)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-label-md transition-colors cursor-pointer",
                    filterStatus === opt.key
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant bg-surface text-on-surface-variant",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-label-md font-semibold text-on-surface">
              Lantai
            </h3>
            <div className="flex flex-wrap gap-2">
              {floorOptions.map((opt) => (
                <button
                  key={String(opt.key)}
                  onClick={() => onFloorChange(opt.key)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-label-md transition-colors cursor-pointer",
                    filterFloor === opt.key
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant bg-surface text-on-surface-variant",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="flex gap-3 border-t border-border pt-4">
          <button
            onClick={onReset}
            className="flex-1 cursor-pointer rounded-lg border border-outline-variant py-3 text-label-md text-on-surface-variant transition-colors"
          >
            Reset
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
