"use client";

import { Hint } from "@/components/aegis/hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { PolicyActions } from "./policy-actions";
import { fullDateTime, shortDate } from "@/lib/date-formats";
import {
  alignClassFor,
  FieldCell,
  SortHeader,
  sortStringValue,
  widthClassFor,
} from "@/packages/template-builder/lib/cell-renderers";
import type { TemplateField } from "@/packages/template-builder/types";
import type { Id } from "@/convex/_generated/dataModel";

export type PolicyRow = {
  _id: Id<"policies">;
  _creationTime: number;
  policyNumber: string;
  status: "active" | "expired" | "canceled" | "pending";
  startDate: number;
  endDate: number;
  clientId?: Id<"clients">;
  data: Record<string, unknown>;
  [key: string]: unknown;
};

const STATUS_LABELS: Record<PolicyRow["status"], string> = {
  active: "Activa",
  expired: "Vencida",
  canceled: "Cancelada",
  pending: "Pendiente",
};

const STATUS_CLASSES: Record<PolicyRow["status"], string> = {
  active: "bg-aegis-emerald/10 text-aegis-emerald border-aegis-emerald/20",
  expired: "bg-aegis-amber/10 text-aegis-amber border-aegis-amber/20",
  canceled: "bg-muted text-muted-foreground border-border/50",
  pending: "bg-aegis-sapphire/10 text-aegis-sapphire border-aegis-sapphire/20",
};

export function PolicyStatusBadge({ status }: { status: PolicyRow["status"] }) {
  return (
    <Badge variant="outline" className={STATUS_CLASSES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

/**
 * Column factory. Builds a column set composed of:
 *  - Fixed leading columns: policyNumber, status, startDate, endDate
 *  - Dynamic columns from the template (only fields with `showInTable: true`,
 *    excluding the four fixed field IDs)
 *  - Trailing column: row actions
 *
 * Mirrors `createClientColumns` but with policy semantics.
 */
export function createPolicyColumns(
  fields: TemplateField[],
): ColumnDef<PolicyRow>[] {
  const dynamicColumns: ColumnDef<PolicyRow>[] = fields.map((field) => {
    const widthClass = widthClassFor(field);
    const alignClass = alignClassFor(field);
    return {
      id: field.id,
      accessorFn: (row) => sortStringValue(field, row.data[field.id]),
      header: ({ column }) => (
        <SortHeader
          column={column}
          align={alignClass === "text-right" ? "end" : "start"}
        >
          {field.label}
        </SortHeader>
      ),
      meta: {
        className: `${widthClass} ${alignClass} hidden md:table-cell`,
      },
      cell: ({ row }) => (
        <FieldCell field={field} raw={row.original.data[field.id]} />
      ),
    } satisfies ColumnDef<PolicyRow>;
  });

  return [...baseLeadingColumns, ...dynamicColumns, actionsColumn];
}

const baseLeadingColumns: ColumnDef<PolicyRow>[] = [
  {
    accessorKey: "policyNumber",
    meta: { className: "min-w-40" },
    header: ({ column }) => <SortHeader column={column}>N° Póliza</SortHeader>,
    cell: ({ row }) => (
      <Hint label={row.getValue("policyNumber")}>
        <p className="truncate font-medium tabular-nums">
          {row.getValue("policyNumber")}
        </p>
      </Hint>
    ),
  },
  {
    accessorKey: "status",
    meta: { className: "w-28" },
    header: ({ column }) => <SortHeader column={column}>Estado</SortHeader>,
    cell: ({ row }) => <PolicyStatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "startDate",
    meta: { className: "w-32 hidden lg:table-cell" },
    header: ({ column }) => <SortHeader column={column}>Inicio</SortHeader>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("startDate"));
      return (
        <Hint label={fullDateTime(date)}>
          <p className="tabular-nums text-muted-foreground">
            {shortDate(date)}
          </p>
        </Hint>
      );
    },
  },
  {
    accessorKey: "endDate",
    meta: { className: "w-32 hidden lg:table-cell" },
    header: ({ column }) => <SortHeader column={column}>Fin</SortHeader>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("endDate"));
      return (
        <Hint label={fullDateTime(date)}>
          <p className="tabular-nums text-muted-foreground">
            {shortDate(date)}
          </p>
        </Hint>
      );
    },
  },
];

const actionsColumn: ColumnDef<PolicyRow> = {
  accessorKey: "actions",
  meta: { className: "w-12" },
  header: "",
  cell: ({ row }) => (
    <PolicyActions id={row.original._id} status={row.original.status}>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="size-4" />
      </Button>
    </PolicyActions>
  ),
};
