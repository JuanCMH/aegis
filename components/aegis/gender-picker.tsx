import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "./ui/select";
import { Input } from "./ui/input";

interface GenderPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const options = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
  { value: "other", label: "Otro" },
];

export function GenderPicker({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
}: GenderPickerProps) {
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
            <SelectValue placeholder={placeholder || "Seleccione un género"} />
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
