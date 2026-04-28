"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, ShieldCheck, X } from "lucide-react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/components/hooks/use-debounce";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface PolicyLinkPickerProps {
  value?: Id<"policies">;
  onChange: (id: Id<"policies"> | undefined) => void;
  readOnly?: boolean;
  selectedLabel?: string;
  selectedSubLabel?: string;
}

/**
 * Selector de póliza para vincular cotizaciones a pólizas existentes. Búsqueda
 * por número de póliza con search index `search_policyNumber`. No carga datos
 * por defecto: solo dispara la query cuando hay un término ingresado.
 */
export function PolicyLinkPicker({
  value,
  onChange,
  readOnly,
  selectedLabel,
  selectedSubLabel,
}: PolicyLinkPickerProps) {
  const companyId = useCompanyId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const trimmed = debouncedSearch.trim();
  const { results, status } = usePaginatedQuery(
    api.policies.getByCompany,
    trimmed ? { companyId, search: trimmed } : "skip",
    { initialNumItems: 25 },
  );
  const isLoading = trimmed.length > 0 && status === "LoadingFirstPage";
  const showHint = trimmed.length === 0;

  const selectedFromQuery = useQuery(
    api.policies.getById,
    value ? { id: value } : "skip",
  );

  const selected = useMemo(() => {
    if (!value) return null;
    const found = (results ?? []).find((r) => r._id === value);
    return found ?? selectedFromQuery ?? null;
  }, [results, value, selectedFromQuery]);

  const displayLabel = selectedLabel ?? selected?.policyNumber ?? null;
  const displaySubLabel =
    selectedSubLabel ?? (selected ? selected.status : null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setSearch("");
    }
  }, [open]);

  return (
    <Popover open={readOnly ? false : open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={readOnly}
          className={cn(
            "h-9 w-full justify-between gap-2 px-3 text-left font-normal",
            readOnly && "cursor-default opacity-100",
          )}
          aria-label={
            displayLabel ? `Póliza: ${displayLabel}` : "Seleccionar póliza"
          }
        >
          <span className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
            {displayLabel ? (
              <span className="flex min-w-0 flex-col items-start leading-tight">
                <span className="truncate text-sm tabular-nums font-mono">
                  {displayLabel}
                </span>
                {displaySubLabel && (
                  <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                    {displaySubLabel}
                  </span>
                )}
              </span>
            ) : (
              <span className="truncate text-sm text-muted-foreground">
                Sin póliza
              </span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {value && !readOnly && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(undefined);
                  }
                }}
                className="cursor-pointer rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Quitar póliza"
              >
                <X className="size-3.5" />
              </span>
            )}
            {!readOnly && (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <div className="relative border-b border-border/40">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número de póliza…"
            className="h-9 rounded-none border-0 pl-8 pr-2 shadow-none focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="h-64">
          {showHint ? (
            <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
              <Search className="size-5 text-muted-foreground/60" />
              <p className="text-xs font-medium">Empieza a buscar</p>
              <p className="text-[11px] text-muted-foreground">
                Escribe el número de póliza
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
              <Spinner className="size-3" />
              Buscando…
            </div>
          ) : (results ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
              <ShieldCheck className="size-6 text-muted-foreground/60" />
              <p className="text-xs font-medium">Sin resultados</p>
              <p className="text-[11px] text-muted-foreground">
                Prueba otro término
              </p>
            </div>
          ) : (
            <ul className="py-1">
              {(results ?? []).map((row) => {
                const active = row._id === value;
                return (
                  <li key={row._id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(row._id);
                        setOpen(false);
                      }}
                      className={cn(
                        "group flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition hover:bg-accent/40",
                        active && "bg-accent/30",
                      )}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-aegis-sapphire/10 text-aegis-sapphire">
                        <ShieldCheck className="size-3.5" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="truncate text-sm tabular-nums font-mono">
                          {row.policyNumber}
                        </span>
                        <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                          {row.status}
                        </span>
                      </span>
                      {active && (
                        <Check className="size-3.5 shrink-0 text-aegis-sapphire" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
