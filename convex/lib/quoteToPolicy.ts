/**
 * Builds a policies row payload from a quote + a policy template.
 *
 * - Top-level fixed fields are filled from the quote.
 * - Template `data` is prefilled by matching field labels against canonical
 *   contract concepts (contractor / contractee / contractValue / dates / etc.).
 * - Unknown template fields stay empty so the user can fill them after.
 *
 * Lives here because shared by the `quotes.convertToPolicy` mutation; pure
 * helper, no DB access.
 */
import type { Doc } from "../_generated/dataModel";

const TOMADOR_ALIASES = ["tomador", "afianzado", "contratista"];
const ASEGURADO_ALIASES = ["asegurado", "beneficiario", "contratante"];
const VALOR_ALIASES = [
  "valor_asegurado",
  "valor asegurado",
  "valor_contrato",
  "valor del contrato",
  "valorcontrato",
];
const TIPO_CONTRATO_ALIASES = [
  "tipo_contrato",
  "tipo de contrato",
  "tipo contrato",
];
const OBJETO_ALIASES = ["objeto", "agreement", "descripcion", "descripción"];
const FECHA_INICIO_ALIASES = [
  "fecha_inicio",
  "fecha inicio",
  "inicio",
  "vigencia_desde",
];
const FECHA_FIN_ALIASES = ["fecha_fin", "fecha fin", "fin", "vigencia_hasta"];

/**
 * Normalize a label for fuzzy match: lowercase + strip accents + collapse
 * whitespace.
 */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const matchesAny = (label: string, aliases: string[]): boolean => {
  const normalized = normalize(label);
  return aliases.some((alias) => normalized.includes(normalize(alias)));
};

interface TemplateField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  isFixed: boolean;
}
interface TemplateSection {
  id: string;
  label: string;
  order: number;
  fields: TemplateField[];
}

/**
 * Build the dynamic `data` payload for a new policy created from a quote.
 * Fixed fields (`policyNumber`, `status`, `startDate`, `endDate`, `clientId`,
 * `templateId`) are NOT part of `data` — they're written at top-level by the
 * caller.
 */
export const buildPolicyDataFromQuote = (
  quote: Doc<"quotes">,
  sections: TemplateSection[],
): Record<string, unknown> => {
  const data: Record<string, unknown> = {};

  for (const section of sections) {
    for (const field of section.fields) {
      if (field.isFixed) continue;

      if (matchesAny(field.label, TOMADOR_ALIASES)) {
        data[field.id] = quote.contractor;
        continue;
      }
      if (matchesAny(field.label, ASEGURADO_ALIASES)) {
        data[field.id] = quote.contractee;
        continue;
      }
      if (matchesAny(field.label, VALOR_ALIASES)) {
        data[field.id] = quote.contractValue;
        continue;
      }
      if (matchesAny(field.label, TIPO_CONTRATO_ALIASES)) {
        data[field.id] = quote.contractType;
        continue;
      }
      if (matchesAny(field.label, OBJETO_ALIASES)) {
        data[field.id] = quote.agreement;
        continue;
      }
      if (matchesAny(field.label, FECHA_INICIO_ALIASES)) {
        data[field.id] = quote.contractStart;
        continue;
      }
      if (matchesAny(field.label, FECHA_FIN_ALIASES)) {
        data[field.id] = quote.contractEnd;
        continue;
      }
    }
  }

  return data;
};
