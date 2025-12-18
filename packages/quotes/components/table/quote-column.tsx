import {
  RiMore2Line,
  RiArrowUpLine,
  RiArrowDownLine,
  RiInformation2Fill,
} from "@remixicon/react";
import { Hint } from "@/components/hint";
import { formatCop } from "@/lib/format-cop";
import { Badge } from "@/components/ui/badge";
import { QuoteActions } from "./quote-actions";
import { QuotePopover } from "./quote-popover";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Doc } from "@/convex/_generated/dataModel";
import { fullDate, fullDateTime } from "@/lib/date-formats";

export const columns: ColumnDef<Doc<"quotes">>[] = [
  {
    accessorKey: "info",
    header: () => {
      return <p className="line-clamp-1 ml-2">Más</p>;
    },
    cell: ({ row }) => {
      const quote = row.original;

      return (
        <QuotePopover quote={quote}>
          <Button variant="ghost" size="icon-sm">
            <RiInformation2Fill className="size-4" />
          </Button>
        </QuotePopover>
      );
    },
  },
  {
    accessorKey: "_creationTime",
    meta: {
      className: "hidden sm:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          size="sm"
          variant="ghost"
          className="has-[>svg]:px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          {column.getIsSorted() === "asc" ? (
            <RiArrowUpLine className="size-4 ml-2" />
          ) : (
            <RiArrowDownLine className="size-4 ml-2" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("_creationTime"));
      return <p className="line-clamp-1 ml-2">{fullDateTime(date)}</p>;
    },
  },
  {
    accessorKey: "contractor",
    header: ({ column }) => {
      return (
        <Button
          size="sm"
          variant="ghost"
          className="has-[>svg]:px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Contratista
          {column.getIsSorted() === "asc" ? (
            <RiArrowUpLine className="size-4 ml-2" />
          ) : (
            <RiArrowDownLine className="size-4 ml-2" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Hint label={row.getValue("contractor")}>
          <p className="truncate ml-2 max-w-48">{row.getValue("contractor")}</p>
        </Hint>
      );
    },
  },
  {
    accessorKey: "quoteType",
    meta: {
      className: "hidden md:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          size="sm"
          variant="ghost"
          className="has-[>svg]:px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo de Cotización
          {column.getIsSorted() === "asc" ? (
            <RiArrowUpLine className="size-4 ml-2" />
          ) : (
            <RiArrowDownLine className="size-4 ml-2" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const quoteType = row.getValue("quoteType");
      const value = quoteType === "bidBond" ? "Seriedad" : "Cumplimiento";
      return <Badge className="ml-2">{value}</Badge>;
    },
  },
  {
    accessorKey: "contractType",
    meta: {
      className: "hidden 2xl:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          size="sm"
          variant="ghost"
          className="has-[>svg]:px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo de Contrato
          {column.getIsSorted() === "asc" ? (
            <RiArrowUpLine className="size-4 ml-2" />
          ) : (
            <RiArrowDownLine className="size-4 ml-2" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Hint label={row.getValue("contractType")}>
          <p className="truncate ml-2 max-w-48">
            {row.getValue("contractType")}
          </p>
        </Hint>
      );
    },
  },
  {
    accessorKey: "contractStart",
    meta: {
      className: "hidden xl:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          size="sm"
          variant="ghost"
          className="has-[>svg]:px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Inicio del Contrato
          {column.getIsSorted() === "asc" ? (
            <RiArrowUpLine className="size-4 ml-2" />
          ) : (
            <RiArrowDownLine className="size-4 ml-2" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const contractStart = row.original.contractStart;
      return (
        <p className="line-clamp-1 ml-2">{fullDate(new Date(contractStart))}</p>
      );
    },
  },
  {
    accessorKey: "contractEnd",
    meta: {
      className: "hidden xl:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          size="sm"
          variant="ghost"
          className="has-[>svg]:px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fin del Contrato
          {column.getIsSorted() === "asc" ? (
            <RiArrowUpLine className="size-4 ml-2" />
          ) : (
            <RiArrowDownLine className="size-4 ml-2" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const contractEnd = row.original.contractEnd;
      return (
        <p className="line-clamp-1 ml-2">{fullDate(new Date(contractEnd))}</p>
      );
    },
  },
  {
    accessorKey: "contractValue",
    meta: {
      className: "hidden xl:table-cell",
    },
    header: ({ column }) => {
      return (
        <Button
          size="sm"
          variant="ghost"
          className="has-[>svg]:px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor del Contrato
          {column.getIsSorted() === "asc" ? (
            <RiArrowUpLine className="size-4 ml-2" />
          ) : (
            <RiArrowDownLine className="size-4 ml-2" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const contractValue = row.getValue("contractValue");
      const value = Number(contractValue);

      return <p className="line-clamp-1 ml-2">{formatCop(value)}</p>;
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      const quote = row.original;
      const id = row.original._id;

      return (
        <QuoteActions id={id} quote={quote}>
          <Button variant="ghost" size="icon-sm">
            <RiMore2Line className="size-4" />
          </Button>
        </QuoteActions>
      );
    },
  },
];
