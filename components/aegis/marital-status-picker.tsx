import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "./ui/select";
import { Input } from "./ui/input";

interface MaritalStatusPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const options = [
  { value: "single", label: "Soltero/a" },
  { value: "married", label: "Casado/a" },
  { value: "union_libre", label: "Unión libre" },
  { value: "divorced", label: "Divorciado/a" },
  { value: "widowed", label: "Viudo/a" },
];

export function MaritalStatusPicker({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
}: MaritalStatusPickerProps) {
  return (
    <Select
      key={value}
      value={value}
      disabled={disabled}
      onValueChange={onChange}
    >
      {readOnly && (
        <Input
          readOnly
          value={options.find((option) => option.value === value)?.label || ""}
          className="cursor-default"
        />
      )}
      {!readOnly && (
        <>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={placeholder || "Seleccione un estado civil"}
            />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
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
