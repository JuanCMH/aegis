import { CurrencyInput } from "@/components/currency-input";
import { DatePicker } from "@/components/date-picker";
import { Field } from "@/components/field";
import { TaxPicker } from "@/components/tax-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeDecimal, sanitizeInteger } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import { ContractDataType } from "@/packages/quotes/types";
import {
  isAfter,
  isBefore,
  differenceInCalendarDays,
  differenceInCalendarMonths,
} from "date-fns";
import { Dispatch, SetStateAction } from "react";

interface BondProps {
  readOnly?: boolean;
  contractData: ContractDataType;
  startDate: Date;
  endDate: Date;
  percentage: number;
  insuredValue: number;
  rate: number;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setExpiryDate?: (date: Date) => void;
  setPercentage: (percentage: number) => void;
  setInsuredValue: (insuredValue: number) => void;
  setRate: (rate: number) => void;
}

const AVG_DAYS_PER_MONTH = 30;

const Bond = ({
  contractData,
  startDate,
  endDate,
  percentage,
  insuredValue,
  rate,
  setStartDate,
  setEndDate,
  setPercentage,
  setInsuredValue,
  setRate,
  readOnly = false,
  setExpiryDate,
}: BondProps) => {
  const handleStartDateChange = (date: Date) => {
    if (isAfter(date, endDate)) return;
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date) => {
    if (isBefore(date, startDate)) return;
    setEndDate(date);
  };

  const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  };

  const handleDaysChange = (days: number) => {
    const newEndDate = new Date(
      startDate.getTime() + days * 24 * 60 * 60 * 1000,
    );
    setEndDate(newEndDate);
  };

  const handleMonthsChange = (months: number) => {
    const days = months * AVG_DAYS_PER_MONTH;
    const newEndDate = new Date(
      startDate.getTime() + days * 24 * 60 * 60 * 1000,
    );
    setEndDate(newEndDate);
  };

  const handleRateChange = (value: string) => {
    const num = value === "" ? 0 : sanitizeDecimal(value);
    setRate(num);
  };

  const handlePercentageChange = (value: string) => {
    const raw = value === "" ? 0 : sanitizeDecimal(value);
    const clamped = clamp(raw, 0, 100);
    setPercentage(clamped);
    setInsuredValue(Math.round((contractData.contractValue * clamped) / 100));
  };

  const handleInsuredValueChange = (value: string) => {
    const num = value === "" ? 0 : sanitizeInteger(value);
    setInsuredValue(num);
    const calculatedPercentage =
      contractData.contractValue === 0
        ? 0
        : (num / contractData.contractValue) * 100;
    setPercentage(parseFloat(calculatedPercentage.toFixed(2)));
  };

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bond-start" className="text-xs">
          DESDE*
        </Label>
        <DatePicker
          readOnly={readOnly}
          date={startDate}
          onSelect={(date) => date && handleStartDateChange(date)}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bond-end" className="text-xs">
          HASTA*
        </Label>
        <DatePicker
          readOnly={readOnly}
          date={endDate}
          onSelect={(date) => date && handleEndDateChange(date)}
        />
      </div>
      {setExpiryDate !== undefined && (
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="bond-expiry" className="text-xs">
            VENCIMIENTO*
          </Label>
          <DatePicker
            date={endDate}
            readOnly={readOnly}
            onSelect={(date) => date && setExpiryDate(date)}
          />
        </div>
      )}
      <Field
        min={0}
        step={1}
        label="DIAS"
        type="number"
        placeholder="365"
        readOnly={readOnly}
        htmlFor="bond-days"
        inputMode="numeric"
        value={
          differenceInCalendarDays(endDate, startDate) === 0
            ? ""
            : differenceInCalendarDays(endDate, startDate)
        }
        onChange={(value) => handleDaysChange(sanitizeInteger(value))}
        onKeyDown={(e) => {
          if (["-", "+", "e", "E", ","].includes(e.key)) e.preventDefault();
        }}
      />
      <Field
        min={0}
        step={1}
        label="MESES"
        type="number"
        placeholder="12"
        readOnly={readOnly}
        htmlFor="bond-months"
        inputMode="numeric"
        value={
          differenceInCalendarMonths(endDate, startDate) === 0
            ? ""
            : differenceInCalendarMonths(endDate, startDate)
        }
        onChange={(value) => handleMonthsChange(sanitizeDecimal(value))}
        onKeyDown={(e) => {
          if (["-", "+", "e", "E", ","].includes(e.key)) e.preventDefault();
        }}
      />
      <Field
        min={0}
        max={100}
        step={0.01}
        label="PORCENTAJE %*"
        type="number"
        placeholder="10"
        readOnly={readOnly}
        htmlFor="bond-percentage"
        inputMode="numeric"
        disabled={contractData.contractValue === 0}
        value={percentage === 0 ? "" : percentage}
        onChange={(value) => handlePercentageChange(value)}
        onKeyDown={(e) => {
          if (["-", "+", "e", "E", ","].includes(e.key)) e.preventDefault();
        }}
      />
      <div
        className={cn(
          "grid w-full items-center gap-1",
          setExpiryDate ? "col-span-1" : "col-span-2",
        )}
      >
        <Label htmlFor="bond-insured-value" className="text-xs">
          VALOR ASEGURADO*
        </Label>
        <CurrencyInput
          readOnly={readOnly}
          placeholder="$20.000.000"
          disabled={contractData.contractValue === 0}
          value={insuredValue === 0 ? "" : String(insuredValue)}
          onChange={handleInsuredValueChange}
        />
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="bond-rate" className="text-xs">
          TASA %*
        </Label>
        <TaxPicker
          placeholder="0"
          readOnly={readOnly}
          onChange={handleRateChange}
          value={rate === 0 ? "" : String(rate)}
          disabled={contractData.contractValue === 0}
        />
      </div>
    </div>
  );
};

export default Bond;
