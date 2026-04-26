"use client";

import { ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { BondDataType } from "@/packages/bonds/types";
import type { ContractDataType, QuoteType } from "../../types";
import { BidBondCard } from "./bid-bond-card";
import { PerformanceBondCard } from "./performance-bond-card";
import { PerformanceBondPicker } from "./performance-bond-picker";

interface BondsSectionProps {
  quoteType: QuoteType;
  companyId: Id<"companies">;
  contractData: ContractDataType;
  bidBond: BondDataType;
  performanceBonds: BondDataType[];
  onBidBondChange: (next: BondDataType) => void;
  onPerformanceBondsChange: (next: BondDataType[]) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * Sección 5 del formulario. Despacha entre el card de bidBond único y la
 * lista de cumplimiento (picker + cards apilados).
 */
export function BondsSection({
  quoteType,
  companyId,
  contractData,
  bidBond,
  performanceBonds,
  onBidBondChange,
  onPerformanceBondsChange,
  readOnly,
  className,
}: BondsSectionProps) {
  if (quoteType === "bidBond") {
    return (
      <BidBondCard
        className={className}
        contractData={contractData}
        bond={bidBond}
        onChange={onBidBondChange}
        readOnly={readOnly}
      />
    );
  }

  const handleAdd = (bond: BondDataType) => {
    onPerformanceBondsChange([...performanceBonds, bond]);
  };
  const handleChange = (idx: number, next: BondDataType) => {
    onPerformanceBondsChange(
      performanceBonds.map((b, i) => (i === idx ? next : b)),
    );
  };
  const handleRemove = (idx: number) => {
    onPerformanceBondsChange(performanceBonds.filter((_, i) => i !== idx));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <PerformanceBondPicker
        companyId={companyId}
        contractData={contractData}
        selected={performanceBonds}
        onAdd={handleAdd}
        readOnly={readOnly}
      />
      {performanceBonds.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-card/50 p-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShieldOff className="size-5" />
          </div>
          <p className="text-sm font-medium">Sin amparos seleccionados</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Agrega amparos desde el catálogo para construir la cotización de
            cumplimiento.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {performanceBonds.map((b, idx) => (
          <PerformanceBondCard
            key={`${b.id ?? "anon"}-${idx}`}
            contractData={contractData}
            bond={b}
            onChange={(next) => handleChange(idx, next)}
            onRemove={() => handleRemove(idx)}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
