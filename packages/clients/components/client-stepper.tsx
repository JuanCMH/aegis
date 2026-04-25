"use client";

import { cn } from "@/lib/utils";
import { DynamicField } from "./dynamic-field";
import { FIELD_GRID_CLASSES } from "@/packages/clients/lib/grid";
import type { TemplateSection } from "@/packages/clients/types";
import { useState } from "react";

interface ClientStepperProps {
  sections: TemplateSection[];
  values: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  readOnly?: boolean;
  onFileUpload?: (fieldId: string, file: File) => void;
  resolvedFiles?: Record<string, string>;
  aiFields?: Set<string>;
  errors?: Record<string, string>;
}

export function ClientStepper({
  sections,
  values,
  onChange,
  readOnly,
  onFileUpload,
  resolvedFiles,
  aiFields,
  errors,
}: ClientStepperProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const [activeStep, setActiveStep] = useState(0);
  const activeSection = sorted[activeStep];

  return (
    <div className="flex flex-col gap-4">
      {/* Steps */}
      {sorted.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto px-1">
          {sorted.map((section, i) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveStep(i)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                i === activeStep
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      )}

      {/* Section title */}
      {sorted.length <= 1 && activeSection && (
        <h3 className="text-sm font-medium tracking-tight">
          {activeSection.label}
        </h3>
      )}

      {/* Fields grid */}
      {activeSection && (
        <div className={FIELD_GRID_CLASSES}>
          {activeSection.fields.map((field) => (
            <DynamicField
              key={field.id}
              field={field}
              value={values[field.id]}
              onChange={onChange}
              readOnly={readOnly}
              onFileUpload={onFileUpload}
              resolvedFileUrl={resolvedFiles?.[field.id]}
              isAiFilled={aiFields?.has(field.id)}
              error={errors?.[field.id]}
            />
          ))}
          {activeSection.fields.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center border border-dashed border-border/40 rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Esta sección no tiene campos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
