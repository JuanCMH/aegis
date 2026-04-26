/**
 * Tipos del paquete clients. Re-exportamos los primitivos del builder
 * compartido (`packages/template-builder/types`) y agregamos lo específico
 * del dominio cliente (ClientData).
 */
export type {
  FieldType,
  FieldSize,
  FieldConfig,
  TemplateField,
  TemplateSection,
} from "@/packages/template-builder/types";

export type ClientData = Record<string, unknown>;
