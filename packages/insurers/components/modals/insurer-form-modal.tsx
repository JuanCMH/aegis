"use client";

import { Building2 } from "lucide-react";
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
import { useCreateInsurer, useUpdateInsurer } from "../../api";
import type { InsurerDoc } from "../../types";

interface InsurerFormModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  companyId: Id<"companies">;
  insurer: InsurerDoc | null;
}

interface FormState {
  name: string;
  taxId: string;
  website: string;
  email: string;
  phone: string;
  notes: string;
}

const emptyState: FormState = {
  name: "",
  taxId: "",
  website: "",
  email: "",
  phone: "",
  notes: "",
};

export function InsurerFormModal({
  open,
  setOpen,
  companyId,
  insurer,
}: InsurerFormModalProps) {
  const isEdit = Boolean(insurer);
  const [form, setForm] = useState<FormState>(emptyState);

  const { mutate: createInsurer, isPending: isCreating } = useCreateInsurer();
  const { mutate: updateInsurer, isPending: isUpdating } = useUpdateInsurer();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (insurer) {
      setForm({
        name: insurer.name,
        taxId: insurer.taxId ?? "",
        website: insurer.website ?? "",
        email: insurer.email ?? "",
        phone: insurer.phone ?? "",
        notes: insurer.notes ?? "",
      });
    } else {
      setForm(emptyState);
    }
  }, [open, insurer]);

  const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {
      name: form.name.trim(),
      taxId: form.taxId.trim() || undefined,
      website: form.website.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    if (isEdit && insurer) {
      await updateInsurer(
        { id: insurer._id, ...payload },
        {
          onSuccess: () => {
            toast.success("Aseguradora actualizada");
            setOpen(false);
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      );
      return;
    }

    await createInsurer(
      { companyId, ...payload },
      {
        onSuccess: () => {
          toast.success("Aseguradora creada");
          setOpen(false);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <AegisModal open={open} onOpenChange={setOpen} maxWidth="sm:max-w-lg">
      <AegisModalHeader
        icon={Building2}
        title={isEdit ? "Editar aseguradora" : "Nueva aseguradora"}
        description={
          isEdit
            ? "Actualiza los datos de contacto de la aseguradora."
            : "Registra una nueva aseguradora en tu catálogo."
        }
      />
      <form
        id="insurer-form"
        onSubmit={handleSubmit}
        className="contents"
        noValidate
      >
        <AegisModalContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Nombre *"
              htmlFor="insurer-name"
              required
              autoFocus
              maxLength={80}
              value={form.name}
              disabled={isPending}
              onChange={(v) => update("name", v)}
              className="sm:col-span-2"
            />
            <Field
              label="NIT / RUT"
              htmlFor="insurer-tax-id"
              maxLength={40}
              value={form.taxId}
              disabled={isPending}
              onChange={(v) => update("taxId", v)}
            />
            <Field
              label="Sitio web"
              htmlFor="insurer-website"
              type="url"
              placeholder="https://"
              maxLength={200}
              value={form.website}
              disabled={isPending}
              onChange={(v) => update("website", v)}
            />
            <Field
              label="Correo de contacto"
              htmlFor="insurer-email"
              type="email"
              maxLength={120}
              value={form.email}
              disabled={isPending}
              onChange={(v) => update("email", v)}
            />
            <Field
              label="Teléfono"
              htmlFor="insurer-phone"
              type="tel"
              maxLength={40}
              value={form.phone}
              disabled={isPending}
              onChange={(v) => update("phone", v)}
            />
            <div className="sm:col-span-2">
              <Label
                htmlFor="insurer-notes"
                className="text-xs line-clamp-1"
              >
                Notas internas
              </Label>
              <Textarea
                id="insurer-notes"
                maxLength={500}
                rows={3}
                placeholder="Referencias, horarios, comisiones estándar…"
                value={form.notes}
                disabled={isPending}
                onChange={(e) => update("notes", e.target.value)}
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
            form="insurer-form"
            disabled={!canSubmit || isPending}
          >
            {isEdit ? "Guardar cambios" : "Crear aseguradora"}
          </Button>
        </AegisModalFooter>
      </form>
    </AegisModal>
  );
}
