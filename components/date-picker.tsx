"use client";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PropsSingle } from "react-day-picker";
import { RiArrowDownSLine } from "@remixicon/react";

interface DatePickerProps {
  date?: Date;
  onSelect?: PropsSingle["onSelect"];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function DatePicker({
  date,
  onSelect,
  disabled,
  className,
  placeholder,
}: DatePickerProps) {
  const dateText = date
    ? format(date, "dd/MM/yyyy", { locale: es })
    : placeholder || "Seleccionar fecha";
  const hintText = date ? format(date, "PPPP", { locale: es }) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <Hint label={hintText} side="top">
            <span className="truncate">{dateText}</span>
          </Hint>
          <RiArrowDownSLine className="ml-auto h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          locale={es}
          mode="single"
          selected={date}
          onSelect={onSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
