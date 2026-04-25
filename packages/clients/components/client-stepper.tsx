"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FIELD_GRID_CLASSES } from "@/packages/clients/lib/grid";
import type { TemplateSection } from "@/packages/clients/types";
import { DynamicField } from "./dynamic-field";

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
  const sorted = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections],
  );
  const [activeStep, setActiveStep] = useState(0);
  const activeSection = sorted[activeStep];
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Errors grouped by section id, so we can show a badge per tab.
  const errorsBySection = useMemo(() => {
    const map: Record<string, number> = {};
    if (!errors) return map;
    for (const section of sorted) {
      let count = 0;
      for (const field of section.fields) {
        if (errors[field.id]) count += 1;
      }
      if (count > 0) map[section.id] = count;
    }
    return map;
  }, [errors, sorted]);

  // When validation runs, jump to the first section with errors if the
  // active one is clean.
  useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) return;
    const activeHasErrors = activeSection
      ? errorsBySection[activeSection.id]
      : 0;
    if (activeHasErrors) return;
    const firstWithError = sorted.findIndex(
      (s) => errorsBySection[s.id] != null,
    );
    if (firstWithError >= 0) setActiveStep(firstWithError);
  }, [errors, errorsBySection, sorted, activeSection]);

  // Auto-scroll active tab into view.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !activeSection) return;
    const tab = scroller.querySelector<HTMLElement>(
      `[data-step-id="${activeSection.id}"]`,
    );
    tab?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeSection]);

  return (
    <div className="flex flex-col gap-5">
      {/* Steps — sticky strip with edge fades, only when more than one. */}
      {sorted.length > 1 && (
        <div className="-mx-8 sticky top-0 z-10 border-b border-border/40 bg-background/95 px-8 py-2 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="relative">
            <div
              ref={scrollerRef}
              className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Secciones del formulario"
            >
              {sorted.map((section, i) => {
                const errorCount = errorsBySection[section.id];
                const isActive = i === activeStep;
                return (
                  <button
                    key={section.id}
                    type="button"
                    data-step-id={section.id}
                    onClick={() => setActiveStep(i)}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    {section.label}
                    {errorCount ? (
                      <span
                        className={cn(
                          "flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-destructive/15 text-destructive",
                        )}
                        aria-label={`${errorCount} ${
                          errorCount === 1 ? "error" : "errores"
                        }`}
                      >
                        {errorCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {/* Edge fades to hint scrollable content */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-linear-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-background to-transparent" />
          </div>
        </div>
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
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-border/40 p-8 text-center">
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
