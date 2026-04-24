"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/hooks/use-confirm";
import { useRemoveClient } from "@/packages/clients/api";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientActionsProps {
  id: string;
  children: React.ReactNode;
}

export function ClientActions({ id, children }: ClientActionsProps) {
  const router = useRouter();
  const companyId = useCompanyId();
  const { mutate: removeClient } = useRemoveClient();

  const [ConfirmDialog, confirm] = useConfirm({
    title: "Eliminar cliente",
    message: "¿Estás seguro? Esta acción no se puede deshacer.",
    type: "critical",
  });

  const handleView = () => {
    router.push(`/companies/${companyId}/clients/${id}`);
  };

  const handleEdit = () => {
    router.push(`/companies/${companyId}/clients/${id}`);
  };

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    await removeClient(
      { id: id as never },
      {
        onSuccess: () => toast.success("Cliente eliminado"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <>
      <ConfirmDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40"
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
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
          >
            <Pencil className="size-3.5 mr-2" />
            Editar
          </DropdownMenuItem>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
