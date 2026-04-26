"use client";

import { differenceInCalendarDays } from "date-fns";
import { Lightbulb, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Bond from "@/packages/bonds/components/bond";
import { getBondTotals } from "@/lib/get-bond-totals";
import { formatCop } from "@/lib/format-cop";
import { cn } from "@/lib/utils";
import type { BondDataType } from "@/packages/bonds/types";
import type { ContractDataType } from "../../types";
import { BOND_PERIOD_CHIP_OPTIONS } from "../../lib/bond-period-defaults";
import {
  getBondPercentageDefault,
  getBondRateDefault,
} from "../../lib/bond-rate-defaults";

interface PerformanceBondCardProps {
  contractData: ContractDataType;
  bond: BondDataType;
  onChange: (next: BondDataType) => void;
  onRemove: () => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * Tarjeta por amparo de cumplimiento. Incluye chips de período (+12, +36,
 * +60), sugerencias de %/tasa y prima inline.
 */
export function PerformanceBondCard({
  contractData,
  bond,
  onChange,
  onRemove,
  readOnly,
  className,
}: PerformanceBondCardProps) {
  const days = differenceInCalendarDays(bond.endDate, bond.startDate);
  const totals = getBondTotals(bond.insuredValue, bond.rate, Math.max(days, 0));

  const rateSuggestion = getBondRateDefault(bond.name);
  const pctSuggestion = getBondPercentageDefault(bond.name);

  const applyChip = (months: number) => {
    if (readOnly) return;
    const next = new Date(contractData.contractEnd);
    next.setUTCMonth(next.getUTCMonth() + months);
    onChange({
      ...bond,
      startDate: contractData.contractStart,
      endDate: next,
    });
  };

  const handleApplyRate = () => {
    if (rateSuggestion == null) return;
    onChange({ ...bond, rate: rateSuggestion });
  };
  const handleApplyPercentage = () => {
    if (pctSuggestion == null) return;
    const insuredValue = Math.round(
      (contractData.contractValue * pctSuggestion) / 100,
    );
    onChange({ ...bond, percentage: pctSuggestion, insuredValue });
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/40 bg-card/80",
        "animate-in fade-in-0 slide-in-from-top-2 duration-300",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg border border-aegis-sapphire/20 bg-aegis-sapphire/10 text-aegis-sapphire">
            <ShieldCheck className="size-4" />
          </div>
          <p className="text-sm font-semibold tracking-tight">{bond.name}</p>
        </div>
        {!readOnly && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onRemove}
            aria-label={`Eliminar ${bond.name}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </header>
      <Separator className="opacity-40" />
      <div className="space-y-3 p-4">
        {!readOnly && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Período
            </span>
            {BOND_PERIOD_CHIP_OPTIONS.map((opt) => (
              <Badge
                key={opt.label}
                variant="outline"
                role="button"
                onClick={() => applyChip(opt.months)}
                className="cursor-pointer gap-1"
              >
                {opt.label}
              </Badge>
            ))}
          </div>
        )}
        <Bond
          readOnly={readOnly}
          contractData={contractData}
          startDate={bond.startDate}
          endDate={bond.endDate}
          percentage={bond.percentage}
          insuredValue={bond.insuredValue}
          rate={bond.rate}
          setStartDate={(d) => onChange({ ...bond, startDate: d })}
          setEndDate={(d) => onChange({ ...bond, endDate: d })}
          setPercentage={(p) => onChange({ ...bond, percentage: p })}
          setInsuredValue={(v) => onChange({ ...bond, insuredValue: v })}
          setRate={(r) => onChange({ ...bond, rate: r })}
        />
        {!readOnly && (rateSuggestion != null || pctSuggestion != null) && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-md bg-muted/40 px-3 py-2 text-xs">
            <Lightbulb className="size-3.5 text-aegis-amber" />
            <span className="text-muted-foreground">Sugerencias:</span>
            {pctSuggestion != null && (
              <Badge
                variant="outline"
                role="button"
                onClick={handleApplyPercentage}
                className="cursor-pointer"
              >
                {pctSuggestion}%
              </Badge>
            )}
            {rateSuggestion != null && (
              <Badge
                variant="outline"
                role="button"
                onClick={handleApplyRate}
                className="cursor-pointer"
              >
                Tasa {rateSuggestion}%
              </Badge>
            )}
          </div>
        )}
        <div className="flex items-center justify-between rounded-md border border-border/40 bg-background/60 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Prima estimada</span>
          <span className="font-semibold">{formatCop(totals.premium)}</span>
        </div>
      </div>
    </div>
  );
}
