import {
  Select,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MonthPickerProps {
  value?: string;
  disabled?: boolean;
  onChange: (month: string) => void;
}

const months = Array.from({ length: 12 }, (_, i) => i);
const years = Array.from({ length: 20 }, (_, i) => 2015 + i);

export const MonthPicker = ({
  value,
  onChange,
  disabled = false,
}: MonthPickerProps) => {
  return (
    <Select disabled={disabled} value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full md:w-auto capitalize h-8 px-3 text-xs md:h-9 md:px-4 md:text-sm">
        <SelectValue placeholder="Seleccionar mes">
          {value
            ? (() => {
                const [year, month] = value.split("-");
                const date = new Date(Number(year), Number(month) - 1, 1);
                return format(date, "MMMM yyyy", { locale: es });
              })()
            : "Seleccionar mes"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-48">
        {years.map((year) => (
          <SelectGroup key={year}>
            <SelectLabel className="pl-2 text-sky-500 font-bold">
              {year}
            </SelectLabel>
            {months.map((month) => {
              const date = new Date(year, month, 1);
              const optionValue = format(date, "yyyy-MM");
              const optionLabel = format(date, "MMMM", {
                locale: es,
              });
              return (
                <SelectItem
                  key={`${year}-${month}`}
                  value={optionValue}
                  className="flex cursor-pointer capitalize"
                >
                  {optionLabel} {year}
                </SelectItem>
              );
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};
