"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/components/aegis/color-picker";
import { Field } from "@/components/aegis/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Id } from "@/convex/_generated/dataModel";
import { bgCustomColors, type CustomColor } from "@/lib/custom-colors";
import { cn } from "@/lib/utils";
import { useUpdateCompany } from "../../api";
import { LogoUploader } from "./logo-uploader";
import { SettingsSection } from "./settings-section";
import { useDirtyRecord } from "./use-dirty-field";

type TaxIdType = "nit" | "cc" | "ce" | "passport";

const TAX_ID_OPTIONS: { value: TaxIdType; label: string }[] = [
  { value: "nit", label: "NIT" },
  { value: "cc", label: "Cédula de ciudadanía" },
  { value: "ce", label: "Cédula de extranjería" },
  { value: "passport", label: "Pasaporte" },
];

interface BrandIdentitySectionProps {
  companyId: Id<"companies">;
  canEdit: boolean;
  initial: {
    name: string;
    legalName?: string;
    taxIdType?: TaxIdType;
    taxIdNumber?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  logoUrl?: string | null;
}

/**
 * Sección consolidada: cómo se identifica la agencia frente a clientes y
 * frente al fisco, más sus acentos visuales. Reemplaza las antiguas
 * Identidad / Identificación tributaria / Colores de marca.
 */
export function BrandIdentitySection({
  companyId,
  canEdit,
  initial,
  logoUrl,
}: BrandIdentitySectionProps) {
  const { mutate, isPending } = useUpdateCompany();
  const [saving, setSaving] = useState(false);

  const { draft, set, reset, dirty } = useDirtyRecord({
    name: initial.name ?? "",
    legalName: initial.legalName ?? "",
    taxIdType: (initial.taxIdType ?? "nit") as TaxIdType,
    taxIdNumber: initial.taxIdNumber ?? "",
    primaryColor: initial.primaryColor ?? "",
    secondaryColor: initial.secondaryColor ?? "",
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      toast.error("El nombre comercial es obligatorio");
      return;
    }
    setSaving(true);
    mutate(
      {
        id: companyId,
        name: draft.name.trim(),
        legalName: draft.legalName?.trim() || undefined,
        taxIdType: draft.taxIdType,
        taxIdNumber: draft.taxIdNumber?.trim() || undefined,
        primaryColor: draft.primaryColor || undefined,
        secondaryColor: draft.secondaryColor || undefined,
      },
      {
        onSuccess: () => toast.success("Identidad actualizada"),
        onError: () => toast.error("No se pudo guardar"),
        onSettled: () => setSaving(false),
      },
    );
  };

  return (
    <SettingsSection
      icon={Sparkles}
      title="Identidad de marca"
      description="Cómo se ve, se llama y se identifica tu agencia"
      dirty={dirty}
      canEdit={canEdit}
      isSaving={saving || isPending}
      onSubmit={onSubmit}
      onReset={reset}
    >
      {/* Logo + nombres */}
      <LogoUploader
        companyId={companyId}
        companyName={draft.name || initial.name}
        logoUrl={logoUrl}
        canEdit={canEdit}
      />

      <Field
        id="company-name"
        label="Nombre comercial"
        value={draft.name}
        onChange={(v) => set("name", v)}
        readOnly={!canEdit}
        maxLength={80}
        placeholder="Mi Agencia de Seguros"
      />

      <Field
        id="company-legal-name"
        label="Razón social"
        value={draft.legalName ?? ""}
        onChange={(v) => set("legalName", v)}
        readOnly={!canEdit}
        maxLength={120}
        placeholder="Mi Agencia de Seguros S.A.S."
      />

      {/* Documento */}
      <SubGroup label="Documento">
        <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
          <div className="grid gap-1">
            <Label htmlFor="tax-id-type" className="text-xs">
              Tipo
            </Label>
            <Select
              value={draft.taxIdType}
              onValueChange={(v) => set("taxIdType", v as TaxIdType)}
              disabled={!canEdit}
            >
              <SelectTrigger id="tax-id-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAX_ID_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field
            id="tax-id-number"
            label="Número"
            value={draft.taxIdNumber ?? ""}
            onChange={(v) => set("taxIdNumber", v)}
            readOnly={!canEdit}
            placeholder="900.123.456-7"
            maxLength={40}
          />
        </div>
      </SubGroup>

      {/* Colores */}
      <SubGroup label="Colores">
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorField
            label="Primario"
            value={draft.primaryColor}
            onChange={(v) => set("primaryColor", v)}
            disabled={!canEdit}
          />
          <ColorField
            label="Secundario"
            value={draft.secondaryColor}
            onChange={(v) => set("secondaryColor", v)}
            disabled={!canEdit}
          />
        </div>
      </SubGroup>
    </SettingsSection>
  );
}

function SubGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border/50 pt-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "size-9 shrink-0 rounded-lg border",
            value ? bgCustomColors[value as CustomColor] : "bg-muted",
          )}
        />
        <div className="flex-1">
          <ColorPicker
            value={value || undefined}
            onChange={onChange}
            disabled={disabled}
            placeholder="Selecciona un color"
          />
        </div>
      </div>
    </div>
  );
}
