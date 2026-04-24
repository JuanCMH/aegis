"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Hint } from "@/components/hint";
import { PropsSingle } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RiArrowDownSLine } from "@remixicon/react";

interface DatePickerProps {
  date?: Date;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  onSelect?: PropsSingle["onSelect"];
}

export function DatePicker({
  date,
  onSelect,
  readOnly,
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
      <Hint label={hintText} side="top">
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              readOnly && "cursor-default",
              className,
            )}
          >
            <span className="truncate">{dateText}</span>
            {!readOnly && (
              <RiArrowDownSLine className="ml-auto h-4 w-4 shrink-0" />
            )}
          </Button>
        </PopoverTrigger>
      </Hint>
      {!readOnly && (
        <PopoverContent className="w-auto p-0">
          <Calendar
            locale={es}
            mode="single"
            selected={date}
            onSelect={onSelect}
            startMonth={new Date(1990, 0)}
            endMonth={new Date(2070, 11)}
          />
        </PopoverContent>
      )}
    </Popover>
  );
}
