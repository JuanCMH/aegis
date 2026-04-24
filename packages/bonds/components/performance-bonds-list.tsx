import { differenceInCalendarDays } from "date-fns";
import { ListChecks } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import {
  AegisSheet,
  AegisSheetContent,
  AegisSheetFooter,
  AegisSheetHeader,
} from "@/components/aegis/aegis-sheet";
import type { Id } from "@/convex/_generated/dataModel";
import { getQuoteTotals } from "@/lib/get-quote-totals";
import ResultsCard from "@/packages/quotes/components/results-card";
import type { BondDataType } from "../types";
import { PerformanceBondCard } from "./performance-bond-card";

interface PerformanceBondsListProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  expenses: number;
  setExpenses: Dispatch<SetStateAction<number>>;
  performanceBondsData: Array<BondDataType>;
  calculateExpensesTaxes?: boolean;
  setCalculateExpensesTaxes?: Dispatch<SetStateAction<boolean>>;
  setQuoteType: Dispatch<SetStateAction<"bidBond" | "performanceBonds">>;
  setSelectedBondId: Dispatch<SetStateAction<Id<"bonds"> | undefined>>;
}

export const PerformanceBondsList = ({
  open,
  setOpen,
  expenses,
  setExpenses,
  calculateExpensesTaxes,
  setCalculateExpensesTaxes,
  setQuoteType,
  setSelectedBondId,
  performanceBondsData,
}: PerformanceBondsListProps) => {
  const results = getQuoteTotals(
    performanceBondsData.map((data) => ({
      insuredValue: data.insuredValue,
      rate: data.rate,
      days: differenceInCalendarDays(data.endDate, data.startDate),
    })),
  );

  return (
    <AegisSheet open={open} onOpenChange={setOpen} maxWidth="sm:max-w-lg">
      <AegisSheetHeader
        icon={ListChecks}
        title="Lista de garantías"
        description="Revisa las garantías de cumplimiento agregadas a la cotización."
      />
      <AegisSheetContent className="px-4">
        {performanceBondsData.map((bond, index) => (
          <PerformanceBondCard
            key={`${bond.name}-${index}`}
            bondData={bond}
            setOpen={setOpen}
            setQuoteType={setQuoteType}
            setSelectedBondId={setSelectedBondId}
          />
        ))}
      </AegisSheetContent>
      <AegisSheetFooter className="block">
        <ResultsCard
          vat={results.vat}
          total={results.total}
          premium={results.premium}
          expenses={expenses}
          setExpenses={setExpenses}
          calculateExpensesTaxes={calculateExpensesTaxes}
          setCalculateExpensesTaxes={setCalculateExpensesTaxes}
        />
      </AegisSheetFooter>
    </AegisSheet>
  );
};
