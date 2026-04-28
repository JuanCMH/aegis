"use client";

import { Tag } from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import {
  AegisModal,
  AegisModalContent,
  AegisModalFooter,
  AegisModalHeader,
  DialogClose,
} from "@/components/aegis/aegis-modal";
import { Field } from "@/components/aegis/field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCreateLineOfBusiness, useUpdateLineOfBusiness } from "../../api";
import type { LineOfBusinessDoc } from "../../types";

interface LineOfBusinessFormModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  companyId: Id<"companies">;
  row: LineOfBusinessDoc | null;
}

interface FormState {
  name: string;
  code: string;
  description: string;
  defaultCommission: string;
}

const emptyState: FormState = {
  name: "",
  code: "",
  description: "",
  defaultCommission: "",
};

export function LineOfBusinessFormModal({
  open,
  setOpen,
  companyId,
  row,
}: LineOfBusinessFormModalProps) {
  const isEdit = Boolean(row);
  const [form, setForm] = useState<FormState>(emptyState);

  const { mutate: createRow, isPending: isCreating } =
    useCreateLineOfBusiness();
  const { mutate: updateRow, isPending: isUpdating } =
    useUpdateLineOfBusiness();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (row) {
      setForm({
        name: row.name,
        code: row.code ?? "",
        description: row.description ?? "",
        defaultCommission:
          row.defaultCommission !== undefined
            ? String(row.defaultCommission)
            : "",
      });
    } else {
      setForm(emptyState);
    }
  }, [open, row]);

  const commissionError = useMemo(() => {
    if (!form.defaultCommission.trim()) return null;
    const n = Number(form.defaultCommission);
    if (!Number.isFinite(n)) return "Debe ser un número";
    if (n < 0 || n > 100) return "Entre 0 y 100";
    return null;
  }, [form.defaultCommission]);

  const canSubmit = form.name.trim().length > 0 && commissionError === null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    const commission = form.defaultCommission.trim()
      ? Number(form.defaultCommission)
      : undefined;

    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim() || undefined,
      defaultCommission: commission,
    };

    if (isEdit && row) {
      await updateRow(
        { id: row._id, ...payload },
        {
          onSuccess: () => {
            toast.success("Ramo actualizado");
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
          toast.success("Ramo creado");
          setOpen(false);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <AegisModal open={open} onOpenChange={setOpen} maxWidth="sm:max-w-lg">
      <AegisModalHeader
        icon={Tag}
        iconClassName="bg-aegis-cyan/10 border-aegis-cyan/10 text-aegis-cyan"
        title={isEdit ? "Editar ramo" : "Nuevo ramo"}
        description={
          isEdit
            ? "Actualiza los datos del ramo o línea de negocio."
            : "Agrega un ramo al catálogo de tu agencia."
        }
      />
      <form
        id="line-of-business-form"
        onSubmit={handleSubmit}
        className="contents"
        noValidate
      >
        <AegisModalContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Nombre *"
              htmlFor="lob-name"
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
              htmlFor="lob-code"
              placeholder="Ej. AUTO, VIDA"
              maxLength={20}
              value={form.code}
              disabled={isPending}
              onChange={(v) => update("code", v.toUpperCase())}
            />
            <Field
              label="Comisión por defecto (%)"
              htmlFor="lob-commission"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="0.01"
              placeholder="Ej. 15"
              value={form.defaultCommission}
              disabled={isPending}
              onChange={(v) => update("defaultCommission", v)}
              inputClassName={commissionError ? "border-destructive" : ""}
            />
            {commissionError && (
              <p className="text-xs text-destructive sm:col-span-2 -mt-1">
                {commissionError}
              </p>
            )}
            <div className="sm:col-span-2">
              <Label htmlFor="lob-description" className="text-xs line-clamp-1">
                Descripción
              </Label>
              <Textarea
                id="lob-description"
                maxLength={500}
                placeholder="Breve descripción del alcance del ramo…"
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
            form="line-of-business-form"
            disabled={!canSubmit || isPending}
          >
            {isEdit ? "Guardar cambios" : "Crear ramo"}
          </Button>
        </AegisModalFooter>
      </form>
    </AegisModal>
  );
}
