import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BondDataType } from "../types";
import { Label } from "@/components/ui/label";
import { fullDate } from "@/lib/date-formats";
import { formatCop } from "@/lib/format-cop";
import { truncateTwoDecimals } from "@/lib/formatTwoDecimals";

interface BondCardProps {
  bondData: BondDataType;
}

export const BondCard = ({ bondData }: BondCardProps) => {
  return (
    <Card className="p-4 gap-4">
      <CardHeader className="p-0">
        <CardTitle className="capitalize">{bondData.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-4 gap-3">
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
            <p>{bondData.days}</p>
          </div>
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="bond-months" className="text-xs">
              MESES
            </Label>
            <p>{bondData.months}</p>
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
      </CardContent>
    </Card>
  );
};
