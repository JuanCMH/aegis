"use client";

import { useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useGetBondsByCompany } from "@/packages/bonds/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { BondDataType } from "@/packages/bonds/types";
import type { ContractDataType } from "../../types";
import { suggestBondDefaults } from "../../lib/bond-rate-defaults";
import { suggestBondEndDate } from "../../lib/bond-period-defaults";

interface PerformanceBondPickerProps {
  companyId: Id<"companies">;
  contractData: ContractDataType;
  /** Bonds already added to the quote (to mark as added). */
  selected: BondDataType[];
  onAdd: (bond: BondDataType) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * Picker de amparos por chips. Click → agrega el amparo al quote con valores
 * por defecto sugeridos según `bond-rate-defaults` y `bond-period-defaults`.
 */
export function PerformanceBondPicker({
  companyId,
  contractData,
  selected,
  onAdd,
  readOnly,
  className,
}: PerformanceBondPickerProps) {
  const { data: bonds, isLoading } = useGetBondsByCompany({ companyId });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = bonds ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((b) => b.name.toLowerCase().includes(q));
  }, [bonds, search]);

  const isSelected = (id: Id<"bonds">) =>
    selected.some((b) => b.id === id);

  const handleAdd = (bondId: Id<"bonds">, bondName: string) => {
    if (readOnly) return;
    if (isSelected(bondId)) return;
    const defaults = suggestBondDefaults(bondName, contractData.contractValue);
    const endTime = suggestBondEndDate(
      bondName,
      contractData.contractEnd.getTime(),
    );
    onAdd({
      id: bondId,
      name: bondName,
      startDate: contractData.contractStart,
      endDate: new Date(endTime),
      percentage: defaults.percentage,
      insuredValue: defaults.insuredValue,
      rate: defaults.rate,
    });
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/40 bg-card/80 p-3",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Amparos disponibles
        </p>
        <div className="relative w-48 max-w-full">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar amparo..."
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>
      <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
        {isLoading && (
          <p className="text-xs text-muted-foreground">Cargando catálogo...</p>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No hay amparos en el catálogo de la empresa.
          </p>
        )}
        {filtered.map((b) => {
          const taken = isSelected(b._id);
          return (
            <Badge
              key={b._id}
              variant={taken ? "secondary" : "outline"}
              role={taken || readOnly ? undefined : "button"}
              aria-disabled={taken || readOnly}
              onClick={() => handleAdd(b._id, b.name)}
              className={cn(
                "gap-1 transition",
                !taken &&
                  !readOnly &&
                  "cursor-pointer hover:border-aegis-sapphire/50 hover:bg-aegis-sapphire/5",
                taken && "opacity-60",
              )}
            >
              {!taken && <Plus className="size-3" />}
              {b.name}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
