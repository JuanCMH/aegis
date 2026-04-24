import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaxPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  inputClassName?: string;
  triggerClassName?: string;
}

const toOptionValue = (num: number) => {
  const fixed = num.toFixed(2);
  return fixed.replace(/\.0+$/, "").replace(/(\.[0-9]*?)0+$/, "$1");
};

const toOptionLabel = (num: number) => `${num.toFixed(2)}%`;

const rateOptions = Array.from({ length: 36 }, (_, i) => {
  const numeric = (5 + i) / 100;
  return { value: toOptionValue(numeric), label: toOptionLabel(numeric) };
});

const normalizeValue = (value?: string) => {
  if (!value) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return toOptionValue(num);
};

export function TaxPicker({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  inputClassName,
  triggerClassName,
}: TaxPickerProps) {
  const normalizedValue = normalizeValue(value);
  const selectValue = normalizedValue ?? "";

  return (
    <Select disabled={disabled} onValueChange={onChange} value={selectValue}>
      {readOnly && (
        <Input
          readOnly
          value={normalizedValue ? `${normalizedValue}%` : ""}
          className={cn("cursor-default", inputClassName)}
        />
      )}
      {!readOnly && (
        <>
          <SelectTrigger className={cn("w-full", triggerClassName)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="flex max-h-48">
            {rateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </>
      )}
    </Select>
  );
}
