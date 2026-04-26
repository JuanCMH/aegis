"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/components/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type { QuoteSearchField } from "../types";

interface QuoteSearchInputProps {
  value: string;
  field: QuoteSearchField;
  onChange: (next: { term: string; field: QuoteSearchField }) => void;
  placeholder?: string;
  className?: string;
}

const FIELD_LABEL: Record<QuoteSearchField, string> = {
  contractor: "Contratista",
  contractee: "Contratante",
};

/**
 * Input de búsqueda con selector lateral (Contratista / Contratante).
 * Atajo `/` enfoca el input cuando no hay otro elemento activo. Debounced
 * 300ms antes de emitir.
 */
export function QuoteSearchInput({
  value,
  field,
  onChange,
  placeholder = "Buscar cotización…",
  className,
}: QuoteSearchInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [term, setTerm] = useState(value);
  const debounced = useDebounce(term, 300);

  // Keep external syncs (e.g. clear-all) reflected.
  useEffect(() => {
    setTerm(value);
  }, [value]);

  useEffect(() => {
    if (debounced === value) return;
    onChange({ term: debounced, field });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // `/` shortcut to focus.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleClear = () => {
    setTerm("");
    onChange({ term: "", field });
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "flex h-9 items-center gap-0 rounded-md border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          aria-label={`Buscar por ${FIELD_LABEL[field].toLowerCase()}`}
          className="h-9 border-0 bg-transparent pl-8 pr-7 shadow-none focus-visible:ring-0"
        />
        {term && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 gap-1 rounded-l-none border-l px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {FIELD_LABEL[field]}
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Buscar en
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onChange({ term, field: "contractor" })}
            className={cn(field === "contractor" && "bg-accent/50")}
          >
            Contratista
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange({ term, field: "contractee" })}
            className={cn(field === "contractee" && "bg-accent/50")}
          >
            Contratante
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
