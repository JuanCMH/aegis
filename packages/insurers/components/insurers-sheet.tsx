"use client";

import { Building2, DownloadCloud, Plus, Search } from "lucide-react";
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
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { useGetInsurers } from "@/packages/insurers/api";
import { InsurerList } from "@/packages/insurers/components/insurer-list";
import { ImportColombiaInsurersModal } from "@/packages/insurers/components/modals/import-colombia-insurers-modal";
import { InsurerFormModal } from "@/packages/insurers/components/modals/insurer-form-modal";
import { useInsurersSheet } from "@/packages/insurers/store/use-insurers-sheet";
import type { InsurerDoc } from "@/packages/insurers/types";
import { useHasPermissions } from "@/packages/roles/api";
import { RoleGate } from "@/packages/roles/components/role-gate";

export function InsurersSheet() {
  const companyId = useCompanyId();
  const [open, setOpen] = useInsurersSheet();
  const [filter, setFilter] = useState("");
  const [scope, setScope] = useState<"active" | "all">("active");
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<InsurerDoc | null>(null);

  const { data: insurers, isLoading } = useGetInsurers({
    companyId,
    includeInactive: scope === "all",
  });

  const { permissions } = useHasPermissions({
    companyId,
    permissions: ["insurers_manage"],
  });

  const canManage = permissions?.insurers_manage ?? false;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (insurer: InsurerDoc) => {
    setEditing(insurer);
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
              <div className="flex size-10 items-center justify-center rounded-xl bg-aegis-sapphire/10 text-aegis-sapphire">
                <Building2 className="size-5" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-lg font-semibold tracking-tight text-aegis-graphite">
                  Aseguradoras
                </SheetTitle>
                <SheetDescription className="text-sm text-aegis-steel">
                  Catálogo de compañías con las que emites pólizas.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex flex-col gap-3">
              <RoleGate permission="insurers_manage">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setImportOpen(true)}
                    className="gap-1.5 border-border/40 hover:border-aegis-sapphire/30 hover:bg-aegis-sapphire/5 transition-colors"
                  >
                    <DownloadCloud className="size-4" />
                    Importar Colombia
                  </Button>
                  <Button onClick={openCreate}>
                    <Plus className="size-4" />
                    Nueva aseguradora
                  </Button>
                </div>
              </RoleGate>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-aegis-steel" />
                  <Input
                    placeholder="Buscar por nombre o NIT"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full pl-9"
                  />
                </div>
                <Select
                  value={scope}
                  onValueChange={(v) => setScope(v as "active" | "all")}
                >
                  <SelectTrigger className="w-36 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="all">Todas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <InsurerList
              insurers={insurers}
              isLoading={isLoading}
              canManage={canManage}
              filter={filter}
              onEdit={openEdit}
            />
          </div>
        </SheetContent>
      </Sheet>

      <InsurerFormModal
        open={formOpen}
        setOpen={setFormOpen}
        companyId={companyId}
        insurer={editing}
      />

      <ImportColombiaInsurersModal
        open={importOpen}
        setOpen={setImportOpen}
        companyId={companyId}
        existing={insurers}
      />
    </>
  );
}
