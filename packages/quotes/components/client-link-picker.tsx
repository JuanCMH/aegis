"use client";

import { ClientPicker } from "@/packages/policies/components/client-picker";
import type { Id } from "@/convex/_generated/dataModel";

interface ClientLinkPickerProps {
  value?: Id<"clients">;
  onChange: (id: Id<"clients"> | undefined) => void;
  readOnly?: boolean;
  selectedLabel?: string;
  selectedSubLabel?: string;
}

/**
 * Wrapper sobre el `ClientPicker` de pólizas, expuesto desde el dominio de
 * cotizaciones. Mantenemos esta capa porque el picker base vive en
 * `packages/policies` y queremos un import idiomático desde quotes.
 */
export function ClientLinkPicker(props: ClientLinkPickerProps) {
  return <ClientPicker {...props} />;
}
