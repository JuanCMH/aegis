import { Dispatch, SetStateAction, useState } from "react";
import { BondDataType, ContractDataType } from "../types";
import { BondPicker } from "@/components/bond-picker";
import { Toggle } from "@/components/ui/toggle";
import { RiListView, RiShutDownLine } from "@remixicon/react";
import Bond from "./bond";
import { Button } from "@/components/ui/button";
import { PerformanceBondsList } from "./performance-bonds-list";

interface PerformanceBondsInfoProps {
  contractData: ContractDataType;
  performanceBondsData: Array<BondDataType>;
  setPerformanceBondsData: Dispatch<SetStateAction<Array<BondDataType>>>;
}

function handlePerformanceBondToggle(
  pressed: boolean,
  selectedBond: string | undefined,
  contractData: ContractDataType,
  setPerformanceBondsData: Dispatch<SetStateAction<Array<BondDataType>>>,
) {
  if (!selectedBond) return;

  if (pressed) {
    const newBond: BondDataType = {
      name: selectedBond,
      startDate: contractData.contractStart,
      endDate: contractData.contractEnd,
      days: 0,
      months: 0,
      percentage: 0,
      insuredValue: 0,
      rate: 0,
    };
    setPerformanceBondsData((prev) => {
      if (prev.some((b) => b.name === selectedBond)) return prev;
      return [...prev, newBond];
    });
  } else {
    setPerformanceBondsData((prev) =>
      prev.filter((b) => b.name !== selectedBond),
    );
  }
}

const PerformanceBondsInfo = ({
  contractData,
  performanceBondsData,
  setPerformanceBondsData,
}: PerformanceBondsInfoProps) => {
  const [listOpen, setListOpen] = useState(false);
  const [selectedBond, setSelectedBond] = useState<string | undefined>(
    undefined,
  );

  const selectedBonds = performanceBondsData.map((bond) => bond.name);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setListOpen(true)}
          disabled={performanceBondsData.length === 0}
        >
          <RiListView />
          Lista de amparos
        </Button>
        <BondPicker
          value={selectedBond}
          onChange={setSelectedBond}
          selectedBonds={selectedBonds}
          placeholder="Seleccionar garantia"
        />
        {selectedBond && (
          <Toggle
            pressed={selectedBonds.includes(selectedBond)}
            onPressedChange={(pressed) =>
              handlePerformanceBondToggle(
                pressed,
                selectedBond,
                contractData,
                setPerformanceBondsData,
              )
            }
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
          >
            <RiShutDownLine />
          </Toggle>
        )}
      </div>
      {selectedBond && selectedBonds.includes(selectedBond) && (
        <Bond
          bondData={performanceBondsData.find((b) => b.name === selectedBond)!}
          setBondData={(updateFn) => {
            setPerformanceBondsData((prev) =>
              prev.map((b) => {
                if (b.name !== selectedBond) return b;
                return typeof updateFn === "function"
                  ? updateFn(b)
                  : { ...b, ...updateFn };
              }),
            );
          }}
          contractData={contractData}
        />
      )}
      <PerformanceBondsList
        open={listOpen}
        setOpen={setListOpen}
        performanceBondsData={performanceBondsData}
      />
    </div>
  );
};

export default PerformanceBondsInfo;
