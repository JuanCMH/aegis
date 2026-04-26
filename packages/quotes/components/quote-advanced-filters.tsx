"use client";

import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { MonthPicker } from "@/components/aegis/month-picker";
import { DatePicker } from "@/components/aegis/date-picker";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type {
  QuoteAdvancedFilterState,
  QuotePeriodMode,
  QuoteType,
} from "../types";
import { ClientLinkPicker } from "./client-link-picker";

interface QuoteAdvancedFiltersProps {
  value: QuoteAdvancedFilterState;
  onChange: (next: QuoteAdvancedFilterState) => void;
}

const EMPTY: QuoteAdvancedFilterState = { periodMode: "all" };

const countActive = (state: QuoteAdvancedFilterState): number => {
  let n = 0;
  if (state.periodMode === "month" && state.month) n += 1;
  if (
    state.periodMode === "range" &&
    (state.rangeFrom !== undefined || state.rangeTo !== undefined)
  )
    n += 1;
  if (state.clientId) n += 1;
  if (state.quoteType) n += 1;
  return n;
};

/**
 * Botón [Filtros ▾] con popover. Mantiene estado interno hasta que el usuario
 * confirma con `Aplicar`, momento en que dispara `onChange`. `Limpiar` resetea
 * el estado interno (también notificable con Aplicar).
 */
export function QuoteAdvancedFilters({
  value,
  onChange,
}: QuoteAdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<QuoteAdvancedFilterState>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const activeCount = countActive(value);

  const apply = () => {
    onChange(draft);
    setOpen(false);
  };

  const clear = () => {
    setDraft(EMPTY);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-9 gap-2">
          <Filter className="size-3.5" />
          Filtros
          {activeCount > 0 && (
            <span
              aria-label={`${activeCount} filtros activos`}
              className="flex size-4 items-center justify-center rounded-full bg-aegis-sapphire text-[10px] font-semibold text-white"
            >
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <header className="flex items-center justify-between px-3 py-2">
          <h4 className="text-sm font-semibold">Filtros avanzados</h4>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="size-3.5" />
          </button>
        </header>
        <Separator />
        <div className="space-y-4 p-3">
          {/* Período */}
          <section className="space-y-2">
            <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Período
            </Label>
            <Tabs
              value={draft.periodMode}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  periodMode: v as QuotePeriodMode,
                  // reset period inputs when switching mode
                  ...(v !== "month" ? { month: undefined } : {}),
                  ...(v !== "range"
                    ? { rangeFrom: undefined, rangeTo: undefined }
                    : {}),
                }))
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="month">Mes</TabsTrigger>
                <TabsTrigger value="range">Rango</TabsTrigger>
                <TabsTrigger value="all">Todo</TabsTrigger>
              </TabsList>
              <TabsContent value="month" className="mt-2">
                <MonthPicker
                  value={draft.month}
                  onChange={(month) => setDraft((d) => ({ ...d, month }))}
                />
              </TabsContent>
              <TabsContent
                value="range"
                className="mt-2 grid grid-cols-2 gap-2"
              >
                <DatePicker
                  date={
                    draft.rangeFrom !== undefined
                      ? new Date(draft.rangeFrom)
                      : undefined
                  }
                  onSelect={(date) =>
                    setDraft((d) => ({
                      ...d,
                      rangeFrom: date ? date.getTime() : undefined,
                    }))
                  }
                  placeholder="Desde"
                />
                <DatePicker
                  date={
                    draft.rangeTo !== undefined
                      ? new Date(draft.rangeTo)
                      : undefined
                  }
                  onSelect={(date) =>
                    setDraft((d) => ({
                      ...d,
                      rangeTo: date ? date.getTime() : undefined,
                    }))
                  }
                  placeholder="Hasta"
                />
              </TabsContent>
              <TabsContent value="all" className="mt-2">
                <p className="text-xs text-muted-foreground">
                  Sin filtro de fechas.
                </p>
              </TabsContent>
            </Tabs>
          </section>

          {/* Cliente */}
          <section className="space-y-2">
            <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Cliente vinculado
            </Label>
            <ClientLinkPicker
              value={draft.clientId}
              onChange={(id: Id<"clients"> | undefined) =>
                setDraft((d) => ({ ...d, clientId: id }))
              }
            />
          </section>

          {/* Tipo */}
          <section className="space-y-2">
            <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Tipo de cotización
            </Label>
            <div className="flex gap-1.5">
              <TypeChip
                active={draft.quoteType === undefined}
                onClick={() =>
                  setDraft((d) => ({ ...d, quoteType: undefined }))
                }
              >
                Todas
              </TypeChip>
              <TypeChip
                active={draft.quoteType === "bidBond"}
                onClick={() =>
                  setDraft((d) => ({ ...d, quoteType: "bidBond" }))
                }
              >
                Seriedad
              </TypeChip>
              <TypeChip
                active={draft.quoteType === "performanceBonds"}
                onClick={() =>
                  setDraft((d) => ({ ...d, quoteType: "performanceBonds" }))
                }
              >
                Cumplimiento
              </TypeChip>
            </div>
          </section>
        </div>
        <Separator />
        <footer className="flex items-center justify-between gap-2 px-3 py-2">
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            Limpiar
          </Button>
          <Button type="button" size="sm" onClick={apply}>
            Aplicar
          </Button>
        </footer>
      </PopoverContent>
    </Popover>
  );
}

interface TypeChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TypeChip({ active, onClick, children }: TypeChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7 rounded-full border px-3 text-xs font-medium transition",
        active
          ? "border-aegis-sapphire bg-aegis-sapphire/10 text-aegis-sapphire"
          : "border-border bg-background text-muted-foreground hover:bg-muted/60",
      )}
    >
      {children}
    </button>
  );
}

export const isAdvancedFilterEmpty = (state: QuoteAdvancedFilterState) =>
  countActive(state) === 0;

export { countActive as countActiveQuoteFilters };

// Helper for consumers: convert filter state into searchByCompany args fragment.
export function advancedFiltersToQueryArgs(state: QuoteAdvancedFilterState): {
  dateFrom?: number;
  dateTo?: number;
  clientId?: Id<"clients">;
  quoteType?: QuoteType;
} {
  const out: ReturnType<typeof advancedFiltersToQueryArgs> = {};
  if (state.periodMode === "month" && state.month) {
    const [yearStr, monthStr] = state.month.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    out.dateFrom = Date.UTC(year, month - 1, 1);
    out.dateTo = Date.UTC(year, month, 1);
  } else if (state.periodMode === "range") {
    out.dateFrom = state.rangeFrom;
    out.dateTo = state.rangeTo;
  }
  if (state.clientId) out.clientId = state.clientId;
  if (state.quoteType) out.quoteType = state.quoteType;
  return out;
}
