import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { fullDate } from "@/lib/date-formats";
import { formatCop } from "@/lib/format-cop";
import { truncateTwoDecimals } from "@/lib/formatTwoDecimals";
import { BondDataType } from "../types";
import { differenceInCalendarDays } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { getBondTotals } from "@/lib/get-bond-totals";
import { Badge } from "@/components/ui/badge";
import { Dispatch, SetStateAction } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { RiArrowRightLine } from "@remixicon/react";

interface PerformanceBondCardProps {
  bondData: BondDataType;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setQuoteType: Dispatch<SetStateAction<"bidBond" | "performanceBonds">>;
  setSelectedBondId: Dispatch<SetStateAction<Id<"bonds"> | undefined>>;
}

export const PerformanceBondCard = ({
  bondData,
  setOpen,
  setQuoteType,
  setSelectedBondId,
}: PerformanceBondCardProps) => {
  const bidBondTotals = getBondTotals(
    bondData.insuredValue,
    bondData.rate,
    differenceInCalendarDays(bondData.endDate, bondData.startDate),
  );

  const handleEditBond = () => {
    setOpen(false);
    setQuoteType("performanceBonds");
    setSelectedBondId(bondData.id);
  };

  return (
    <Card className="p-4 gap-0">
      <CardHeader className="p-0 gap-0">
        <div className="flex justify-between gap-2">
          <CardTitle className="capitalize text-sm">{bondData.name}</CardTitle>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => handleEditBond()}
          >
            <RiArrowRightLine className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <Separator className="my-2" />
      <CardContent className="p-0">
        <div className="grid grid-cols-4 gap-2">
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bond-start" className="text-xs">
              DESDE
            </Label>
            <p>{fullDate(bondData.startDate)}</p>
          </div>
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bond-end" className="text-xs">
              HASTA
            </Label>
            <p>{fullDate(bondData.endDate)}</p>
          </div>
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bond-days" className="text-xs">
              DIAS
            </Label>
            <p>
              {differenceInCalendarDays(bondData.endDate, bondData.startDate)}
            </p>
          </div>
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bond-months" className="text-xs">
              MESES
            </Label>
            <p>
              {(
                differenceInCalendarDays(bondData.endDate, bondData.startDate) /
                30
              ).toFixed(0)}
            </p>
          </div>
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bond-percentage" className="text-xs">
              PORCENTAJE %
            </Label>
            <p>{truncateTwoDecimals(bondData.percentage)}</p>
          </div>
          <div className="grid w-full items-center gap-1 col-span-2">
            <Label htmlFor="bond-insured-value" className="text-xs">
              VALOR ASEGURADO
            </Label>
            <p>{formatCop(bondData.insuredValue)}</p>
          </div>
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bond-rate" className="text-xs">
              TASA %
            </Label>
            <p>{bondData.rate}</p>
          </div>
        </div>
        <Separator className="my-2" />
        <div className="grid grid-cols-3 gap-2">
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bond-premium" className="text-xs">
              PRIMA
            </Label>
            <Badge>{formatCop(bidBondTotals.premium)}</Badge>
          </div>
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bond-vat" className="text-xs">
              IVA (19%)
            </Label>
            <Badge>{formatCop(bidBondTotals.vat)}</Badge>
          </div>
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bond-total" className="text-xs">
              TOTAL
            </Label>
            <Badge>{formatCop(bidBondTotals.total)}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
