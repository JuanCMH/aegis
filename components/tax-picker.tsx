import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TaxPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
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
}: TaxPickerProps) {
  const normalizedValue = normalizeValue(value);

  return (
    <Select
      key={normalizedValue}
      disabled={disabled}
      onValueChange={onChange}
      value={normalizedValue}
    >
      {readOnly && (
        <Input
          readOnly
          value={`${normalizedValue}%`}
          className="cursor-default"
        />
      )}
      {!readOnly && (
        <>
          <SelectTrigger className="w-full">
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
