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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import type { ClientRow } from "./client-columns";

interface ClientDataTableProps {
  data: ClientRow[];
  columns: ColumnDef<ClientRow>[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  isDone: boolean;
  onLoadMore: () => void;
}

export function ClientDataTable({
  data,
  columns,
  isLoading,
  search,
  onSearchChange,
  isDone,
  onLoadMore,
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

  return (
    <div className="m-2 border p-2 rounded-md bg-card border-border/40">
      <div className="flex items-center pb-2 gap-2">
        <Input
          placeholder="Buscar por nombre o identificación..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border border-border/40">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
            {table.getRowModel().rows?.length ? (
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? (
                    <div className="flex gap-2 justify-center items-center">
                      <Spinner />
                      Cargando clientes...
                    </div>
                  ) : (
                    "No hay resultados."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!isDone && (
        <div className="flex items-center justify-center pt-2">
          <Button size="sm" variant="outline" onClick={onLoadMore}>
            Cargar más
          </Button>
        </div>
      )}
    </div>
  );
}
