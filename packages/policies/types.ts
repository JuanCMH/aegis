/**
 * Tipos del paquete policies. Re-exportamos los primitivos del builder
 * compartido (`packages/template-builder/types`) y agregamos lo específico
 * del dominio póliza (PolicyData, PolicyStatus).
 */
export type {
  FieldType,
  FieldSize,
  FieldConfig,
  TemplateField,
  TemplateSection,
} from "@/packages/template-builder/types";

export type PolicyData = Record<string, unknown>;

export type PolicyStatus = "active" | "expired" | "canceled" | "pending";
