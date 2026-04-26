"use client";

import { useEffect, useRef, useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/components/aegis/currency-input";
import { Separator } from "@/components/ui/separator";
import { formatCop } from "@/lib/format-cop";
import { cn } from "@/lib/utils";

export interface ResultsCardBondLine {
  name: string;
  premium: number;
}

interface ResultsCardProps {
  vat: number;
  total: number;
  premium: number;
  /** Premium breakdown by bond (used for performance quotes). */
  breakdown?: ResultsCardBondLine[];
  expenses?: number;
  setExpenses?: (value: number) => void;
  calculateExpensesTaxes?: boolean;
  setCalculateExpensesTaxes?: (value: boolean) => void;
  readOnly?: boolean;
  /** Apply sticky position on desktop. */
  sticky?: boolean;
  className?: string;
}

const ResultsCard = ({
  vat,
  total,
  premium,
  breakdown,
  expenses,
  setExpenses,
  calculateExpensesTaxes = false,
  setCalculateExpensesTaxes,
  readOnly,
  sticky,
  className,
}: ResultsCardProps) => {
  const withExpenses =
    typeof expenses !== "undefined" && typeof setExpenses === "function";
  const withCalculateExpensesTaxes =
    withExpenses && typeof setCalculateExpensesTaxes === "function";

  const expensesValue = expenses ?? 0;
  const totalWithExpenses = calculateExpensesTaxes
    ? total + expensesValue + expensesValue * 0.19
    : total + expensesValue;

  // Fade-highlight on total change.
  const [flash, setFlash] = useState(false);
  const prev = useRef<number | null>(null);
  useEffect(() => {
    if (prev.current !== null && prev.current !== totalWithExpenses) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
    prev.current = totalWithExpenses;
  }, [totalWithExpenses]);

  return (
    <section
      className={cn(
        "rounded-xl border border-border/40 bg-card/90 p-4 backdrop-blur-sm",
        sticky && "lg:sticky lg:top-16",
        className,
      )}
    >
      <header className="mb-3 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg border border-aegis-sapphire/10 bg-aegis-sapphire/10 text-aegis-sapphire">
          <CircleDollarSign className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">
            Resumen financiero
          </p>
          <p className="text-[11px] text-muted-foreground">
            {total > 0
              ? "Valores estimados de la cotización."
              : "Completa los amparos para ver los valores."}
          </p>
        </div>
      </header>

      {breakdown && breakdown.length > 0 && (
        <div className="mb-3 space-y-1 rounded-md bg-muted/30 p-2 text-xs">
          {breakdown.map((b, i) => (
            <div
              key={`${b.name}-${i}`}
              className="flex items-center justify-between gap-3"
            >
              <span className="truncate text-muted-foreground">{b.name}</span>
              <span className="font-medium">{formatCop(b.premium)}</span>
            </div>
          ))}
        </div>
      )}

      {withExpenses && (
        <div className="mb-3 grid w-full items-center gap-1">
          <Label htmlFor="quote-expenses" className="text-xs">
            GASTOS
          </Label>
          <CurrencyInput
            placeholder="$0"
            readOnly={readOnly}
            value={expensesValue === 0 ? "" : expensesValue.toString()}
            onChange={(v) => setExpenses?.(Number(v))}
          />
        </div>
      )}

      <div className="space-y-1.5 text-sm">
        <Row label="Prima" value={premium} />
        <Row label="IVA (19%)" value={vat} />
        {withExpenses && expensesValue > 0 && (
          <Row label="Gastos" value={expensesValue} />
        )}
        <Separator className="my-2 opacity-50" />
        <div
          className={cn(
            "flex items-center justify-between rounded-md px-2 py-1 text-base font-semibold transition-colors",
            flash
              ? "bg-aegis-sapphire/10 text-aegis-sapphire"
              : "text-foreground",
          )}
        >
          <span>Total</span>
          <span>{formatCop(totalWithExpenses)}</span>
        </div>
      </div>

      {withCalculateExpensesTaxes && (
        <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
          <Switch
            id="quote-calc-expenses-taxes"
            checked={calculateExpensesTaxes}
            onCheckedChange={readOnly ? undefined : setCalculateExpensesTaxes}
            className="data-[state=checked]:bg-aegis-sapphire"
          />
          <Label
            htmlFor="quote-calc-expenses-taxes"
            className="text-xs text-foreground/80"
          >
            Calcular IVA de los gastos
          </Label>
        </div>
      )}
    </section>
  );
};

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{formatCop(value)}</span>
    </div>
  );
}

export default ResultsCard;
