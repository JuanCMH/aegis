import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Hint } from "./hint";

interface CurrencyInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder,
  readOnly,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(
    value !== undefined
      ? new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }).format(Number(value))
      : "",
  );

  const formatCop = (num: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(num);

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
        className="w-full"
        readOnly={readOnly}
      />
    </Hint>
  );
}
