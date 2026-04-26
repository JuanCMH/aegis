"use client";

import { Building2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/aegis/field";
import { cn } from "@/lib/utils";
import type { ContractDataType } from "../../types";

interface PartiesSectionProps {
  value: ContractDataType;
  onChange: (next: ContractDataType) => void;
  /** Si la cotización está vinculada a un cliente, mostramos badge `Desde cliente`. */
  clientLinked?: boolean;
  readOnly?: boolean;
  className?: string;
}

/**
 * Sección 3 del formulario: Partes del contrato (contratista + contratante).
 * Layout en sub-cards lado a lado para alta legibilidad.
 */
export function PartiesSection({
  value,
  onChange,
  clientLinked,
  readOnly,
  className,
}: PartiesSectionProps) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-2", className)}>
      <PartyCard
        title="Contratista / Afianzado"
        icon={<User className="size-4" />}
        nameLabel="NOMBRE COMPLETO*"
        nameValue={value.contractor}
        idLabel="IDENTIFICACIÓN"
        idValue={value.contractorId}
        readOnly={readOnly}
        showLinkedBadge={clientLinked}
        onNameChange={(v) => onChange({ ...value, contractor: v })}
        onIdChange={(v) => onChange({ ...value, contractorId: v })}
      />
      <PartyCard
        title="Contratante / Asegurado"
        icon={<Building2 className="size-4" />}
        nameLabel="NOMBRE COMPLETO*"
        nameValue={value.contractee}
        idLabel="IDENTIFICACIÓN"
        idValue={value.contracteeId}
        readOnly={readOnly}
        onNameChange={(v) => onChange({ ...value, contractee: v })}
        onIdChange={(v) => onChange({ ...value, contracteeId: v })}
      />
    </div>
  );
}

interface PartyCardProps {
  title: string;
  icon: React.ReactNode;
  nameLabel: string;
  nameValue: string;
  idLabel: string;
  idValue: string;
  readOnly?: boolean;
  showLinkedBadge?: boolean;
  onNameChange: (v: string) => void;
  onIdChange: (v: string) => void;
}

function PartyCard({
  title,
  icon,
  nameLabel,
  nameValue,
  idLabel,
  idValue,
  readOnly,
  showLinkedBadge,
  onNameChange,
  onIdChange,
}: PartyCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/80 p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md border border-aegis-sapphire/10 bg-aegis-sapphire/10 text-aegis-sapphire">
            {icon}
          </div>
          <p className="text-sm font-semibold tracking-tight">{title}</p>
        </div>
        {showLinkedBadge && (
          <Badge variant="secondary" className="text-[10px]">
            Desde cliente
          </Badge>
        )}
      </header>
      <div className="grid gap-2">
        <Field
          label={nameLabel}
          htmlFor={`${title}-name`}
          placeholder="Nombre"
          value={nameValue}
          readOnly={readOnly}
          onChange={onNameChange}
        />
        <Field
          label={idLabel}
          htmlFor={`${title}-id`}
          placeholder="9012345678"
          value={idValue}
          readOnly={readOnly}
          onChange={onIdChange}
        />
      </div>
    </div>
  );
}
