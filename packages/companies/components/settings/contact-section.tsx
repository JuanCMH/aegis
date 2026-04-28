"use client";

import { Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/aegis/field";
import type { Id } from "@/convex/_generated/dataModel";
import { useUpdateCompany } from "../../api";
import { SettingsSection } from "./settings-section";
import { useDirtyRecord } from "./use-dirty-field";

interface ContactSectionProps {
  companyId: Id<"companies">;
  canEdit: boolean;
  initial: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    website?: string;
  };
}

const HOSTNAME_LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/i;
const IPV4_SEGMENT = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

const isValidHostname = (hostname: string) => {
  if (hostname === "localhost") return true;

  const segments = hostname.split(".");
  if (
    segments.length === 4 &&
    segments.every((segment) => IPV4_SEGMENT.test(segment))
  ) {
    return true;
  }

  if (segments.length < 2) return false;

  return segments.every((segment) => HOSTNAME_LABEL.test(segment));
};

const isValidUrl = (v: string) => {
  const trimmed = v.trim();
  if (!trimmed) return true;
  if (/\s/.test(trimmed)) return false;

  try {
    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(normalized);

    if (!["http:", "https:"].includes(url.protocol)) return false;

    return isValidHostname(url.hostname);
  } catch {
    return false;
  }
};

export function ContactSection({
  companyId,
  canEdit,
  initial,
}: ContactSectionProps) {
  const { mutate, isPending } = useUpdateCompany();
  const [saving, setSaving] = useState(false);
  const { draft, set, reset, dirty } = useDirtyRecord({
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    whatsapp: initial.whatsapp ?? "",
    website: initial.website ?? "",
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const website = draft.website?.trim() ?? "";

    if (!isValidUrl(website)) {
      toast.error("La URL del sitio web no es válida");
      return;
    }
    setSaving(true);
    mutate(
      {
        id: companyId,
        email: draft.email?.trim() || undefined,
        phone: draft.phone?.trim() || undefined,
        whatsapp: draft.whatsapp?.trim() || undefined,
        website: website || undefined,
      },
      {
        onSuccess: () => toast.success("Contacto actualizado"),
        onError: () => toast.error("No se pudo guardar"),
        onSettled: () => setSaving(false),
      },
    );
  };

  return (
    <SettingsSection
      icon={Phone}
      title="Contacto"
      description="Cómo te contactan tus clientes"
      dirty={dirty}
      canEdit={canEdit}
      isSaving={saving || isPending}
      onSubmit={onSubmit}
      onReset={reset}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          id="company-email"
          label="Correo"
          type="email"
          value={draft.email ?? ""}
          onChange={(v) => set("email", v)}
          readOnly={!canEdit}
          placeholder="contacto@miagencia.com"
        />
        <Field
          id="company-website"
          label="Sitio web"
          value={draft.website ?? ""}
          onChange={(v) => set("website", v)}
          readOnly={!canEdit}
          placeholder="miagencia.com"
        />
        <Field
          id="company-phone"
          label="Teléfono"
          value={draft.phone ?? ""}
          onChange={(v) => set("phone", v)}
          readOnly={!canEdit}
          placeholder="+57 601 123 4567"
        />
        <Field
          id="company-whatsapp"
          label="WhatsApp"
          value={draft.whatsapp ?? ""}
          onChange={(v) => set("whatsapp", v)}
          readOnly={!canEdit}
          placeholder="+57 300 123 4567"
        />
      </div>
    </SettingsSection>
  );
}
