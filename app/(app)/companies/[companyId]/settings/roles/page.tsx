"use client";

import { Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import {
  useGetRolesWithCounts,
  useHasPermissions,
} from "@/packages/roles/api";
import { RoleList } from "@/packages/roles/components/role-list";
import { RoleFormModal } from "@/packages/roles/components/modals/role-form-modal";
import { RoleGate } from "@/packages/roles/components/role-gate";
import type { RoleWithCount } from "@/packages/roles/types";
import { cn } from "@/lib/utils";

export default function RolesPage() {
  const companyId = useCompanyId();
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
    <div className="flex h-full w-full flex-1 flex-col px-2">
      <div className="z-11 mx-2 mt-4 rounded-lg border border-muted bg-card pb-2">
        <header
          className={cn(
            "z-10 sticky top-0 flex shrink-0 flex-col transition-[width,height] ease-linear",
            "min-h-12",
          )}
        >
          <div className="flex w-full items-center p-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="cursor-pointer" />
              <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/companies/${companyId}`}>
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Roles</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>
      </div>

      <div className="mx-2 mt-4 flex-1 space-y-4 pb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-aegis-cyan/10 text-aegis-cyan">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-aegis-graphite">
                Roles personalizados
              </h1>
              <p className="text-sm text-aegis-steel">
                Crea roles con el mix exacto de permisos que necesita tu
                agencia.
              </p>
            </div>
          </div>
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

      <RoleFormModal
        open={formOpen}
        setOpen={setFormOpen}
        companyId={companyId}
        role={editing}
      />
    </div>
  );
}
