import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Dispatch, SetStateAction } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { BondDataType } from "@/packages/bonds/types";

interface BondPickerProps {
  value?: Id<"bonds">;
  onChange?: Dispatch<SetStateAction<Id<"bonds"> | undefined>>;
  placeholder?: string;
  disabled?: boolean;
  bonds: Array<BondDataType>;
}

export function BondPicker({
  bonds,
  value,
  disabled,
  onChange,
  placeholder,
}: BondPickerProps) {
  const onValueChange = (value: string) => {
    if (onChange) {
      onChange(value as Id<"bonds">);
    }
  };

  return (
    <Select
      disabled={disabled}
      value={value || "total"}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="flex max-h-48">
        <SelectItem value="total" className="cursor-pointer">
          Total
        </SelectItem>
        {bonds?.map((bond) => {
          if (bond.id) {
            return (
              <SelectItem
                key={bond.id}
                value={bond.id}
                className="cursor-pointer"
              >
                {bond.name}
              </SelectItem>
            );
          }
        })}
      </SelectContent>
    </Select>
  );
}
