"use client";

import { differenceInCalendarDays } from "date-fns";
import { ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import {
  AegisModal,
  AegisModalContent,
  AegisModalHeader,
} from "@/components/aegis/aegis-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import type { ContractDataType } from "@/packages/quotes/types";
import { useHasPermissions } from "@/packages/roles/api";
import { useGetBondsByCompany } from "../../api";
import type { BondDataType } from "../../types";

interface AmparosPickerModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  contractData: ContractDataType;
  performanceBondsData: BondDataType[];
  setPerformanceBondsData: Dispatch<SetStateAction<BondDataType[]>>;
}

/**
 * Selector de amparos (catálogo → cotización).
 *
 * Lee de `bonds.getByCompany` sólo los activos y permite marcarlos como
 * parte de la cotización. El CRUD del catálogo vive en
 * `/companies/[id]/settings/bonds`; este modal es sólo consumidor.
 */
export const AmparosPickerModal = ({
  open,
  setOpen,
  contractData,
  performanceBondsData,
  setPerformanceBondsData,
}: AmparosPickerModalProps) => {
  const companyId = useCompanyId();

  const { data: bonds, isLoading } = useGetBondsByCompany({ companyId });

  const { permissions } = useHasPermissions({
    companyId,
    permissions: ["bonds_manage"],
  });
  const canManageCatalog = permissions?.bonds_manage ?? false;

  const toggle = (
    bondId: string,
    bondName: string,
    defaultRate: number | undefined,
    checked: boolean,
  ) => {
    if (checked) {
      const days = differenceInCalendarDays(
        contractData.contractEnd,
        contractData.contractStart,
      );
      setPerformanceBondsData((prev) => [
        ...prev,
        {
          id: bondId as BondDataType["id"],
          name: bondName,
          startDate: contractData.contractStart,
          endDate: contractData.contractEnd,
          percentage: 0,
          insuredValue: 0,
          // Precargamos la tasa por defecto del catálogo
          rate: defaultRate ?? 0,
          // `days` / `months` no son parte del tipo canónico, se derivan.
          ...(Number.isFinite(days)
            ? ({
                days,
                months: Number((days / 30).toFixed(2)),
              } as unknown as object)
            : {}),
        } as BondDataType,
      ]);
    } else {
      setPerformanceBondsData((prev) => prev.filter((b) => b.id !== bondId));
    }
  };

  return (
    <AegisModal open={open} onOpenChange={setOpen} maxWidth="sm:max-w-lg">
      <AegisModalHeader
        icon={ShieldCheck}
        iconClassName="bg-aegis-amber/10 border-aegis-amber/10 text-aegis-amber"
        title="Agregar amparos"
        description="Selecciona del catálogo de la agencia los amparos que cubre esta cotización."
      />
      <AegisModalContent className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-aegis-graphite">
            Catálogo
          </h2>
          {canManageCatalog && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-aegis-steel"
            >
              <Link
                href={`/companies/${companyId}/settings/bonds`}
                target="_blank"
              >
                Gestionar catálogo
                <ExternalLink className="size-3" />
              </Link>
            </Button>
          )}
        </header>

        <ScrollArea className="max-h-72">
          <div className="flex flex-col gap-2 pr-2">
            {isLoading && (
              <>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </>
            )}

            {!isLoading && (bonds ?? []).length === 0 && (
              <div className="rounded-md border border-dashed border-border/60 p-6 text-center">
                <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-aegis-amber/10 text-aegis-amber">
                  <ShieldCheck className="size-4" />
                </div>
                <p className="text-sm font-medium text-aegis-graphite">
                  Aún no hay amparos en el catálogo
                </p>
                <p className="mt-1 text-xs text-aegis-steel">
                  {canManageCatalog
                    ? "Crea tu primer amparo desde la configuración de la agencia."
                    : "Pide a un administrador que cree amparos en la agencia."}
                </p>
                {canManageCatalog && (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href={`/companies/${companyId}/settings/bonds`}>
                      Ir al catálogo
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {!isLoading &&
              (bonds ?? []).map((bond) => {
                const isSelected = performanceBondsData.some(
                  (b) => b.id === bond._id,
                );
                return (
                  <label
                    key={bond._id}
                    htmlFor={`amparo-${bond._id}`}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-border/60 bg-card p-3 transition-colors hover:bg-accent/30"
                  >
                    <Checkbox
                      id={`amparo-${bond._id}`}
                      checked={isSelected}
                      onCheckedChange={(c) =>
                        toggle(
                          bond._id,
                          bond.name,
                          bond.defaultRate,
                          c === true,
                        )
                      }
                      className="mt-0.5"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-aegis-graphite">
                          {bond.name}
                        </span>
                        {bond.code && (
                          <span className="font-mono text-[10px] text-aegis-steel">
                            {bond.code}
                          </span>
                        )}
                      </div>
                      {bond.description && (
                        <p className="line-clamp-2 text-xs text-aegis-steel">
                          {bond.description}
                        </p>
                      )}
                      {bond.defaultRate !== undefined && (
                        <p className="text-[11px] text-aegis-steel">
                          Tasa sugerida:{" "}
                          <span className="font-mono text-aegis-graphite">
                            {bond.defaultRate}%
                          </span>
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
          </div>
        </ScrollArea>
      </AegisModalContent>
    </AegisModal>
  );
};
