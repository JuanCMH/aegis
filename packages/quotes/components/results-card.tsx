import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RiCoinsLine } from "@remixicon/react";
import { Dispatch, SetStateAction } from "react";
import { CurrencyInput } from "@/components/currency-input";

interface ResultsCardProps {
  vat: number;
  total: number;
  premium: number;
  expenses?: number;
  readOnly?: boolean;
  setExpenses?: Dispatch<SetStateAction<number>>;
  calculateExpensesTaxes?: boolean;
  setCalculateExpensesTaxes?: Dispatch<SetStateAction<boolean>>;
}

const ResultsCard = ({
  vat,
  total,
  premium,
  expenses,
  readOnly,
  setExpenses,
  calculateExpensesTaxes = false,
  setCalculateExpensesTaxes,
}: ResultsCardProps) => {
  const withExpenses =
    typeof expenses !== "undefined" && typeof setExpenses !== "undefined";

  const withCalculateExpensesTaxes =
    withExpenses &&
    typeof calculateExpensesTaxes !== "undefined" &&
    typeof setCalculateExpensesTaxes !== "undefined";

  const totalWithExpenses = calculateExpensesTaxes
    ? total + (expenses || 0) + (expenses || 0) * 0.19
    : total + (expenses || 0);

  const hasCalculatedValues =
    vat > 0 || premium > 0 || totalWithExpenses > 0 || (expenses || 0) > 0;

  const summaryInputClassName = cn(
    "border-border/50 bg-background/80 text-foreground shadow-none",
    "placeholder:text-muted-foreground/80 dark:bg-background/20 dark:text-foreground",
    "read-only:text-foreground",
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg border border-h-indigo/10 bg-h-indigo/10 text-h-indigo">
          <RiCoinsLine className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">
            Resumen financiero
          </p>
          <p className="text-xs text-muted-foreground/80">
            {hasCalculatedValues
              ? "Valores estimados de la cotizacion actual."
              : "Completa la informacion del bono para ver los valores calculados."}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "grid grid-cols-1 gap-2 md:grid-cols-2",
          !withExpenses ? "lg:grid-cols-3" : "lg:grid-cols-4",
        )}
      >
        {withExpenses && (
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bid-bond-expenses" className="text-xs">
              GASTOS
            </Label>
            <CurrencyInput
              placeholder="$0"
              readOnly={readOnly}
              value={expenses === 0 ? "" : expenses.toString()}
              onChange={(value) => setExpenses(Number(value))}
              inputClassName={summaryInputClassName}
            />
          </div>
        )}
        <div className="grid w-full items-center gap-1">
          <Label
            htmlFor="bid-bond-taxes"
            className="text-[11px] uppercase tracking-[0.14em] text-foreground/80"
          >
            IVA (19%)
          </Label>
          <CurrencyInput
            readOnly
            placeholder="$0"
            value={vat === 0 ? "" : vat.toString()}
            inputClassName={summaryInputClassName}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label
            htmlFor="bid-bond-premium"
            className="text-[11px] uppercase tracking-[0.14em] text-foreground/80"
          >
            PRIMA
          </Label>
          <CurrencyInput
            placeholder="$0"
            readOnly
            value={premium === 0 ? "" : premium.toString()}
            inputClassName={summaryInputClassName}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label
            htmlFor="bid-bond-total"
            className="text-[11px] uppercase tracking-[0.14em] text-foreground/80"
          >
            TOTAL
          </Label>
          <CurrencyInput
            readOnly
            placeholder="$0"
            value={totalWithExpenses === 0 ? "" : totalWithExpenses.toString()}
            inputClassName={cn(summaryInputClassName, "font-medium")}
          />
        </div>
      </div>
      {withCalculateExpensesTaxes && (
        <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
          <Switch
            id="bid-bond-calculate-taxes"
            checked={calculateExpensesTaxes}
            onCheckedChange={readOnly ? undefined : setCalculateExpensesTaxes}
            className="data-[state=checked]:bg-h-indigo"
          />
          <Label
            htmlFor="bid-bond-calculate-taxes"
            className="text-xs text-foreground/80"
          >
            Calcular IVA de los gastos
          </Label>
        </div>
      )}
    </section>
  );
};

export default ResultsCard;
