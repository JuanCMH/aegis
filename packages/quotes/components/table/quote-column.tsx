"use client";

import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/aegis/hint";
import { Badge } from "@/components/ui/badge";
import { formatCop } from "@/lib/format-cop";
import { fullDate, fullDateTime } from "@/lib/date-formats";
import type { Doc } from "@/convex/_generated/dataModel";
import { QuoteStatusBadge } from "../quote-status-badge";
import { QuoteActions } from "./quote-actions";

export type QuoteRow = Doc<"quotes"> & {
  documentUrl: string | null;
  /** Resolved client name when the quote is linked. */
  clientName?: string | null;
};

interface ColumnsOptions {
  onConvertToPolicy?: (quote: Doc<"quotes">) => void;
}

const SortHeader = ({
  label,
  column,
}: {
  label: string;
  column: import("@tanstack/react-table").Column<QuoteRow, unknown>;
}) => (
  <Button
    size="sm"
    variant="ghost"
    className="-ml-2 h-7 px-2"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  >
    {label}
    {column.getIsSorted() === "asc" ? (
      <ArrowUp className="ml-1 size-3" />
    ) : column.getIsSorted() === "desc" ? (
      <ArrowDown className="ml-1 size-3" />
    ) : null}
  </Button>
);

export function createQuoteColumns(
  options: ColumnsOptions = {},
): ColumnDef<QuoteRow>[] {
  return [
    {
      accessorKey: "_creationTime",
      meta: { className: "hidden md:table-cell w-[140px]" },
      header: ({ column }) => <SortHeader label="Fecha" column={column} />,
      cell: ({ row }) => (
        <p className="text-xs text-muted-foreground tabular-nums">
          {fullDateTime(new Date(row.getValue("_creationTime")))}
        </p>
      ),
    },
    {
      accessorKey: "quoteNumber",
      meta: { className: "hidden lg:table-cell w-[140px]" },
      header: ({ column }) => <SortHeader label="N°" column={column} />,
      cell: ({ row }) => (
        <p className="text-xs font-medium tabular-nums">
          {row.original.quoteNumber ?? "—"}
        </p>
      ),
    },
    {
      accessorKey: "contractor",
      header: ({ column }) => (
        <SortHeader label="Contratista" column={column} />
      ),
      cell: ({ row }) => (
        <Hint label={row.original.contractor}>
          <p className="max-w-[220px] truncate text-sm font-medium">
            {row.original.contractor || "—"}
          </p>
        </Hint>
      ),
    },
    {
      accessorKey: "contractee",
      meta: { className: "hidden xl:table-cell" },
      header: ({ column }) => (
        <SortHeader label="Contratante" column={column} />
      ),
      cell: ({ row }) => (
        <Hint label={row.original.contractee}>
          <p className="max-w-[200px] truncate text-sm">
            {row.original.contractee || "—"}
          </p>
        </Hint>
      ),
    },
    {
      id: "client",
      meta: { className: "hidden 2xl:table-cell" },
      header: () => <span className="text-xs">Cliente</span>,
      cell: ({ row }) =>
        row.original.clientId ? (
          <Badge variant="outline" className="font-normal">
            {row.original.clientName ?? "Cliente"}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "status",
      meta: { className: "w-[120px]" },
      header: () => <span className="text-xs">Estado</span>,
      cell: ({ row }) => <QuoteStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "quoteType",
      meta: { className: "hidden md:table-cell w-[120px]" },
      header: () => <span className="text-xs">Tipo</span>,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal">
          {row.original.quoteType === "bidBond" ? "Seriedad" : "Cumplimiento"}
        </Badge>
      ),
    },
    {
      accessorKey: "contractValue",
      meta: { className: "hidden lg:table-cell text-right" },
      header: ({ column }) => <SortHeader label="Valor" column={column} />,
      cell: ({ row }) => (
        <p className="text-right text-sm tabular-nums">
          {formatCop(row.original.contractValue)}
        </p>
      ),
    },
    {
      accessorKey: "contractEnd",
      meta: { className: "hidden xl:table-cell w-[120px]" },
      header: ({ column }) => (
        <SortHeader label="Fin contrato" column={column} />
      ),
      cell: ({ row }) => (
        <p className="text-xs tabular-nums">
          {fullDate(new Date(row.original.contractEnd))}
        </p>
      ),
    },
    {
      id: "actions",
      meta: { className: "w-10" },
      header: () => null,
      cell: ({ row }) => (
        <QuoteActions
          id={row.original._id}
          quote={row.original}
          onConvertToPolicy={options.onConvertToPolicy}
        >
          <Button variant="ghost" size="icon-sm" aria-label="Acciones">
            <MoreHorizontal className="size-4" />
          </Button>
        </QuoteActions>
      ),
    },
  ];
}

/** Default columns without convert handler — kept for callers that just need a static set. */
export const columns: ColumnDef<QuoteRow>[] = createQuoteColumns();
