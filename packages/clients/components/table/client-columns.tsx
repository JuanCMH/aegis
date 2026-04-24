"use client";

import { Hint } from "@/components/aegis/hint";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { ClientActions } from "./client-actions";
import { fullDateTime } from "@/lib/date-formats";
import type { TemplateField } from "@/packages/clients/types";

export type ClientRow = {
  _id: string;
  _creationTime: number;
  name: string;
  identificationNumber: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
};

function stringifyValue(field: TemplateField, value: unknown) {
  if (value == null || value === "") return "";

  if (field.type === "switch") {
    return value ? "Si" : "No";
  }

  if (field.type === "select") {
    const selected = field.config.options?.find(
      (option) => option.value === value,
    );
    return selected?.label ?? String(value);
  }

  if (field.type === "date" && typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : fullDateTime(parsed);
  }

  if (field.type === "file" || field.type === "image") {
    return typeof value === "string" && value ? "Cargado" : "Sin archivo";
  }

  return String(value);
}

export function createClientColumns(
  fields: TemplateField[],
): ColumnDef<ClientRow>[] {
  const dynamicColumns: ColumnDef<ClientRow>[] = fields.map((field) => ({
    id: field.id,
    accessorFn: (row) => stringifyValue(field, row.data[field.id]),
    header: field.label,
    meta: {
      className:
        field.type === "file" || field.type === "image"
          ? "hidden lg:table-cell"
          : "hidden md:table-cell",
    },
    cell: ({ row }) => {
      const displayValue = stringifyValue(field, row.original.data[field.id]);
      return (
        <Hint label={displayValue || "Sin dato"}>
          <p className="truncate ml-2 max-w-48">{displayValue || "-"}</p>
        </Hint>
      );
    },
  }));

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
    header: ({ column }) => (
      <Button
        size="sm"
        variant="ghost"
        className="has-[>svg]:px-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="size-4 ml-2" />
        ) : (
          <ArrowDown className="size-4 ml-2" />
        )}
      </Button>
    ),
    cell: ({ row }) => (
      <Hint label={row.getValue("name")}>
        <p className="truncate ml-2 max-w-48 font-medium">
          {row.getValue("name")}
        </p>
      </Hint>
    ),
  },
  {
    accessorKey: "identificationNumber",
    header: ({ column }) => (
      <Button
        size="sm"
        variant="ghost"
        className="has-[>svg]:px-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Identificación
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="size-4 ml-2" />
        ) : (
          <ArrowDown className="size-4 ml-2" />
        )}
      </Button>
    ),
    cell: ({ row }) => (
      <p className="ml-2">{row.getValue("identificationNumber")}</p>
    ),
  },
  {
    accessorKey: "_creationTime",
    meta: { className: "hidden md:table-cell" },
    header: ({ column }) => (
      <Button
        size="sm"
        variant="ghost"
        className="has-[>svg]:px-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Creado
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="size-4 ml-2" />
        ) : (
          <ArrowDown className="size-4 ml-2" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("_creationTime"));
      return <p className="line-clamp-1 ml-2">{fullDateTime(date)}</p>;
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => (
      <ClientActions id={row.original._id}>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </ClientActions>
    ),
  },
];
