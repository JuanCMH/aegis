import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface BondPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  selectedBonds?: string[];
}

const bondOptions = [
  { value: "performance", label: "Garantía de Cumplimiento" },
  { value: "advance", label: "Garantía de Anticipo" },
];

export function BondPicker({
  value,
  onChange,
  placeholder,
  disabled,
  selectedBonds,
}: BondPickerProps) {
  return (
    <Select disabled={disabled} onValueChange={onChange} value={value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="flex max-h-48">
        {bondOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={
              selectedBonds?.includes(option.value) ? "text-sky-500" : ""
            }
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
