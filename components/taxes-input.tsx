import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TaxesInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const rateOptions = Array.from({ length: 36 }, (_, i) => {
  const value = 0.05 + i * 0.01;
  const text = value.toFixed(2);
  return { value: text, label: `${text}%` };
});

export function TaxesInput({
  value,
  onChange,
  placeholder,
  disabled,
}: TaxesInputProps) {
  return (
    <Select disabled={disabled} onValueChange={onChange} value={value}>
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
    </Select>
  );
}
