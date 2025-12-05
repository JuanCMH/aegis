import { CurrencyInput } from "@/components/currency-input";
import { DatePicker } from "@/components/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction } from "react";
import { differenceInCalendarDays, isAfter, isBefore } from "date-fns";
import { BondDataType, ContractDataType } from "../types";
import { TaxesInput } from "@/components/taxes-input";

const AVG_DAYS_PER_MONTH = 30;

interface BidBondDataProps {
  contractData: ContractDataType;
  bidBondData: BondDataType;
  setBidBondData: Dispatch<SetStateAction<BondDataType>>;
}

const BidBondInfo = ({
  contractData,
  bidBondData,
  setBidBondData,
}: BidBondDataProps) => {
  const updateDays = (start: Date, end: Date) => {
    return differenceInCalendarDays(end, start);
  };

  const updateMonths = (days: number) => {
    const raw = days / AVG_DAYS_PER_MONTH;
    return Number(raw.toFixed(2));
  };

  const handleStartDateChange = (date: Date) => {
    if (isAfter(date, bidBondData.endDate)) return;
    setBidBondData((prev) => {
      const days = updateDays(date, prev.endDate);
      return { ...prev, startDate: date, days, months: updateMonths(days) };
    });
  };

  const handleEndDateChange = (date: Date) => {
    if (isBefore(date, bidBondData.startDate)) return;
    setBidBondData((prev) => {
      const days = updateDays(prev.startDate, date);
      return { ...prev, endDate: date, days, months: updateMonths(days) };
    });
  };

  const sanitizeInteger = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    return digits === "" ? 0 : Number(digits);
  };

  const sanitizeDecimal = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const normalized =
      parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : parts[0];
    if (normalized === "" || normalized === ".") return 0;
    return Number(normalized);
  };

  const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  };

  const handleDaysChange = (days: number) => {
    const newEndDate = new Date(
      bidBondData.startDate.getTime() + days * 24 * 60 * 60 * 1000,
    );
    setBidBondData((prev) => ({
      ...prev,
      endDate: newEndDate,
      days,
      months: updateMonths(days),
    }));
  };

  const handleMonthsChange = (months: number) => {
    const days = months * AVG_DAYS_PER_MONTH;
    const newEndDate = new Date(
      bidBondData.startDate.getTime() + days * 24 * 60 * 60 * 1000,
    );
    setBidBondData((prev) => ({ ...prev, endDate: newEndDate, days, months }));
  };

  const handleRateChange = (value: string) => {
    setBidBondData((prev) => ({
      ...prev,
      rate: value === "" ? 0 : sanitizeDecimal(value),
    }));
  };

  const handlePercentageChange = (value: string) => {
    const num = value === "" ? 0 : sanitizeDecimal(value);
    const pct = clamp(num, 0, 100);
    setBidBondData((prev) => ({
      ...prev,
      percentage: pct,
      insuredValue: (pct / 100) * contractData.contractValue,
    }));
  };

  const handleInsuredValueChange = (value: string) => {
    const raw = value === "" ? 0 : sanitizeInteger(value);
    const insured = clamp(raw, 0, contractData.contractValue);
    const pctFromValue =
      contractData.contractValue === 0
        ? 0
        : (insured / contractData.contractValue) * 100;
    setBidBondData((prev) => ({
      ...prev,
      insuredValue: insured,
      percentage: clamp(pctFromValue, 0, 100),
    }));
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bid-bond-start">DESDE</Label>
        <DatePicker
          date={bidBondData.startDate}
          onSelect={(date) => date && handleStartDateChange(date)}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bid-bond-end">HASTA</Label>
        <DatePicker
          date={bidBondData.endDate}
          onSelect={(date) => date && handleEndDateChange(date)}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bid-bond-days">DIAS</Label>
        <Input
          type="number"
          placeholder="365"
          id="bid-bond-days"
          inputMode="numeric"
          min={0}
          step={1}
          value={bidBondData.days === 0 ? "" : bidBondData.days}
          onChange={(e) => handleDaysChange(sanitizeInteger(e.target.value))}
          onKeyDown={(e) => {
            if (["-", "+", "e", "E", ","].includes(e.key)) e.preventDefault();
          }}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bid-bond-months">MESES</Label>
        <Input
          type="number"
          placeholder="12"
          id="bid-bond-months"
          inputMode="numeric"
          min={0}
          value={bidBondData.months === 0 ? "" : bidBondData.months}
          onChange={(e) => handleMonthsChange(sanitizeDecimal(e.target.value))}
          onKeyDown={(e) => {
            if (["-", "+", "e", "E", ","].includes(e.key)) e.preventDefault();
          }}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bid-bond-percentage">PORCENTAJE %</Label>
        <Input
          type="number"
          id="bid-bond-percentage"
          placeholder="10"
          inputMode="numeric"
          min={0}
          max={100}
          value={bidBondData.percentage === 0 ? "" : bidBondData.percentage}
          onChange={(e) => handlePercentageChange(e.target.value)}
          onKeyDown={(e) => {
            if (["-", "+", "e", "E", ","].includes(e.key)) e.preventDefault();
          }}
        />
      </div>
      <div className="grid w-full items-center gap-1 col-span-2">
        <Label htmlFor="bid-bond-insured-value">VALOR ASEGURADO</Label>
        <CurrencyInput
          placeholder="$20.000.000"
          value={
            bidBondData.insuredValue ? String(bidBondData.insuredValue) : ""
          }
          onChange={handleInsuredValueChange}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bid-bond-rate">TASA %</Label>
        <TaxesInput
          placeholder="0"
          value={bidBondData.rate === 0 ? "" : String(bidBondData.rate)}
          onChange={handleRateChange}
        />
      </div>
    </div>
  );
};
export default BidBondInfo;
