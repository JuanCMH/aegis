import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "./ui/select";
import { Input } from "./ui/input";

interface PolicyStatusPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const options = [
  { value: "active", label: "Activa" },
  { value: "expired", label: "Vencida" },
  { value: "canceled", label: "Cancelada" },
  { value: "pending", label: "Pendiente" },
];

export function PolicyStatusPicker({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
}: PolicyStatusPickerProps) {
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
            <SelectValue placeholder={placeholder || "Seleccione un estado"} />
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
