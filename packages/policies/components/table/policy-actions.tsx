"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/hooks/use-confirm";
import { useCancelPolicy, useRemovePolicy } from "@/packages/policies/api";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { Ban, Eye, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleGate } from "@/packages/roles/components/role-gate";
import type { Id } from "@/convex/_generated/dataModel";

interface PolicyActionsProps {
  id: Id<"policies">;
  status: "active" | "expired" | "canceled" | "pending";
  children: React.ReactNode;
}

export function PolicyActions({ id, status, children }: PolicyActionsProps) {
  const router = useRouter();
  const companyId = useCompanyId();
  const { mutate: removePolicy } = useRemovePolicy();
  const { mutate: cancelPolicy } = useCancelPolicy();

  const [DeleteDialog, confirmDelete] = useConfirm({
    title: "Eliminar póliza",
    message: "¿Estás seguro? Esta acción no se puede deshacer.",
    type: "critical",
  });
  const [CancelDialog, confirmCancel] = useConfirm({
    title: "Cancelar póliza",
    message:
      "La póliza pasará a estado 'Cancelada'. Podrás verla pero no editarla.",
    type: "warning",
  });

  const handleView = () => {
    router.push(`/companies/${companyId}/policies/${id}`);
  };

  const handleEdit = () => {
    router.push(`/companies/${companyId}/policies/${id}`);
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    await removePolicy(
      { id },
      {
        onSuccess: () => toast.success("Póliza eliminada"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleCancel = async () => {
    const ok = await confirmCancel();
    if (!ok) return;
    await cancelPolicy(
      { id },
      {
        onSuccess: () => toast.success("Póliza cancelada"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const canCancel = status !== "canceled" && status !== "expired";

  return (
    <>
      <DeleteDialog />
      <CancelDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
          >
            <Eye className="size-3.5 mr-2" />
            Ver
          </DropdownMenuItem>
          <RoleGate permission="policies_edit">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              <Pencil className="size-3.5 mr-2" />
              Editar
            </DropdownMenuItem>
          </RoleGate>
          {canCancel && (
            <RoleGate permission="policies_cancel">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  void handleCancel();
                }}
              >
                <Ban className="size-3.5 mr-2" />
                Cancelar
              </DropdownMenuItem>
            </RoleGate>
          )}
          <RoleGate permission="policies_delete">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                void handleDelete();
              }}
            >
              <Trash2 className="size-3.5 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </RoleGate>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
