import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

  return (
    <div className="p-2 border border-muted rounded-lg mt-4 z-10 bg-sky-700 text-white pb-2">
      <div
        className={cn(
          "grid gap-2 grid-cols-1 md:grid-cols-2",
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
            />
          </div>
        )}
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="bid-bond-taxes" className="text-xs">
            IVA (19%)
          </Label>
          <CurrencyInput
            readOnly
            placeholder="$0"
            value={vat === 0 ? "" : vat.toString()}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="bid-bond-premium" className="text-xs">
            PRIMA
          </Label>
          <CurrencyInput
            placeholder="$0"
            readOnly
            value={premium === 0 ? "" : premium.toString()}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="bid-bond-total" className="text-xs">
            TOTAL
          </Label>
          <CurrencyInput
            readOnly
            placeholder="$0"
            value={totalWithExpenses === 0 ? "" : totalWithExpenses.toString()}
          />
        </div>
      </div>
      {withCalculateExpensesTaxes && (
        <div className="flex items-center space-x-2 mt-2">
          <Switch
            id="bid-bond-calculate-taxes"
            checked={calculateExpensesTaxes}
            onCheckedChange={readOnly ? undefined : setCalculateExpensesTaxes}
          />
          <Label htmlFor="bid-bond-calculate-taxes" className="text-xs">
            Calcular IVA de los gastos
          </Label>
        </div>
      )}
    </div>
  );
};

export default ResultsCard;
