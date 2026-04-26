"use client";

import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { DynamicStepper } from "@/packages/template-builder/components/dynamic-stepper";
import type {
  TemplateSection,
  TemplateValues,
} from "@/packages/template-builder/types";

interface PolicyStepperProps {
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
   */
  companyId?: string;
}

/**
 * Wrapper específico de pólizas sobre `DynamicStepper`. Solo agrega el
 * `templateSettingsHref` apuntando al template builder de pólizas.
 */
export function PolicyStepper({
  companyId: companyIdProp,
  ...rest
}: PolicyStepperProps) {
  const ctxCompanyId = useCompanyId();
  const companyId = companyIdProp ?? ctxCompanyId;

  return (
    <DynamicStepper
      {...rest}
      templateSettingsHref={
        companyId
          ? `/companies/${companyId}/settings/policy-template`
          : undefined
      }
    />
  );
}
