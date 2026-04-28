"use client";

import { ShieldCheck } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AegisModal,
  AegisModalContent,
  AegisModalFooter,
  AegisModalHeader,
  DialogClose,
} from "@/components/aegis/aegis-modal";
import { Field } from "@/components/aegis/field";
import { TaxPicker } from "@/components/aegis/tax-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCreateBond, useUpdateBond } from "../../api";
import type { BondDoc } from "../../types";

interface BondCatalogFormModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  companyId: Id<"companies">;
  row: BondDoc | null;
}

interface FormState {
  name: string;
  code: string;
  description: string;
  defaultRate: string;
}

const emptyState: FormState = {
  name: "",
  code: "",
  description: "",
  defaultRate: "",
};

export function BondCatalogFormModal({
  open,
  setOpen,
  companyId,
  row,
}: BondCatalogFormModalProps) {
  const isEdit = Boolean(row);
  const [form, setForm] = useState<FormState>(emptyState);

  const { mutate: createRow, isPending: isCreating } = useCreateBond();
  const { mutate: updateRow, isPending: isUpdating } = useUpdateBond();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (row) {
      setForm({
        name: row.name,
        code: row.code ?? "",
        description: row.description ?? "",
        defaultRate:
          row.defaultRate !== undefined ? String(row.defaultRate) : "",
      });
    } else {
      setForm(emptyState);
    }
  }, [open, row]);

  const canSubmit = form.name.trim().length > 0;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    const rate = form.defaultRate.trim() ? Number(form.defaultRate) : undefined;

    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim() || undefined,
      defaultRate: rate,
    };

    if (isEdit && row) {
      await updateRow(
        { id: row._id, ...payload },
        {
          onSuccess: () => {
            toast.success("Amparo actualizado");
            setOpen(false);
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      );
      return;
    }

    await createRow(
      { companyId, ...payload },
      {
        onSuccess: () => {
          toast.success("Amparo creado");
          setOpen(false);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <AegisModal open={open} onOpenChange={setOpen} maxWidth="sm:max-w-lg">
      <AegisModalHeader
        icon={ShieldCheck}
        iconClassName="bg-aegis-amber/10 border-aegis-amber/10 text-aegis-amber"
        title={isEdit ? "Editar amparo" : "Nuevo amparo"}
        description={
          isEdit
            ? "Actualiza los datos del amparo."
            : "Agrega un amparo al catálogo de tu agencia."
        }
      />
      <form
        id="bond-catalog-form"
        onSubmit={handleSubmit}
        className="contents"
        noValidate
      >
        <AegisModalContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Nombre *"
              htmlFor="bond-name"
              required
              autoFocus
              maxLength={80}
              value={form.name}
              disabled={isPending}
              onChange={(v) => update("name", v)}
              className="sm:col-span-2"
            />
            <Field
              label="Abreviatura"
              htmlFor="bond-code"
              placeholder="Ej. SERIEDAD, CUMPL"
              maxLength={20}
              value={form.code}
              disabled={isPending}
              onChange={(v) => update("code", v.toUpperCase())}
            />
            <div className="grid w-full items-center gap-1">
              <Label htmlFor="bond-rate" className="text-xs line-clamp-1">
                Tasa por defecto
              </Label>
              <TaxPicker
                placeholder="Selecciona una tasa"
                disabled={isPending}
                value={form.defaultRate}
                onChange={(v) => update("defaultRate", v)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="bond-description"
                className="text-xs line-clamp-1"
              >
                Descripción
              </Label>
              <Textarea
                id="bond-description"
                maxLength={500}
                placeholder="Breve descripción del alcance del amparo…"
                value={form.description}
                disabled={isPending}
                onChange={(e) => update("description", e.target.value)}
                className="h-24 resize-none"
              />
            </div>
          </div>
        </AegisModalContent>
        <AegisModalFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="bond-catalog-form"
            disabled={!canSubmit || isPending}
          >
            {isEdit ? "Guardar cambios" : "Crear amparo"}
          </Button>
        </AegisModalFooter>
      </form>
    </AegisModal>
  );
}
