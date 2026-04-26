"use client";

import {
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Check,
  ChevronRight,
  FileCheck2,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
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
import { fullDateTime, shortDate } from "@/lib/date-formats";
import { PolicyStatusBadge } from "./policy-columns";
import type { TemplateField, TemplateSection } from "@/packages/policies/types";
import type { PolicyRow } from "./policy-columns";

type PolicyStatus = PolicyRow["status"];
type StatusFilter = "all" | PolicyStatus;

const columnsStorageKey = (companyId: string) =>
  `aegis:policies:columns:${companyId}`;

interface PolicyDataTableProps {
  data: PolicyRow[];
  columns: ColumnDef<PolicyRow>[];
  fields: TemplateField[];
  sections: TemplateSection[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  isDone: boolean;
  onLoadMore: () => void;
  hasTemplate: boolean;
}

function formatFieldValue(field: TemplateField, value: unknown): string {
  if (value == null || value === "") return "";
  if (field.type === "switch") return value ? "Sí" : "No";
  if (field.type === "select") {
    const opt = field.config.options?.find((o) => o.value === value);
    return opt?.label ?? String(value);
  }
  if (field.type === "date" && typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : fullDateTime(d);
  }
  if (field.type === "file" || field.type === "image") {
    return typeof value === "string" && value ? "Cargado" : "Sin archivo";
  }
  return String(value);
}

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "active", label: "Activas" },
  { id: "pending", label: "Pendientes" },
  { id: "expired", label: "Vencidas" },
  { id: "canceled", label: "Canceladas" },
];

export function PolicyDataTable({
  data,
  columns,
  fields,
  isLoading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isDone,
  onLoadMore,
  hasTemplate,
}: PolicyDataTableProps) {
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

  const cardFields = useMemo(() => fields.slice(0, 2), [fields]);
  const isEmpty = !isLoading && data.length === 0;
  const hasSearch = search.trim().length > 0;
  const hasFilter = statusFilter !== "all";

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // "/" focuses the search input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        target?.isContentEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
      ) {
        return;
      }
      e.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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

  const toggleableColumns = table
    .getAllLeafColumns()
    .filter((col) => fields.some((f) => f.id === col.id));

  return (
    <div className="flex flex-1 min-h-0 flex-col px-4 py-4 lg:px-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar por número de póliza…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-12"
          />
          {hasSearch ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center rounded border border-border/60 bg-muted/40 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              /
            </kbd>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Status segmented control */}
          <div className="inline-flex items-center rounded-md border border-border/60 bg-card p-0.5">
            {STATUS_OPTIONS.map((opt) => {
              const active = statusFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onStatusFilterChange(opt.id)}
                  className={`cursor-pointer rounded-sm px-2.5 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {/* Columns dropdown (desktop only) */}
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
                  {toggleableColumns.map((col) => {
                    const field = fields.find((f) => f.id === col.id);
                    return (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        checked={col.getIsVisible()}
                        onCheckedChange={(value) =>
                          col.toggleVisibility(!!value)
                        }
                        onSelect={(e) => e.preventDefault()}
                      >
                        {field?.label ?? col.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
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
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground lg:ml-2">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <Spinner className="size-3" />
                Cargando…
              </span>
            ) : (
              <span className="tabular-nums">
                {data.length} {data.length === 1 ? "póliza" : "pólizas"}
                {!isDone ? "+" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
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
            hasSearch={hasSearch}
            hasFilter={hasFilter}
            hasTemplate={hasTemplate}
            companyId={companyId}
            onClear={() => {
              onSearchChange("");
              onStatusFilterChange("all");
            }}
          />
        ) : (
          <ul className="space-y-2">
            {data.map((row) => (
              <li key={row._id}>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/companies/${companyId}/policies/${row._id}`)
                  }
                  className="group flex w-full items-center gap-3 rounded-md border border-border/40 bg-card p-3 text-left transition hover:border-border hover:bg-accent/40"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aegis-sapphire/10 text-sm font-medium text-aegis-sapphire">
                    <FileCheck2 className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium tabular-nums">
                        {row.policyNumber}
                      </p>
                      <PolicyStatusBadge status={row.status} />
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>
                        <span className="opacity-70">Inicio:</span>{" "}
                        <span className="tabular-nums">
                          {shortDate(new Date(row.startDate))}
                        </span>
                      </span>
                      <span>
                        <span className="opacity-70">Fin:</span>{" "}
                        <span className="tabular-nums">
                          {shortDate(new Date(row.endDate))}
                        </span>
                      </span>
                    </div>
                    {cardFields.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {cardFields.map((f) => {
                          const val = formatFieldValue(f, row.data[f.id]);
                          if (!val) return null;
                          return (
                            <span key={f.id} className="truncate">
                              <span className="opacity-70">{f.label}:</span>{" "}
                              <span className="text-foreground/80">{val}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Desktop: table */}
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
                        `/companies/${companyId}/policies/${row.original._id}`,
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
                      hasSearch={hasSearch}
                      hasFilter={hasFilter}
                      hasTemplate={hasTemplate}
                      companyId={companyId}
                      onClear={() => {
                        onSearchChange("");
                        onStatusFilterChange("all");
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Auto-load sentinel + manual fallback */}
      {!isDone && !isLoading && data.length > 0 && (
        <>
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          <div className="flex items-center justify-center gap-2 pt-3 text-xs text-muted-foreground">
            <Spinner className="size-3" />
            <span>Cargando más pólizas…</span>
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
  hasSearch,
  hasFilter,
  hasTemplate,
  companyId,
  onClear,
}: {
  hasSearch: boolean;
  hasFilter: boolean;
  hasTemplate: boolean;
  companyId: string;
  onClear: () => void;
}) {
  if (hasSearch || hasFilter) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Search className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Sin resultados</p>
          <p className="text-xs text-muted-foreground">
            {hasSearch
              ? "No encontramos pólizas que coincidan con tu búsqueda."
              : "Ninguna póliza coincide con el filtro actual."}
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
        <FileCheck2 className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Aún no hay pólizas</p>
        <p className="text-xs text-muted-foreground">
          {hasTemplate
            ? "Crea tu primera póliza para verla aparecer aquí."
            : "Configura la plantilla y empieza a registrar pólizas."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <RoleGate permission="policies_create">
          <Button asChild size="sm" className="cursor-pointer">
            <Link href={`/companies/${companyId}/policies/new`}>
              <Plus />
              Crear póliza
            </Link>
          </Button>
        </RoleGate>
        {!hasTemplate && (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="cursor-pointer"
          >
            <Link href={`/companies/${companyId}/settings/policy-template`}>
              <Settings2 />
              Configurar plantilla
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
