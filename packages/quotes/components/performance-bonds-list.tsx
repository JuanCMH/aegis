import { Dispatch, SetStateAction } from "react";
import { BondDataType } from "../types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { BondCard } from "./bond-card";

interface PerformanceBondsListProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  performanceBondsData: Array<BondDataType>;
}

export const PerformanceBondsList = ({
  open,
  setOpen,
  performanceBondsData,
}: PerformanceBondsListProps) => {
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
        <main className="overflow-y-auto space-y-2 px-4">
          {performanceBondsData.map((bond, index) => (
            <BondCard key={index} bondData={bond} />
          ))}
        </main>
      </SheetContent>
    </Sheet>
  );
};
