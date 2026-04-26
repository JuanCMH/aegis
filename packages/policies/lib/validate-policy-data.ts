/**
 * Wrapper de compatibilidad. La validación es genérica y vive en
 * `packages/template-builder/lib/validate-template-data`. Aquí solo
 * exponemos un alias `validatePolicyData` consistente con el dominio.
 */
import {
  validateTemplateData,
  type ValidationResult,
} from "@/packages/template-builder/lib/validate-template-data";
import type { TemplateSection } from "@/packages/template-builder/types";

export type { ValidationResult };

export function validatePolicyData(
  sections: TemplateSection[],
  values: Record<string, unknown>,
): ValidationResult {
  return validateTemplateData(sections, values);
}
