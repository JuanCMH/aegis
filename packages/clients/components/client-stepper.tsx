"use client";

import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { DynamicStepper } from "@/packages/template-builder/components/dynamic-stepper";
import type {
  TemplateSection,
  TemplateValues,
} from "@/packages/template-builder/types";

interface ClientStepperProps {
  sections: TemplateSection[];
  values: TemplateValues;
  onChange: (fieldId: string, value: unknown) => void;
  readOnly?: boolean;
  onFileUpload?: (fieldId: string, file: File) => void;
  resolvedFiles?: Record<string, string>;
  aiFields?: Set<string>;
  errors?: Record<string, string>;
  isAiExtracting?: boolean;
  /**
   * Sobrescribe el companyId resuelto del contexto. Útil para SSR/testing.
   * Cuando no se pasa, usa el del store.
   */
  companyId?: string;
}

/**
 * Wrapper específico de clientes sobre `DynamicStepper`. Solo agrega el
 * `templateSettingsHref` apuntando al template builder de clientes.
 */
export function ClientStepper({
  companyId: companyIdProp,
  ...rest
}: ClientStepperProps) {
  const ctxCompanyId = useCompanyId();
  const companyId = companyIdProp ?? ctxCompanyId;

  return (
    <DynamicStepper
      {...rest}
      templateSettingsHref={
        companyId
          ? `/companies/${companyId}/settings/client-template`
          : undefined
      }
    />
  );
}
