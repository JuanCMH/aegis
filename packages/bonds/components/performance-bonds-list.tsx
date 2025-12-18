import { Dispatch, SetStateAction } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { PerformanceBondCard } from "./performance-bond-card";
import { BondDataType } from "../types";
import ResultsCard from "@/packages/quotes/components/results-card";
import { getQuoteTotals } from "@/lib/get-quote-totals";
import { differenceInCalendarDays } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

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
    performanceBondsData.map((data) => {
      return {
        insuredValue: data.insuredValue,
        rate: data.rate,
        days: differenceInCalendarDays(data.endDate, data.startDate),
      };
    }),
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="truncate">Lista de Garantías</SheetTitle>
          <SheetDescription>
            En esta sección se muestran las garantías de cumplimiento agregadas
            a la cotización.
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <main className="overflow-y-auto space-y-2 px-2 h-full">
          {performanceBondsData.map((bond, index) => (
            <PerformanceBondCard
              key={index}
              bondData={bond}
              setOpen={setOpen}
              setQuoteType={setQuoteType}
              setSelectedBondId={setSelectedBondId}
            />
          ))}
        </main>
        <footer className="p-2">
          <ResultsCard
            vat={results.vat}
            total={results.total}
            premium={results.premium}
            expenses={expenses}
            setExpenses={setExpenses}
            calculateExpensesTaxes={calculateExpensesTaxes}
            setCalculateExpensesTaxes={setCalculateExpensesTaxes}
          />
        </footer>
      </SheetContent>
    </Sheet>
  );
};
