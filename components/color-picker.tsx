import { cn } from "@/lib/utils";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "./ui/select";
import { bgCustomColors, CustomColor, customColors } from "@/lib/custom-colors";

interface ColorPickerProps {
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const isCustomColor = (value: unknown): value is CustomColor => {
  if (typeof value !== "string") return false;
  return Object.keys(customColors).includes(value);
};

export function ColorPicker({
  value,
  disabled,
  onChange,
  placeholder,
}: ColorPickerProps) {
  return (
    <Select disabled={disabled} onValueChange={onChange} value={value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(customColors).map(([color, name]) => (
          <SelectItem key={color} value={color}>
            <div
              className={cn(
                isCustomColor(color) && bgCustomColors[color],
                "size-4 rounded-full inline-block mr-2",
              )}
            />
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
