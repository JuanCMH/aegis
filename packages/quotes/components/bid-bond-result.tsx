import { CurrencyInput } from "@/components/currency-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BondDataType } from "../types";
import { getQuoteTotals } from "@/lib/get-quote-totals";
import { useState } from "react";

interface BidBondResultProps {
  bidBondData: BondDataType;
}

const BidBondResult = ({ bidBondData }: BidBondResultProps) => {
  const [expenses, setExpenses] = useState(0);
  const [calculateTaxes, setCalculateTaxes] = useState(false);

  const quoteTotals = getQuoteTotals(
    bidBondData.insuredValue,
    bidBondData.rate,
    bidBondData.days,
  );

  const totalWithExpenses = calculateTaxes
    ? quoteTotals.total + expenses + expenses * 0.19
    : quoteTotals.total + expenses;

  return (
    <div className="p-2 border border-muted rounded-lg mt-4 z-10 bg-card pb-2">
      <div className="grid grid-cols-4 gap-2">
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="bid-bond-expenses">GASTOS</Label>
          <CurrencyInput
            placeholder="$0"
            value={expenses === 0 ? "" : expenses.toString()}
            onChange={(value) => setExpenses(Number(value))}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="bid-bond-taxes">IVA (19%)</Label>
          <CurrencyInput
            readOnly
            placeholder="$0"
            value={quoteTotals.vat === 0 ? "" : quoteTotals.vat.toString()}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="bid-bond-premium">PRIMA</Label>
          <CurrencyInput
            placeholder="$0"
            readOnly
            value={
              quoteTotals.premium === 0 ? "" : quoteTotals.premium.toString()
            }
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="bid-bond-total">TOTAL</Label>
          <CurrencyInput
            readOnly
            placeholder="$0"
            value={totalWithExpenses === 0 ? "" : totalWithExpenses.toString()}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <Switch
          id="bid-bond-calculate-taxes"
          checked={calculateTaxes}
          onCheckedChange={setCalculateTaxes}
        />
        <Label htmlFor="bid-bond-calculate-taxes">
          Calcular IVA de los gastos
        </Label>
      </div>
    </div>
  );
};

export default BidBondResult;
