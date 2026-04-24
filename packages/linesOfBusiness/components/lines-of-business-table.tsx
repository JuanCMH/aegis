"use client";

import {
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/get-error-message";
import { cn } from "@/lib/utils";
import {
  useRemoveLineOfBusiness,
  useSetLineOfBusinessActive,
} from "../api";
import type { LineOfBusinessDoc } from "../types";

interface LinesOfBusinessTableProps {
  rows: LineOfBusinessDoc[] | undefined;
  isLoading: boolean;
  canManage: boolean;
  filter: string;
  onEdit: (row: LineOfBusinessDoc) => void;
}

export function LinesOfBusinessTable({
  rows,
  isLoading,
  canManage,
  filter,
  onEdit,
}: LinesOfBusinessTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border/40 p-4 last:border-b-0"
          >
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }

  const filtered = (rows ?? []).filter((r) => {
    if (!filter.trim()) return true;
    const q = filter.trim().toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.code ?? "").toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card px-6 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-aegis-cyan/10 text-aegis-cyan">
          <Tag className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-aegis-graphite">
            {filter.trim() ? "Sin resultados" : "Aún no hay ramos"}
          </p>
          <p className="mt-1 max-w-sm text-xs text-aegis-steel">
            {filter.trim()
              ? "Prueba con otro nombre, código o descripción."
              : "Define los ramos o líneas de negocio con los que trabaja tu agencia."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="h-10 text-xs font-medium text-aegis-steel">
              Ramo
            </TableHead>
            <TableHead className="h-10 text-xs font-medium text-aegis-steel">
              Código
            </TableHead>
            <TableHead className="h-10 text-xs font-medium text-aegis-steel">
              Comisión
            </TableHead>
            <TableHead className="h-10 text-xs font-medium text-aegis-steel">
              Estado
            </TableHead>
            <TableHead className="h-10 w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((row) => (
            <LineRow
              key={row._id}
              row={row}
              canManage={canManage}
              onEdit={onEdit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ---------------------------------- row ----------------------------------- */

function LineRow({
  row,
  canManage,
  onEdit,
}: {
  row: LineOfBusinessDoc;
  canManage: boolean;
  onEdit: (row: LineOfBusinessDoc) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { mutate: setActive, isPending: isToggling } =
    useSetLineOfBusinessActive();
  const { mutate: remove, isPending: isRemoving } = useRemoveLineOfBusiness();

  const [DeleteConfirm, confirmDelete] = useConfirm({
    title: "Eliminar ramo",
    message: `Se eliminará "${row.name}" del catálogo. Las pólizas existentes mantienen el nombre registrado, pero no podrás seleccionarlo en nuevas pólizas.`,
    type: "critical",
    confirmText: "Eliminar",
  });

  const handleToggle = async () => {
    setMenuOpen(false);
    await setActive(
      { id: row._id, isActive: !row.isActive },
      {
        onSuccess: () =>
          toast.success(row.isActive ? "Ramo archivado" : "Ramo activado"),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    const ok = await confirmDelete();
    if (!ok) return;
    await remove(
      { id: row._id },
      {
        onSuccess: () => toast.success("Ramo eliminado"),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <>
      <DeleteConfirm />
      <TableRow className={cn(!row.isActive && "opacity-70")}>
        <TableCell className="py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-aegis-cyan/10 text-aegis-cyan">
              <Tag className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-aegis-graphite">
                {row.name}
              </p>
              {row.description && (
                <p className="truncate text-xs text-aegis-steel">
                  {row.description}
                </p>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-xs">
          {row.code ? (
            <span className="font-mono text-aegis-steel">{row.code}</span>
          ) : (
            <span className="text-aegis-steel/60">—</span>
          )}
        </TableCell>
        <TableCell className="text-xs">
          {row.defaultCommission !== undefined ? (
            <span className="font-mono text-aegis-graphite">
              {row.defaultCommission}%
            </span>
          ) : (
            <span className="text-aegis-steel/60">—</span>
          )}
        </TableCell>
        <TableCell>
          {row.isActive ? (
            <Badge
              variant="outline"
              className="border-aegis-emerald/30 bg-aegis-emerald/10 text-aegis-emerald text-[10px]"
            >
              Activo
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-aegis-slate/30 bg-aegis-slate/10 text-aegis-steel text-[10px]"
            >
              Archivado
            </Badge>
          )}
        </TableCell>
        <TableCell>
          {canManage && (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isToggling || isRemoving}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={() => onEdit(row)}>
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleToggle}>
                  {row.isActive ? (
                    <>
                      <PowerOff className="size-4" />
                      Archivar
                    </>
                  ) : (
                    <>
                      <Power className="size-4" />
                      Activar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>
    </>
  );
}
