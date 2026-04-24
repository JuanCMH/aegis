"use client";

import { Plus, Search, ShieldCheck } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetBondsByCompany } from "@/packages/bonds/api";
import { BondsCatalogTable } from "@/packages/bonds/components/bonds-catalog-table";
import { BondCatalogFormModal } from "@/packages/bonds/components/modals/bond-catalog-form-modal";
import type { BondDoc } from "@/packages/bonds/types";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { useHasPermissions } from "@/packages/roles/api";
import { RoleGate } from "@/packages/roles/components/role-gate";
import { cn } from "@/lib/utils";

export default function BondsCatalogPage() {
  const companyId = useCompanyId();
  const [filter, setFilter] = useState("");
  const [scope, setScope] = useState<"active" | "all">("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BondDoc | null>(null);

  const { data: rows, isLoading } = useGetBondsByCompany({
    companyId,
    includeInactive: scope === "all",
  });

  const { permissions } = useHasPermissions({
    companyId,
    permissions: ["bonds_manage"],
  });

  const canManage = permissions?.bonds_manage ?? false;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: BondDoc) => {
    setEditing(row);
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
                    <BreadcrumbPage>Amparos</BreadcrumbPage>
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
            <div className="flex size-10 items-center justify-center rounded-xl bg-aegis-amber/10 text-aegis-amber">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-aegis-graphite">
                Amparos
              </h1>
              <p className="text-sm text-aegis-steel">
                Catálogo de amparos / fianzas que tu agencia cotiza y emite.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-aegis-steel" />
              <Input
                placeholder="Buscar por nombre o código"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-9 sm:w-64"
              />
            </div>
            <Select
              value={scope}
              onValueChange={(v) => setScope(v as "active" | "all")}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
            <RoleGate permission="bonds_manage">
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Nuevo amparo
              </Button>
            </RoleGate>
          </div>
        </div>

        <BondsCatalogTable
          rows={rows}
          isLoading={isLoading}
          canManage={canManage}
          filter={filter}
          onEdit={openEdit}
        />
      </div>

      <BondCatalogFormModal
        open={formOpen}
        setOpen={setFormOpen}
        companyId={companyId}
        row={editing}
      />
    </div>
  );
}
