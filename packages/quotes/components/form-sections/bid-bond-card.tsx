"use client";

import { useState } from "react";
import { Award, Calendar, Lightbulb } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Bond from "@/packages/bonds/components/bond";
import { getBondTotals } from "@/lib/get-bond-totals";
import { formatCop } from "@/lib/format-cop";
import { cn } from "@/lib/utils";
import type { BondDataType } from "@/packages/bonds/types";
import type { ContractDataType } from "../../types";
import {
  getBondRateDefault,
  getBondPercentageDefault,
} from "../../lib/bond-rate-defaults";

interface BidBondCardProps {
  contractData: ContractDataType;
  bond: BondDataType;
  onChange: (next: BondDataType) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * Tarjeta única para amparo de Seriedad de Oferta. Incluye:
 * - Chip "Mismas fechas que el contrato".
 * - Sugerencias clickeables de %, tasa.
 * - Premium inline calculado.
 */
export function BidBondCard({
  contractData,
  bond,
  onChange,
  readOnly,
  className,
}: BidBondCardProps) {
  const [hint, setHint] = useState<string | null>(null);
  const days = differenceInCalendarDays(bond.endDate, bond.startDate);
  const totals = getBondTotals(bond.insuredValue, bond.rate, Math.max(days, 0));

  const rateSuggestion = getBondRateDefault("seriedad_oferta");
  const pctSuggestion = getBondPercentageDefault("seriedad_oferta");

  const matchesContractDates =
    bond.startDate.getTime() === contractData.contractStart.getTime() &&
    bond.endDate.getTime() === contractData.contractEnd.getTime();

  const handleSyncWithContract = () => {
    onChange({
      ...bond,
      startDate: contractData.contractStart,
      endDate: contractData.contractEnd,
    });
    setHint("Sincronizado con las fechas del contrato.");
    setTimeout(() => setHint(null), 1800);
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
      className={cn("rounded-xl border border-border/40 bg-card/80", className)}
    >
      <header className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg border border-aegis-amber/20 bg-aegis-amber/10 text-aegis-amber">
            <Award className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">
              Seriedad de la oferta
            </p>
            <p className="text-xs text-muted-foreground">
              Garantiza la propuesta durante la adjudicación.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={matchesContractDates ? "secondary" : "outline"}
            disabled={readOnly}
            onClick={handleSyncWithContract}
            className="h-7 gap-1 text-xs"
          >
            <Calendar className="size-3.5" />
            Mismas fechas que el contrato
          </Button>
        </div>
      </header>
      <Separator className="opacity-40" />
      <div className="space-y-3 p-4">
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
                className="cursor-pointer gap-1"
              >
                Porcentaje {pctSuggestion}%
              </Badge>
            )}
            {rateSuggestion != null && (
              <Badge
                variant="outline"
                role="button"
                onClick={handleApplyRate}
                className="cursor-pointer gap-1"
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
        {hint && (
          <p className="text-[11px] text-muted-foreground" role="status">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
