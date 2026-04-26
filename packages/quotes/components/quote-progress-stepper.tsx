"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuoteCompletionStep, QuoteCompletionStepId } from "../types";

interface QuoteProgressStepperProps {
  steps: QuoteCompletionStep[];
  /** Section currently focused/visible (highlighted). */
  activeId?: QuoteCompletionStepId;
  onStepClick?: (id: QuoteCompletionStepId) => void;
  className?: string;
}

/**
 * Stepper horizontal en chips. Click hace scroll a la sección. El estado
 * "done" se refleja con un check en lugar del número. La sección activa se
 * marca con anillo.
 */
export function QuoteProgressStepper({
  steps,
  activeId,
  onStepClick,
  className,
}: QuoteProgressStepperProps) {
  return (
    <nav
      aria-label="Progreso del formulario"
      className={cn(
        "flex w-full items-center gap-1 overflow-x-auto rounded-lg border bg-card p-1 shadow-sm",
        className,
      )}
    >
      {steps.map((step, index) => {
        const active = activeId === step.id;
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick?.(step.id)}
            aria-current={active ? "step" : undefined}
            className={cn(
              "group flex h-8 shrink-0 items-center gap-2 rounded-md px-2.5 text-xs font-medium transition",
              active
                ? "bg-aegis-sapphire/10 text-aegis-sapphire"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold transition",
                step.done
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-aegis-sapphire text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20",
              )}
            >
              {step.done ? <Check className="size-3" /> : index + 1}
            </span>
            <span className="whitespace-nowrap">
              {step.label}
              {step.optional && (
                <span className="ml-1 text-[10px] font-normal opacity-60">
                  (opcional)
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
