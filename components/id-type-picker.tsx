import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "./ui/select";
import { Input } from "./ui/input";

interface IdTypePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const options = [
  { value: "cc", label: "Cédula de ciudadanía" },
  { value: "ce", label: "Cédula de extranjería" },
  { value: "nit", label: "NIT" },
  { value: "passport", label: "Pasaporte" },
];

export function IdTypePicker({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
}: IdTypePickerProps) {
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
              placeholder={
                placeholder || "Seleccione un tipo de identificación"
              }
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
