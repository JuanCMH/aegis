import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Hint } from "./hint";
import { formatCop } from "@/lib/format-cop";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  inputClassName?: string;
}

const getDisplayValue = (value?: string) => {
  if (value === undefined || value === "") {
    return "";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value));
};

export function CurrencyInput({
  value,
  onChange,
  placeholder,
  readOnly,
  disabled,
  inputClassName,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(getDisplayValue(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numericValue = input.replace(/[^0-9]/g, "");
    if (numericValue) {
      const number = Number(numericValue);
      const formatted = formatCop(number);
      setDisplay(formatted);
      onChange && onChange(numericValue);
    } else {
      setDisplay("");
      onChange && onChange("");
    }
  };

  useEffect(() => {
    if (value === undefined || value === "") {
      setDisplay("");
      return;
    }
    const number = Number(value);
    if (!Number.isNaN(number)) {
      setDisplay(formatCop(number));
    }
  }, [value]);

  return (
    <Hint label={display} side="top">
      <Input
        type="text"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn("w-full", readOnly && "cursor-default", inputClassName)}
        readOnly={readOnly}
        disabled={disabled}
      />
    </Hint>
  );
}
