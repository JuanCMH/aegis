import Bond from "./bond";
import { BondDataType } from "../types";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { differenceInCalendarDays } from "date-fns";
import { ContractDataType } from "../../quotes/types";
import { getBondTotals } from "@/lib/get-bond-totals";
import ResultsCard from "@/packages/quotes/components/results-card";
import { Separator } from "@/components/ui/separator";

interface BidBondDataProps {
  editMode?: boolean;
  type: "create" | "update";
  expenses: number;
  setExpenses: Dispatch<SetStateAction<number>>;
  calculateExpensesTaxes: boolean;
  setCalculateExpensesTaxes: Dispatch<SetStateAction<boolean>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  contractData: ContractDataType;
  bidBondData: BondDataType;
  setBidBondData: Dispatch<SetStateAction<BondDataType>>;
}

const BidBondInfo = ({
  type,
  editMode,
  contractData,
  bidBondData,
  expenses,
  setExpenses,
  calculateExpensesTaxes,
  setCalculateExpensesTaxes,
  onSubmit,
  isLoading,
  setBidBondData,
}: BidBondDataProps) => {
  const bidBondTotals = getBondTotals(
    bidBondData.insuredValue,
    bidBondData.rate,
    365,
  );

  const hasValidContractDates =
    differenceInCalendarDays(
      contractData.contractEnd,
      contractData.contractStart,
    ) > 0;

  const isValidQuote =
    hasValidContractDates &&
    bidBondData.percentage > 0 &&
    bidBondData.insuredValue > 0 &&
    bidBondData.rate > 0 &&
    differenceInCalendarDays(bidBondData.endDate, bidBondData.startDate) > 0;

  return (
    <form onSubmit={onSubmit}>
      <Bond
        readOnly={editMode !== undefined && !editMode}
        contractData={contractData}
        startDate={bidBondData.startDate}
        endDate={bidBondData.endDate}
        percentage={bidBondData.percentage}
        insuredValue={bidBondData.insuredValue}
        rate={bidBondData.rate}
        setStartDate={(startDate) =>
          setBidBondData((p) => ({ ...p, startDate }))
        }
        setEndDate={(endDate) => setBidBondData((p) => ({ ...p, endDate }))}
        setPercentage={(percentage) =>
          setBidBondData((p) => ({ ...p, percentage }))
        }
        setInsuredValue={(insuredValue) =>
          setBidBondData((p) => ({ ...p, insuredValue }))
        }
        setRate={(rate) => setBidBondData((p) => ({ ...p, rate }))}
        setExpiryDate={(expiryDate) =>
          setBidBondData((p) => ({ ...p, expiryDate }))
        }
      />
      <Separator className="my-4 opacity-40" />
      <ResultsCard
        readOnly={editMode !== undefined && !editMode}
        expenses={expenses}
        setExpenses={setExpenses}
        vat={bidBondTotals.vat}
        total={bidBondTotals.total}
        premium={bidBondTotals.premium}
        calculateExpensesTaxes={calculateExpensesTaxes}
        setCalculateExpensesTaxes={setCalculateExpensesTaxes}
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

export default BidBondInfo;
