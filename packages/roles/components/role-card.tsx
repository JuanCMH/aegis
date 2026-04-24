"use client";

import { MoreHorizontal, Pencil, ShieldCheck, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/get-error-message";
import { cn } from "@/lib/utils";
import { useRemoveRole } from "../api";
import {
  countPermissions,
  permissionsFromRecord,
} from "../lib/role-templates";
import type { RoleWithCount } from "../types";

interface RoleCardProps {
  role: RoleWithCount;
  totalPermissions: number;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (role: RoleWithCount) => void;
}

export function RoleCard({
  role,
  totalPermissions,
  canEdit,
  canDelete,
  onEdit,
}: RoleCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { mutate: removeRole, isPending: isRemoving } = useRemoveRole();

  const [DeleteConfirm, confirmDelete] = useConfirm({
    title: "Eliminar rol",
    message:
      role.memberCount > 0
        ? `Este rol está asignado a ${role.memberCount} ${
            role.memberCount === 1 ? "miembro" : "miembros"
          }. Al eliminarlo, volverán a los permisos por defecto de Miembro.`
        : "Se eliminará este rol personalizado. Esta acción no se puede deshacer.",
    type: "critical",
    confirmText: "Eliminar",
  });

  const selected = countPermissions(permissionsFromRecord(role));

  const handleDelete = async () => {
    setMenuOpen(false);
    const ok = await confirmDelete();
    if (!ok) return;
    await removeRole(
      { id: role._id },
      {
        onSuccess: () => toast.success("Rol eliminado"),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  const showActions = canEdit || canDelete;

  return (
    <>
      <DeleteConfirm />
      <div
        className={cn(
          "group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition hover:border-aegis-sapphire/30 hover:shadow-sm",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-aegis-cyan/10 text-aegis-cyan">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-aegis-graphite">
                {role.name}
              </p>
              <p className="mt-0.5 text-xs text-aegis-steel">
                {selected} de {totalPermissions} permisos
              </p>
            </div>
          </div>
          {showActions && (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  disabled={isRemoving}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {canEdit && (
                  <DropdownMenuItem onSelect={() => onEdit(role)}>
                    <Pencil className="size-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {canEdit && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={handleDelete}
                  >
                    <Trash2 className="size-4" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-aegis-steel">
          <Users className="size-3.5" />
          <span>
            {role.memberCount}{" "}
            {role.memberCount === 1 ? "miembro asignado" : "miembros asignados"}
          </span>
        </div>
      </div>
    </>
  );
}
