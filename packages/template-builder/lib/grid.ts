import type { FieldSize } from "@/packages/template-builder/types";

/**
 * Span responsivo de cada preset de tamaño.
 *
 * - Mobile (<640px) → 1 columna: full width (ergonomía táctil).
 * - Tablet (640–1024px) → 6 columnas.
 * - Desktop (≥1024px) → 12 columnas.
 *
 * Se usa tanto en el canvas del builder como en el render real
 * (`DynamicStepper` + `DynamicField`) para garantizar WYSIWYG.
 */
export const FIELD_SIZE_SPAN: Record<FieldSize, string> = {
  small: "col-span-1 sm:col-span-2 lg:col-span-3",
  medium: "col-span-1 sm:col-span-3 lg:col-span-6",
  large: "col-span-1 sm:col-span-4 lg:col-span-9",
  full: "col-span-1 sm:col-span-6 lg:col-span-12",
};

/** Clases del contenedor grid responsivo. */
export const FIELD_GRID_CLASSES =
  "grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-x-4 gap-y-5";
