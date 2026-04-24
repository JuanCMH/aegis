"use client";

import { Plus, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetBondsByCompany } from "@/packages/bonds/api";
import { BondsCatalogTable } from "@/packages/bonds/components/bonds-catalog-table";
import { BondCatalogFormModal } from "@/packages/bonds/components/modals/bond-catalog-form-modal";
import { useBondsSheet } from "@/packages/bonds/store/use-bonds-sheet";
import type { BondDoc } from "@/packages/bonds/types";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { useHasPermissions } from "@/packages/roles/api";
import { RoleGate } from "@/packages/roles/components/role-gate";

export function BondsSheet() {
  const companyId = useCompanyId();
  const [open, setOpen] = useBondsSheet();
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
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto p-0 sm:max-w-3xl"
        >
          <SheetHeader className="border-b border-muted bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-aegis-amber/10 text-aegis-amber">
                <ShieldCheck className="size-5" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-lg font-semibold tracking-tight text-aegis-graphite">
                  Amparos
                </SheetTitle>
                <SheetDescription className="text-sm text-aegis-steel">
                  Catálogo de amparos / fianzas que tu agencia cotiza y emite.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-aegis-steel" />
                <Input
                  placeholder="Buscar por nombre o código"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
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
        </SheetContent>
      </Sheet>

      <BondCatalogFormModal
        open={formOpen}
        setOpen={setFormOpen}
        companyId={companyId}
        row={editing}
      />
    </>
  );
}
