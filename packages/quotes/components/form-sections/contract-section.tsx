"use client";

import { isAfter, isBefore } from "date-fns";
import { FileText, AlertCircle } from "lucide-react";
import { Field } from "@/components/aegis/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/aegis/date-picker";
import { CurrencyInput } from "@/components/aegis/currency-input";
import { cn } from "@/lib/utils";
import type { ContractDataType } from "../../types";

const CONTRACT_TYPES = [
  "Obra pública",
  "Suministro",
  "Servicios",
  "Consultoría",
  "Concesión",
  "Privado",
];

interface ContractSectionProps {
  value: ContractDataType;
  onChange: (next: ContractDataType) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * Sección 4 del formulario: Información del contrato. Grid 4-col en desktop,
 * 2-col en mobile. Validación reactiva de fechas con hint inline.
 */
export function ContractSection({
  value,
  onChange,
  readOnly,
  className,
}: ContractSectionProps) {
  const handleStart = (date: Date) => {
    if (!isBefore(date, value.contractEnd)) return;
    onChange({ ...value, contractStart: date });
  };
  const handleEnd = (date: Date) => {
    if (!isAfter(date, value.contractStart)) return;
    onChange({ ...value, contractEnd: date });
  };
  const datesInvalid = !isAfter(value.contractEnd, value.contractStart);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Field
          label="TIPO DE CONTRATO*"
          htmlFor="contract-type"
          placeholder="Obra pública"
          list="contract-type-suggestions"
          value={value.contractType}
          readOnly={readOnly}
          onChange={(v) => onChange({ ...value, contractType: v })}
        />
        <datalist id="contract-type-suggestions">
          {CONTRACT_TYPES.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contract-value" className="text-xs">
            VALOR DEL CONTRATO*
          </Label>
          <CurrencyInput
            placeholder="$200.000.000"
            readOnly={readOnly}
            value={
              value.contractValue === 0 ? "" : String(value.contractValue)
            }
            onChange={(v) =>
              onChange({
                ...value,
                contractValue: v === "" ? 0 : Number(v),
              })
            }
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contract-start" className="text-xs">
            INICIO*
          </Label>
          <DatePicker
            date={value.contractStart}
            readOnly={readOnly}
            onSelect={(d) => d && handleStart(d)}
          />
        </div>
        <div className="grid w-full items-center gap-1">
          <Label htmlFor="contract-end" className="text-xs">
            FIN*
          </Label>
          <DatePicker
            date={value.contractEnd}
            readOnly={readOnly}
            onSelect={(d) => d && handleEnd(d)}
          />
        </div>
      </div>
      <div className="grid w-full items-center gap-1">
        <Label htmlFor="contract-agreement" className="text-xs">
          OBJETO DEL CONTRATO
        </Label>
        <Textarea
          id="contract-agreement"
          placeholder="Descripción breve del objeto del contrato..."
          readOnly={readOnly}
          value={value.agreement}
          onChange={(e) => onChange({ ...value, agreement: e.target.value })}
          className="min-h-20 resize-y"
        />
      </div>
      {datesInvalid && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5" />
          La fecha de inicio debe ser anterior a la fecha de fin.
        </p>
      )}
    </div>
  );
}
