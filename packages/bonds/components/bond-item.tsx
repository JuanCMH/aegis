import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Doc } from "@/convex/_generated/dataModel";
import { RiArrowRightLine } from "@remixicon/react";
import { Dispatch, SetStateAction } from "react";
import { BondDataType } from "../types";
import { ContractDataType } from "@/packages/quotes/types";
import { differenceInCalendarDays } from "date-fns";
import { Hint } from "@/components/hint";

interface BondItemProps {
  bond: Doc<"bonds">;
  contractData: ContractDataType;
  setSelectedBond: (bond: Doc<"bonds">) => void;
  performanceBondsData: BondDataType[];
  setPerformanceBondsData: Dispatch<SetStateAction<BondDataType[]>>;
}

export const BondItem = ({
  bond,
  setSelectedBond,
  contractData,
  performanceBondsData,
  setPerformanceBondsData,
}: BondItemProps) => {
  const onCheckedChange = (checked: boolean) => {
    if (checked) {
      setPerformanceBondsData((prev) => [
        ...prev,
        {
          id: bond._id,
          name: bond.name,
          startDate: contractData.contractStart,
          endDate: contractData.contractEnd,
          days: differenceInCalendarDays(
            contractData.contractEnd,
            contractData.contractStart,
          ),
          months: Number(
            (
              differenceInCalendarDays(
                contractData.contractEnd,
                contractData.contractStart,
              ) / 30
            ).toFixed(2),
          ),
          percentage: 0,
          insuredValue: 0,
          rate: 0,
        },
      ]);
    } else {
      setPerformanceBondsData((prev) => prev.filter((b) => b.id !== bond._id));
    }
  };

  return (
    <div className="p-2 text-start border rounded-md border-input bg-card hover:bg-accent hover:text-accent-foreground">
      <div className="flex flex-col">
        <div className="flex justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={performanceBondsData.some((b) => b.id === bond._id)}
              onCheckedChange={onCheckedChange}
            />
            <Hint label={bond.name} side="top" align="center">
              <span className="text-sm font-semibold line-clamp-1">
                {bond.name}
              </span>
            </Hint>
          </div>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => setSelectedBond(bond)}
          >
            <RiArrowRightLine className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{bond.description}</p>
      </div>
    </div>
  );
};
