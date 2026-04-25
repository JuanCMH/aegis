"use client";

import {
  ColumnDef,
  flexRender,
  SortingState,
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
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Search, X, Users, Plus, ChevronRight, Settings2 } from "lucide-react";
import Link from "next/link";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { RoleGate } from "@/packages/roles/components/role-gate";
import { fullDateTime } from "@/lib/date-formats";
import type { TemplateField } from "@/packages/clients/types";
import type { ClientRow } from "./client-columns";

interface ClientDataTableProps {
  data: ClientRow[];
  columns: ColumnDef<ClientRow>[];
  fields: TemplateField[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
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

export function ClientDataTable({
  data,
  columns,
  fields,
  isLoading,
  search,
  onSearchChange,
  isDone,
  onLoadMore,
  hasTemplate,
}: ClientDataTableProps) {
  const router = useRouter();
  const companyId = useCompanyId();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  const cardFields = useMemo(() => fields.slice(0, 2), [fields]);
  const isEmpty = !isLoading && data.length === 0;
  const hasSearch = search.trim().length > 0;

  return (
    <div className="flex flex-1 min-h-0 flex-col px-4 py-4 lg:px-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o identificación…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-8"
          />
          {hasSearch && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5">
              <Spinner className="size-3" />
              Cargando…
            </span>
          ) : (
            <span className="tabular-nums">
              {data.length} {data.length === 1 ? "cliente" : "clientes"}
              {!isDone ? "+" : ""}
            </span>
          )}
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
            hasTemplate={hasTemplate}
            companyId={companyId}
            onClear={() => onSearchChange("")}
          />
        ) : (
          <ul className="space-y-2">
            {data.map((row) => (
              <li key={row._id}>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/companies/${companyId}/clients/${row._id}`)
                  }
                  className="group flex w-full items-center gap-3 rounded-md border border-border/40 bg-card p-3 text-left transition hover:border-border hover:bg-accent/40"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aegis-sapphire/10 text-sm font-medium text-aegis-sapphire">
                    {row.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {row.name || "Sin nombre"}
                      </p>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {row.identificationNumber}
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
                        `/companies/${companyId}/clients/${row.original._id}`,
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
                      hasTemplate={hasTemplate}
                      companyId={companyId}
                      onClear={() => onSearchChange("")}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!isDone && !isLoading && data.length > 0 && (
        <div className="flex items-center justify-center pt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onLoadMore}
            className="cursor-pointer"
          >
            Cargar más
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  hasSearch,
  hasTemplate,
  companyId,
  onClear,
}: {
  hasSearch: boolean;
  hasTemplate: boolean;
  companyId: string;
  onClear: () => void;
}) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Search className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Sin resultados</p>
          <p className="text-xs text-muted-foreground">
            No encontramos clientes que coincidan con tu búsqueda.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onClear}
          className="cursor-pointer"
        >
          Limpiar búsqueda
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-aegis-sapphire/10 text-aegis-sapphire">
        <Users className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Aún no hay clientes</p>
        <p className="text-xs text-muted-foreground">
          {hasTemplate
            ? "Crea tu primer cliente para verlo aparecer aquí."
            : "Configura la plantilla y empieza a registrar clientes."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <RoleGate permission="clients_create">
          <Button asChild size="sm" className="cursor-pointer">
            <Link href={`/companies/${companyId}/clients/new`}>
              <Plus />
              Crear cliente
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
            <Link href={`/companies/${companyId}/settings/client-template`}>
              <Settings2 />
              Configurar plantilla
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
