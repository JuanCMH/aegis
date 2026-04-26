"use client";

import { Award, ShieldCheck } from "lucide-react";
import { useConfirm } from "@/components/hooks/use-confirm";
import { cn } from "@/lib/utils";
import type { QuoteType } from "../types";

interface QuoteTypeToggleProps {
  value: QuoteType | undefined;
  onChange: (value: QuoteType) => void;
  /**
   * Si `true`, cambiar de tipo dispara confirmación (porque hay datos en el
   * formulario que pueden perderse).
   */
  hasUnsavedData?: boolean;
  disabled?: boolean;
  className?: string;
}

const TYPES: Array<{
  id: QuoteType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "bidBond",
    title: "Seriedad de oferta",
    description: "Garantiza la propuesta durante el proceso de adjudicación.",
    icon: Award,
  },
  {
    id: "performanceBonds",
    title: "Cumplimiento",
    description:
      "Cubre el cumplimiento del contrato (anticipo, calidad, salarios, etc.).",
    icon: ShieldCheck,
  },
];

/**
 * Selector visual XL del tipo de cotización. Usado como Sección 1 del form.
 */
export function QuoteTypeToggle({
  value,
  onChange,
  hasUnsavedData,
  disabled,
  className,
}: QuoteTypeToggleProps) {
  const [ConfirmDialog, confirm] = useConfirm({
    title: "Cambiar tipo de cotización",
    message:
      "Cambiar el tipo recalcula los amparos por defecto y puede sobrescribir tu configuración actual. ¿Quieres continuar?",
    type: "warning",
    confirmText: "Cambiar tipo",
  });

  const handleSelect = async (next: QuoteType) => {
    if (next === value) return;
    if (hasUnsavedData && value) {
      const ok = await confirm();
      if (!ok) return;
    }
    onChange(next);
  };

  return (
    <>
      <ConfirmDialog />
      <div
        role="radiogroup"
        aria-label="Tipo de cotización"
        className={cn("grid gap-3 md:grid-cols-2", className)}
      >
        {TYPES.map((t) => {
          const active = value === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => handleSelect(t.id)}
              className={cn(
                "group flex items-start gap-3 rounded-xl border p-4 text-left transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-aegis-sapphire bg-aegis-sapphire/5 shadow-sm"
                  : "border-border bg-card hover:border-aegis-sapphire/40 hover:bg-accent/30",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg transition",
                  active
                    ? "bg-aegis-sapphire text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-aegis-sapphire/10 group-hover:text-aegis-sapphire",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold">{t.title}</span>
                <span className="text-xs text-muted-foreground">
                  {t.description}
                </span>
              </span>
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 size-3.5 shrink-0 rounded-full border-2 transition",
                  active
                    ? "border-aegis-sapphire bg-aegis-sapphire"
                    : "border-border bg-background group-hover:border-aegis-sapphire/40",
                )}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}
