import { CurrencyInput } from "@/components/currency-input";
import { DatePicker } from "@/components/date-picker";
import { TaxPicker } from "@/components/tax-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BondDataType, ContractDataType } from "../types";
import { sanitizeDecimal, sanitizeInteger } from "@/lib/sanitize";
import { differenceInCalendarDays, isAfter, isBefore } from "date-fns";

interface BondProps {
  contractData: ContractDataType;
  bondData: BondDataType;
  setBondData: React.Dispatch<React.SetStateAction<BondDataType>>;
}

const AVG_DAYS_PER_MONTH = 30;

const Bond = ({ contractData, bondData, setBondData }: BondProps) => {
  const updateDays = (start: Date, end: Date) => {
    return differenceInCalendarDays(end, start);
  };

  const updateMonths = (days: number) => {
    const raw = days / AVG_DAYS_PER_MONTH;
    return Number(raw.toFixed(2));
  };

  const handleStartDateChange = (date: Date) => {
    if (isAfter(date, bondData.endDate)) return;
    setBondData((prev) => {
      const days = updateDays(date, prev.endDate);
      return { ...prev, startDate: date, days, months: updateMonths(days) };
    });
  };

  const handleEndDateChange = (date: Date) => {
    if (isBefore(date, bondData.startDate)) return;
    setBondData((prev) => {
      const days = updateDays(prev.startDate, date);
      return { ...prev, endDate: date, days, months: updateMonths(days) };
    });
  };

  const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  };

  const handleDaysChange = (days: number) => {
    const newEndDate = new Date(
      bondData.startDate.getTime() + days * 24 * 60 * 60 * 1000,
    );
    setBondData((prev) => ({
      ...prev,
      endDate: newEndDate,
      days,
      months: updateMonths(days),
    }));
  };

  const handleMonthsChange = (months: number) => {
    const days = months * AVG_DAYS_PER_MONTH;
    const newEndDate = new Date(
      bondData.startDate.getTime() + days * 24 * 60 * 60 * 1000,
    );
    setBondData((prev) => ({ ...prev, endDate: newEndDate, days, months }));
  };

  const handleRateChange = (value: string) => {
    setBondData((prev) => ({
      ...prev,
      rate: value === "" ? 0 : sanitizeDecimal(value),
    }));
  };

  const handlePercentageChange = (value: string) => {
    const num = value === "" ? 0 : sanitizeDecimal(value);
    const pct = clamp(num, 0, 100);
    setBondData((prev) => ({
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
    setBondData((prev) => ({
      ...prev,
      insuredValue: insured,
      percentage: clamp(pctFromValue, 0, 100),
    }));
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bond-start">DESDE</Label>
        <DatePicker
          date={bondData.startDate}
          onSelect={(date) => date && handleStartDateChange(date)}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bond-end">HASTA</Label>
        <DatePicker
          date={bondData.endDate}
          onSelect={(date) => date && handleEndDateChange(date)}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bond-days">DIAS</Label>
        <Input
          type="number"
          placeholder="365"
          id="bond-days"
          inputMode="numeric"
          min={0}
          step={1}
          value={bondData.days === 0 ? "" : bondData.days}
          onChange={(e) => handleDaysChange(sanitizeInteger(e.target.value))}
          onKeyDown={(e) => {
            if (["-", "+", "e", "E", ","].includes(e.key)) e.preventDefault();
          }}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bond-months">MESES</Label>
        <Input
          type="number"
          placeholder="12"
          id="bond-months"
          inputMode="numeric"
          min={0}
          value={bondData.months === 0 ? "" : bondData.months}
          onChange={(e) => handleMonthsChange(sanitizeDecimal(e.target.value))}
          onKeyDown={(e) => {
            if (["-", "+", "e", "E", ","].includes(e.key)) e.preventDefault();
          }}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bond-percentage">PORCENTAJE %</Label>
        <Input
          type="number"
          id="bond-percentage"
          placeholder="10"
          inputMode="numeric"
          min={0}
          max={100}
          disabled={contractData.contractValue === 0}
          value={bondData.percentage === 0 ? "" : bondData.percentage}
          onChange={(e) => handlePercentageChange(e.target.value)}
          onKeyDown={(e) => {
            if (["-", "+", "e", "E", ","].includes(e.key)) e.preventDefault();
          }}
        />
      </div>
      <div className="grid w-full items-center gap-1 col-span-2">
        <Label htmlFor="bond-insured-value">VALOR ASEGURADO</Label>
        <CurrencyInput
          placeholder="$20.000.000"
          disabled={contractData.contractValue === 0}
          value={bondData.insuredValue ? String(bondData.insuredValue) : ""}
          onChange={handleInsuredValueChange}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bond-rate">TASA %</Label>
        <TaxPicker
          placeholder="0"
          disabled={contractData.contractValue === 0}
          value={bondData.rate === 0 ? "" : String(bondData.rate)}
          onChange={handleRateChange}
        />
      </div>
    </div>
  );
};

export default Bond;
