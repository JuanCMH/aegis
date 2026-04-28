"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/aegis/field";
import type { Id } from "@/convex/_generated/dataModel";
import { useUpdateCompany } from "../../api";
import { SettingsSection } from "./settings-section";
import { useDirtyRecord } from "./use-dirty-field";

interface LocationSectionProps {
  companyId: Id<"companies">;
  canEdit: boolean;
  initial: {
    country?: string;
    department?: string;
    city?: string;
    address?: string;
  };
}

export function LocationSection({
  companyId,
  canEdit,
  initial,
}: LocationSectionProps) {
  const { mutate, isPending } = useUpdateCompany();
  const [saving, setSaving] = useState(false);
  const { draft, set, reset, dirty } = useDirtyRecord({
    country: initial.country ?? "Colombia",
    department: initial.department ?? "",
    city: initial.city ?? "",
    address: initial.address ?? "",
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    mutate(
      {
        id: companyId,
        country: draft.country?.trim() || undefined,
        department: draft.department?.trim() || undefined,
        city: draft.city?.trim() || undefined,
        address: draft.address?.trim() || undefined,
      },
      {
        onSuccess: () => toast.success("Ubicación actualizada"),
        onError: () => toast.error("No se pudo guardar"),
        onSettled: () => setSaving(false),
      },
    );
  };

  return (
    <SettingsSection
      icon={MapPin}
      title="Ubicación"
      description="Dirección física de la agencia"
      dirty={dirty}
      canEdit={canEdit}
      isSaving={saving || isPending}
      onSubmit={onSubmit}
      onReset={reset}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          id="company-country"
          label="País"
          value={draft.country ?? ""}
          onChange={(v) => set("country", v)}
          readOnly={!canEdit}
          placeholder="Colombia"
        />
        <Field
          id="company-department"
          label="Departamento"
          value={draft.department ?? ""}
          onChange={(v) => set("department", v)}
          readOnly={!canEdit}
          placeholder="Cundinamarca"
        />
        <Field
          id="company-city"
          label="Ciudad"
          value={draft.city ?? ""}
          onChange={(v) => set("city", v)}
          readOnly={!canEdit}
          placeholder="Bogotá"
        />
        <Field
          id="company-address"
          label="Dirección"
          value={draft.address ?? ""}
          onChange={(v) => set("address", v)}
          readOnly={!canEdit}
          placeholder="Calle 100 # 10 - 20"
        />
      </div>
    </SettingsSection>
  );
}
