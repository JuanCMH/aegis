"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, FileText, Plus, Search, SlidersHorizontal } from "lucide-react";
import {
  type ColumnDef,
  flexRender,
  type SortingState,
  type VisibilityState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { RoleGate } from "@/packages/roles/components/role-gate";
import type { Doc } from "@/convex/_generated/dataModel";
import type { QuoteRow } from "./quote-column";
import { QuoteCard } from "../cards/quote-card";

const COLUMN_LABELS: Record<string, string> = {
  _creationTime: "Fecha",
  quoteNumber: "N° cotización",
  contractor: "Contratista",
  contractee: "Contratante",
  client: "Cliente",
  status: "Estado",
  quoteType: "Tipo",
  contractValue: "Valor",
  contractEnd: "Fin contrato",
};

const TOGGLEABLE_COLUMN_IDS = new Set([
  "_creationTime",
  "quoteNumber",
  "contractee",
  "client",
  "quoteType",
  "contractValue",
  "contractEnd",
]);

const columnsStorageKey = (companyId: string) =>
  `aegis:quotes:columns:${companyId}`;

interface QuoteDataTableProps {
  data: QuoteRow[];
  columns: ColumnDef<QuoteRow>[];
  isLoading: boolean;
  isDone: boolean;
  onLoadMore: () => void;
  /** True if any toolbar/advanced filter (incl. search) is active. */
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onConvertToPolicy?: (quote: Doc<"quotes">) => void;
}

export function QuoteDataTable({
  data,
  columns,
  isLoading,
  isDone,
  onLoadMore,
  hasActiveFilters,
  onClearFilters,
}: QuoteDataTableProps) {
  const router = useRouter();
  const companyId = useCompanyId();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (typeof window === "undefined") return {};
      try {
        const raw = window.localStorage.getItem(columnsStorageKey(companyId));
        return raw ? (JSON.parse(raw) as VisibilityState) : {};
      } catch {
        return {};
      }
    },
  );

  useEffect(() => {
    if (typeof window === "undefined" || !companyId) return;
    try {
      window.localStorage.setItem(
        columnsStorageKey(companyId),
        JSON.stringify(columnVisibility),
      );
    } catch {
      // ignore
    }
  }, [columnVisibility, companyId]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnVisibility },
  });

  const isEmpty = !isLoading && data.length === 0;

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || isDone || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isDone, isLoading, onLoadMore]);

  const toggleableColumns = useMemo(
    () =>
      table
        .getAllLeafColumns()
        .filter((col) => TOGGLEABLE_COLUMN_IDS.has(col.id)),
    [table],
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5">
              <Spinner className="size-3" />
              Cargando…
            </span>
          ) : (
            <span className="tabular-nums">
              {data.length} {data.length === 1 ? "cotización" : "cotizaciones"}
              {!isDone ? "+" : ""}
            </span>
          )}
        </div>

        {toggleableColumns.length > 0 && (
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                >
                  <SlidersHorizontal />
                  Columnas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {toggleableColumns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {COLUMN_LABELS[col.id] ?? col.id}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setColumnVisibility({})}
                  className="text-xs"
                >
                  <Check className="size-3.5" />
                  Restablecer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border border-border/40 bg-card p-3"
              >
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            companyId={companyId}
            onClear={onClearFilters}
          />
        ) : (
          <ul className="space-y-2">
            {data.map((row) => (
              <li key={row._id}>
                <QuoteCard
                  quote={row}
                  href={`/companies/${companyId}/quotes/${row._id}`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-md border border-border/40 bg-card shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/30 hover:bg-muted/30"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        (header.column.columnDef.meta as Record<string, string>)
                          ?.className
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {columns.map((_c, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/companies/${companyId}/quotes/${row.original._id}`,
                      )
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          (cell.column.columnDef.meta as Record<string, string>)
                            ?.className
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState
                      hasActiveFilters={hasActiveFilters}
                      companyId={companyId}
                      onClear={onClearFilters}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!isDone && !isLoading && data.length > 0 && (
        <>
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
            <Spinner className="size-3" />
            <span>Cargando más cotizaciones…</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onLoadMore}
              className="cursor-pointer"
            >
              Cargar más
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({
  hasActiveFilters,
  companyId,
  onClear,
}: {
  hasActiveFilters: boolean;
  companyId: string;
  onClear: () => void;
}) {
  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Search className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Sin resultados</p>
          <p className="text-xs text-muted-foreground">
            Ninguna cotización coincide con los filtros actuales.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onClear}
          className="cursor-pointer"
        >
          Limpiar filtros
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-aegis-sapphire/10 text-aegis-sapphire">
        <FileText className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Aún no hay cotizaciones</p>
        <p className="text-xs text-muted-foreground">
          Crea tu primera cotización para verla aparecer aquí.
        </p>
      </div>
      <RoleGate permission="quotes_create">
        <Button asChild size="sm" className="cursor-pointer">
          <Link href={`/companies/${companyId}/quotes/new`}>
            <Plus />
            Nueva cotización
          </Link>
        </Button>
      </RoleGate>
    </div>
  );
}
