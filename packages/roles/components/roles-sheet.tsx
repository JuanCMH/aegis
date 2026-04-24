"use client";

import { Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { useGetRolesWithCounts, useHasPermissions } from "@/packages/roles/api";
import { RoleList } from "@/packages/roles/components/role-list";
import { RoleFormModal } from "@/packages/roles/components/modals/role-form-modal";
import { RoleGate } from "@/packages/roles/components/role-gate";
import { useRolesSheet } from "@/packages/roles/store/use-roles-sheet";
import type { RoleWithCount } from "@/packages/roles/types";

export function RolesSheet() {
  const companyId = useCompanyId();
  const [open, setOpen] = useRolesSheet();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoleWithCount | null>(null);

  const { data: roles, isLoading } = useGetRolesWithCounts({ companyId });

  const { permissions } = useHasPermissions({
    companyId,
    permissions: ["roles_create", "roles_edit", "roles_delete"],
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (role: RoleWithCount) => {
    setEditing(role);
    setFormOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto p-0 sm:max-w-3xl"
        >
          <SheetHeader className="border-b border-muted bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-aegis-cyan/10 text-aegis-cyan">
                <ShieldCheck className="size-5" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-lg font-semibold tracking-tight text-aegis-graphite">
                  Roles personalizados
                </SheetTitle>
                <SheetDescription className="text-sm text-aegis-steel">
                  Crea roles con el mix exacto de permisos que necesita tu
                  agencia.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex justify-end">
              <RoleGate permission="roles_create">
                <Button onClick={openCreate}>
                  <Plus className="size-4" />
                  Nuevo rol
                </Button>
              </RoleGate>
            </div>

            <RoleList
              roles={roles}
              isLoading={isLoading}
              canEdit={permissions?.roles_edit ?? false}
              canDelete={permissions?.roles_delete ?? false}
              onEdit={openEdit}
            />
          </div>
        </SheetContent>
      </Sheet>

      <RoleFormModal
        open={formOpen}
        setOpen={setFormOpen}
        companyId={companyId}
        role={editing}
      />
    </>
  );
}
