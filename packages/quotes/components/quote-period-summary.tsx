"use client";

import { Banknote, CheckCircle2, FileText, TrendingUp } from "lucide-react";
import { useGetQuoteCompanyStats } from "../api";
import { formatCop } from "@/lib/format-cop";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface QuotePeriodSummaryProps {
  companyId: Id<"companies">;
  dateFrom?: number;
  dateTo?: number;
  /** Etiqueta humana del período (ej. "Abril 2026"). */
  periodLabel?: string;
  className?: string;
}

/**
 * Tarjeta resumen del período activo (count, total contractValue, conversiones,
 * tasa de conversión).
 */
export function QuotePeriodSummary({
  companyId,
  dateFrom,
  dateTo,
  periodLabel,
  className,
}: QuotePeriodSummaryProps) {
  const { data: stats, isLoading } = useGetQuoteCompanyStats({
    companyId,
    dateFrom,
    dateTo,
  });

  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:flex-row md:items-stretch md:justify-between",
        className,
      )}
      aria-label="Resumen del período"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Período
        </span>
        <span className="text-sm font-semibold">
          {periodLabel ?? "Todas las fechas"}
        </span>
        {stats && !isLoading && (
          <span className="text-xs text-muted-foreground">
            {stats.total} {stats.total === 1 ? "cotización" : "cotizaciones"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        <Stat
          icon={FileText}
          label="Total"
          value={isLoading ? null : String(stats?.total ?? 0)}
        />
        <Stat
          icon={Banknote}
          label="Valor contratado"
          value={
            isLoading ? null : formatCop(stats?.totalContractValue ?? 0)
          }
        />
        <Stat
          icon={CheckCircle2}
          label="Convertidas"
          value={isLoading ? null : String(stats?.convertedCount ?? 0)}
        />
        <Stat
          icon={TrendingUp}
          label="Tasa conversión"
          value={
            isLoading
              ? null
              : `${Math.round((stats?.conversionRate ?? 0) * 100)}%`
          }
          progress={stats?.conversionRate}
        />
      </div>
    </section>
  );
}

interface StatProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  progress?: number;
}

function Stat({ icon: Icon, label, value, progress }: StatProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </span>
      {value === null ? (
        <Skeleton className="h-5 w-20" />
      ) : (
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      )}
      {typeof progress === "number" && (
        <div
          className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-aegis-sapphire transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
