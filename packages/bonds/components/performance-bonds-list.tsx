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
import { RiListCheck3 } from "@remixicon/react";

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
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-9 items-center justify-center rounded-lg border border-h-indigo/10 bg-h-indigo/10 text-h-indigo">
              <RiListCheck3 className="size-4" />
            </div>
            <div className="space-y-1">
              <SheetTitle className="truncate">Lista de garantías</SheetTitle>
              <SheetDescription>
                Revisa las garantías de cumplimiento agregadas a la cotización.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <Separator className="opacity-40" />
        <main className="h-full space-y-2 overflow-y-auto p-4">
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
        <footer className="border-t border-border/40 p-4">
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
