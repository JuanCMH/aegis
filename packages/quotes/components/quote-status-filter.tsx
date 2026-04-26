"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuoteStatus } from "../types";
import { QUOTE_STATUS_ORDER, getQuoteStatusMeta } from "../lib/quote-status-meta";

interface QuoteStatusFilterProps {
  /** Selected status, or `undefined` for "Todas". */
  value: QuoteStatus | undefined;
  onChange: (value: QuoteStatus | undefined) => void;
  /** Optional counts per status (from `getCompanyStats`) to show as superscript. */
  counts?: Partial<Record<QuoteStatus, number>>;
  className?: string;
}

/**
 * Segmented filter mostrando "Todas" + cada estado de cotización. Pensado
 * para el header del listado.
 */
export function QuoteStatusFilter({
  value,
  onChange,
  counts,
  className,
}: QuoteStatusFilterProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Filtrar por estado"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border bg-muted/40 p-0.5",
        className,
      )}
    >
      <FilterChip
        active={value === undefined}
        onClick={() => onChange(undefined)}
      >
        Todas
      </FilterChip>
      {QUOTE_STATUS_ORDER.map((status) => {
        const meta = getQuoteStatusMeta(status);
        const count = counts?.[status];
        return (
          <FilterChip
            key={status}
            active={value === status}
            onClick={() => onChange(value === status ? undefined : status)}
            dotClass={meta.dotClass}
          >
            <span className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
              {meta.label}
              {typeof count === "number" && count > 0 && (
                <span className="ml-0.5 rounded-full bg-background/60 px-1 text-[10px] tabular-nums text-muted-foreground">
                  {count}
                </span>
              )}
            </span>
          </FilterChip>
        );
      })}
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dotClass?: string;
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <Button
      type="button"
      role="radio"
      aria-checked={active}
      size="sm"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-7 rounded-sm px-2.5 text-xs font-medium transition",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
      )}
    >
      {children}
    </Button>
  );
}
