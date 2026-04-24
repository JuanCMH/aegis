import { Dispatch, SetStateAction, useState } from "react";
import { ContractDataType } from "../../quotes/types";
import { BondPicker } from "@/components/aegis/bond-picker";
import { ListChecks, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AmparosPickerModal } from "@/packages/bonds/components/modals/amparos-picker-modal";
import { Id } from "@/convex/_generated/dataModel";
import { BondDataType } from "@/packages/bonds/types";
import Bond from "./bond";
import { PerformanceBondsList } from "./performance-bonds-list";
import ResultsCard from "@/packages/quotes/components/results-card";
import { getBondTotals } from "@/lib/get-bond-totals";
import { differenceInCalendarDays } from "date-fns";
import { getQuoteTotals } from "@/lib/get-quote-totals";
import { Separator } from "@/components/ui/separator";

interface PerformanceBondsInfoProps {
  editMode?: boolean;
  type: "create" | "update";
  expenses: number;
  setExpenses: Dispatch<SetStateAction<number>>;
  calculateExpensesTaxes: boolean;
  setCalculateExpensesTaxes: Dispatch<SetStateAction<boolean>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  contractData: ContractDataType;
  performanceBondsData: Array<BondDataType>;
  setPerformanceBondsData: Dispatch<SetStateAction<Array<BondDataType>>>;
  setQuoteType: Dispatch<SetStateAction<"bidBond" | "performanceBonds">>;
}

const PerformanceBondsInfo = ({
  editMode,
  type,
  expenses,
  setExpenses,
  calculateExpensesTaxes,
  setCalculateExpensesTaxes,
  onSubmit,
  isLoading,
  contractData,
  performanceBondsData,
  setPerformanceBondsData,
  setQuoteType,
}: PerformanceBondsInfoProps) => {
  const [listOpen, setListOpen] = useState(false);
  const [bodsModalOpen, setBondsModalOpen] = useState(false);
  const [selectedBondId, setSelectedBondId] = useState<Id<"bonds"> | undefined>(
    undefined,
  );

  const selectedBond = performanceBondsData.find(
    (b) => b.id === selectedBondId,
  );

  const performanceBondTotals = getBondTotals(
    selectedBond?.insuredValue || 0,
    selectedBond?.rate || 0,
    differenceInCalendarDays(
      selectedBond?.endDate || new Date(),
      selectedBond?.startDate || new Date(),
    ),
  );

  const results = getQuoteTotals(
    performanceBondsData.map((data) => {
      return {
        insuredValue: data.insuredValue,
        rate: data.rate,
        days: differenceInCalendarDays(data.endDate, data.startDate),
      };
    }),
  );

  const hasValidContractDates =
    differenceInCalendarDays(
      contractData.contractEnd,
      contractData.contractStart,
    ) > 0;

  const isValidQuote =
    hasValidContractDates &&
    performanceBondsData.length > 0 &&
    performanceBondsData.every((bond) => {
      const hasValidValues =
        bond.percentage > 0 && bond.insuredValue > 0 && bond.rate > 0;
      const days = differenceInCalendarDays(bond.endDate, bond.startDate);
      const hasValidDates = days > 0;

      return hasValidValues && hasValidDates;
    });

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <BondPicker
            value={selectedBondId}
            onChange={setSelectedBondId}
            bonds={performanceBondsData}
            placeholder="Seleccionar amparo"
          />
          {(editMode || editMode === undefined) && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setBondsModalOpen(true)}
                >
                  <ShieldCheck />
                  Amparos
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setListOpen(true)}
                  disabled={performanceBondsData.length === 0}
                >
                  <ListChecks />
                  Amparos agregados{` (${performanceBondsData.length})`}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {selectedBond && (
          <>
            <Bond
              readOnly={editMode !== undefined && !editMode}
              key={selectedBond.id}
              contractData={contractData}
              startDate={selectedBond.startDate}
              endDate={selectedBond.endDate}
              percentage={selectedBond.percentage}
              insuredValue={selectedBond.insuredValue}
              rate={selectedBond.rate}
              setStartDate={(startDate) => {
                setPerformanceBondsData((prev) =>
                  prev.map((b) =>
                    b.id === selectedBond.id ? { ...b, startDate } : b,
                  ),
                );
              }}
              setEndDate={(endDate) => {
                setPerformanceBondsData((prev) =>
                  prev.map((b) =>
                    b.id === selectedBond.id ? { ...b, endDate } : b,
                  ),
                );
              }}
              setPercentage={(percentage) => {
                setPerformanceBondsData((prev) =>
                  prev.map((b) =>
                    b.id === selectedBond.id ? { ...b, percentage } : b,
                  ),
                );
              }}
              setInsuredValue={(insuredValue) => {
                setPerformanceBondsData((prev) =>
                  prev.map((b) =>
                    b.id === selectedBond.id ? { ...b, insuredValue } : b,
                  ),
                );
              }}
              setRate={(rate) => {
                setPerformanceBondsData((prev) =>
                  prev.map((b) =>
                    b.id === selectedBond.id ? { ...b, rate } : b,
                  ),
                );
              }}
            />
            <Separator className="opacity-40" />
            <ResultsCard
              readOnly={editMode !== undefined && !editMode}
              vat={performanceBondTotals.vat}
              total={performanceBondTotals.total}
              premium={performanceBondTotals.premium}
            />
          </>
        )}
        {!selectedBond && (
          <>
            <Separator className="opacity-40" />
            <ResultsCard
              readOnly={editMode !== undefined && !editMode}
              vat={results.vat}
              total={results.total}
              premium={results.premium}
              expenses={expenses}
              setExpenses={setExpenses}
              calculateExpensesTaxes={calculateExpensesTaxes}
              setCalculateExpensesTaxes={setCalculateExpensesTaxes}
            />
          </>
        )}
        <PerformanceBondsList
          open={listOpen}
          setOpen={setListOpen}
          expenses={expenses}
          setExpenses={setExpenses}
          setQuoteType={setQuoteType}
          setSelectedBondId={setSelectedBondId}
          performanceBondsData={performanceBondsData}
          calculateExpensesTaxes={calculateExpensesTaxes}
          setCalculateExpensesTaxes={setCalculateExpensesTaxes}
        />
      </div>
      <AmparosPickerModal
        open={bodsModalOpen}
        setOpen={setBondsModalOpen}
        contractData={contractData}
        performanceBondsData={performanceBondsData}
        setPerformanceBondsData={setPerformanceBondsData}
      />
      {(editMode || editMode === undefined) && (
        <footer className="flex justify-end mt-4">
          <Button type="submit" disabled={isLoading || !isValidQuote}>
            {type === "create" && "Crear Cotización"}
            {type === "update" && "Actualizar Cotización"}
          </Button>
        </footer>
      )}
    </form>
  );
};

export default PerformanceBondsInfo;
