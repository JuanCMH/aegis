"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, UserCircle, X } from "lucide-react";
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
import { usePaginatedClients } from "@/packages/clients/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface ClientPickerProps {
  /** Currently selected clientId, or undefined for "no client". */
  value?: Id<"clients">;
  onChange: (id: Id<"clients"> | undefined) => void;
  readOnly?: boolean;
  /** Optional pre-resolved label for the selected client (avoids re-fetching). */
  selectedLabel?: string;
  selectedSubLabel?: string;
}

/**
 * Selector de cliente para el header del formulario de pólizas. No es un
 * `TemplateField` porque `policies.clientId` es una columna indexada de
 * primer nivel (relación), no parte del payload dinámico `data`.
 */
export function ClientPicker({
  value,
  onChange,
  readOnly,
  selectedLabel,
  selectedSubLabel,
}: ClientPickerProps) {
  const companyId = useCompanyId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { results, status } = usePaginatedClients(
    companyId,
    debouncedSearch || undefined,
  );
  const isLoading = status === "LoadingFirstPage";

  // Find the selected client in results to expose name/id (if no label was passed in)
  const selected = useMemo(() => {
    if (!value) return null;
    return (results ?? []).find((r) => r._id === value) ?? null;
  }, [results, value]);

  const displayLabel = selectedLabel ?? selected?.name ?? null;
  const displaySubLabel =
    selectedSubLabel ?? selected?.identificationNumber ?? null;

  useEffect(() => {
    if (open) {
      // Focus the search input when popover opens
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
            displayLabel ? `Cliente: ${displayLabel}` : "Seleccionar cliente"
          }
        >
          <span className="flex min-w-0 items-center gap-2">
            <UserCircle className="size-4 shrink-0 text-muted-foreground" />
            {displayLabel ? (
              <span className="flex min-w-0 flex-col items-start leading-tight">
                <span className="truncate text-sm">{displayLabel}</span>
                {displaySubLabel && (
                  <span className="truncate text-[10px] tabular-nums text-muted-foreground">
                    {displaySubLabel}
                  </span>
                )}
              </span>
            ) : (
              <span className="truncate text-sm text-muted-foreground">
                Sin cliente
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
                aria-label="Quitar cliente"
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
        className="w-[--radix-popover-trigger-width] p-0"
      >
        <div className="relative border-b border-border/40">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o identificación…"
            className="h-9 rounded-none border-0 pl-8 pr-2 shadow-none focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="h-64">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
              <Spinner className="size-3" />
              Cargando clientes…
            </div>
          ) : (results ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
              <UserCircle className="size-6 text-muted-foreground/60" />
              <p className="text-xs font-medium">Sin resultados</p>
              <p className="text-[11px] text-muted-foreground">
                {search ? "Prueba otro término" : "No hay clientes registrados"}
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
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-aegis-sapphire/10 text-[10px] font-medium text-aegis-sapphire">
                        {row.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="truncate text-sm">{row.name}</span>
                        <span className="truncate text-[10px] tabular-nums text-muted-foreground">
                          {row.identificationNumber}
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
