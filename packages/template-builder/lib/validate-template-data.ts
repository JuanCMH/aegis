import type {
  TemplateSection,
  TemplateValues,
} from "@/packages/template-builder/types";

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const URL_RE = /^https?:\/\/.+/;

/**
 * Valida un mapa de valores contra una lista de secciones de plantilla.
 * Entity-agnostic: no asume `name`, `identificationNumber`, ni nada similar.
 * Cada paquete consumidor pasa los `values` ya proyectados con los IDs fijos
 * mapeados al esquema dinámico.
 */
export function validateTemplateData(
  sections: TemplateSection[],
  values: TemplateValues,
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const section of sections) {
    for (const field of section.fields) {
      const raw = values[field.id];
      const strVal = typeof raw === "string" ? raw.trim() : "";
      const isEmpty = raw == null || raw === "" || strVal === "";

      // Required check
      if (field.required && isEmpty) {
        errors[field.id] = `${field.label} es obligatorio`;
        continue;
      }

      if (isEmpty) continue;

      const { config } = field;

      // Text / textarea length checks
      if (field.type === "text" || field.type === "textarea") {
        if (config.minLength && strVal.length < config.minLength) {
          errors[field.id] =
            `${field.label} debe tener al menos ${config.minLength} caracteres`;
        } else if (config.maxLength && strVal.length > config.maxLength) {
          errors[field.id] =
            `${field.label} no puede exceder ${config.maxLength} caracteres`;
        }
      }

      // Number / currency range checks
      if (field.type === "number" || field.type === "currency") {
        const num = Number(raw);
        if (Number.isNaN(num)) {
          errors[field.id] = `${field.label} debe ser un número válido`;
        } else if (config.minValue != null && num < config.minValue) {
          errors[field.id] =
            `${field.label} debe ser al menos ${config.minValue}`;
        } else if (config.maxValue != null && num > config.maxValue) {
          errors[field.id] =
            `${field.label} no puede exceder ${config.maxValue}`;
        }
      }

      // Email format
      if (field.type === "email" && !EMAIL_RE.test(strVal)) {
        errors[field.id] = `${field.label} no es un correo válido`;
      }

      // Phone format
      if (field.type === "phone" && !PHONE_RE.test(strVal)) {
        errors[field.id] = `${field.label} no es un teléfono válido`;
      }

      // URL format
      if (field.type === "url" && !URL_RE.test(strVal)) {
        errors[field.id] = `${field.label} no es una URL válida`;
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
