"use client";

import { Hint } from "@/components/aegis/hint";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ClientActions } from "./client-actions";
import { fullDateTime, shortDate } from "@/lib/date-formats";
import {
  alignClassFor,
  FieldCell,
  SortHeader,
  sortStringValue,
  widthClassFor,
} from "@/packages/template-builder/lib/cell-renderers";
import type { TemplateField } from "@/packages/template-builder/types";

export type ClientRow = {
  _id: string;
  _creationTime: number;
  name: string;
  identificationNumber: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
};

// --- column factory --------------------------------------------------------
// Helpers (widthClassFor, alignClassFor, sortStringValue, SortHeader, FieldCell)
// viven en `packages/template-builder/lib/cell-renderers` para que policies y
// otros módulos puedan reutilizarlos.

export function createClientColumns(
  fields: TemplateField[],
): ColumnDef<ClientRow>[] {
  const dynamicColumns: ColumnDef<ClientRow>[] = fields.map((field) => {
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
    } satisfies ColumnDef<ClientRow>;
  });

  return [
    baseColumns[0],
    baseColumns[1],
    ...dynamicColumns,
    baseColumns[2],
    baseColumns[3],
  ];
}

export const baseColumns: ColumnDef<ClientRow>[] = [
  {
    accessorKey: "name",
    meta: { className: "min-w-48" },
    header: ({ column }) => <SortHeader column={column}>Nombre</SortHeader>,
    cell: ({ row }) => (
      <Hint label={row.getValue("name")}>
        <p className="truncate font-medium">{row.getValue("name")}</p>
      </Hint>
    ),
  },
  {
    accessorKey: "identificationNumber",
    meta: { className: "w-36" },
    header: ({ column }) => (
      <SortHeader column={column}>Identificación</SortHeader>
    ),
    cell: ({ row }) => (
      <p className="tabular-nums text-muted-foreground">
        {row.getValue("identificationNumber")}
      </p>
    ),
  },
  {
    accessorKey: "_creationTime",
    meta: { className: "w-32 hidden lg:table-cell" },
    header: ({ column }) => <SortHeader column={column}>Creado</SortHeader>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("_creationTime"));
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
    accessorKey: "actions",
    meta: { className: "w-12" },
    header: "",
    cell: ({ row }) => (
      <ClientActions id={row.original._id}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </ClientActions>
    ),
  },
];
