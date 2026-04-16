"use client";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { RiMore2Line, RiArrowUpLine, RiArrowDownLine } from "@remixicon/react";
import { ClientActions } from "./client-actions";
import { fullDateTime } from "@/lib/date-formats";

export type ClientRow = {
  _id: string;
  _creationTime: number;
  name: string;
  identificationNumber: string;
  data: Record<string, unknown>;
  [key: string]: unknown;
};

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
          <RiArrowUpLine className="size-4 ml-2" />
        ) : (
          <RiArrowDownLine className="size-4 ml-2" />
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
          <RiArrowUpLine className="size-4 ml-2" />
        ) : (
          <RiArrowDownLine className="size-4 ml-2" />
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
          <RiArrowUpLine className="size-4 ml-2" />
        ) : (
          <RiArrowDownLine className="size-4 ml-2" />
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
          <RiMore2Line className="size-4" />
        </Button>
      </ClientActions>
    ),
  },
];
