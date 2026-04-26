/**
 * Tipos genéricos del builder de plantillas — compartidos entre cualquier
 * dominio que necesite formularios dinámicos (clients, policies, etc.).
 *
 * Ningún tipo aquí debe asumir un dominio específico. La forma del payload
 * persistido (los `values`) la decide cada paquete consumidor.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "select"
  | "phone"
  | "email"
  | "file"
  | "image"
  | "switch"
  | "url";

export type FieldSize = "small" | "medium" | "large" | "full";

export type FieldConfig = {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  options?: { label: string; value: string }[];
  acceptedFormats?: string[];
  maxFileSize?: number;
};

export type TemplateField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  size: FieldSize;
  sizeOverride?: { sm?: number; md?: number; lg?: number };
  showInTable: boolean;
  isFixed: boolean;
  config: FieldConfig;
};

export type TemplateSection = {
  id: string;
  label: string;
  order: number;
  fields: TemplateField[];
};

/** Genérico: cualquier mapa fieldId → valor. */
export type TemplateValues = Record<string, unknown>;
