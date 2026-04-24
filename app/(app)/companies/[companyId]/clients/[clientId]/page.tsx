"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Save, Pencil, X } from "lucide-react";
import { useClientId } from "@/packages/clients/store/use-client-id";
import { useGetClientById, useUpdateClient } from "@/packages/clients/api";
import { useGenerateUploadUrl } from "@/components/hooks/use-generate-upload-url";
import { ClientStepper } from "@/packages/clients/components/client-stepper";
import type { TemplateSection } from "@/packages/clients/types";
import { validateClientData } from "@/packages/clients/lib/validate-client-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleGate } from "@/packages/roles/components/role-gate";

export default function ClientDetailPage() {
  const clientId = useClientId();
  const client = useGetClientById({ id: clientId });
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [basicName, setBasicName] = useState("");
  const [basicId, setBasicId] = useState("");

  const sections: TemplateSection[] =
    (client.data?.templateSections as TemplateSection[] | undefined) ?? [];
  const hasTemplate = sections.length > 0;
  const resolvedFiles = (client.data?.resolvedFiles ?? {}) as Record<
    string,
    string
  >;

  // Sync values from client data
  useEffect(() => {
    if (client.data && !isEditing) {
      setValues((client.data.data as Record<string, unknown>) ?? {});
      setBasicName(client.data.name ?? "");
      setBasicId(client.data.identificationNumber ?? "");
    }
  }, [client.data, isEditing]);

  const handleChange = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setFieldErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    const url = await generateUploadUrl({});
    if (!url) return;

    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    setValues((prev) => ({ ...prev, [fieldId]: storageId }));
  };

  const handleSave = async () => {
    if (hasTemplate) {
      const { valid, errors } = validateClientData(sections, values);
      if (!valid) {
        setFieldErrors(errors);
        const count = Object.keys(errors).length;
        toast.error(`Hay ${count} campo${count > 1 ? "s" : ""} con errores`);
        return;
      }
      setFieldErrors({});
    }

    const name = hasTemplate
      ? ((values.field_name as string)?.trim() ?? "")
      : basicName.trim();
    const identificationNumber = hasTemplate
      ? ((values.field_identificationNumber as string)?.trim() ?? "")
      : basicId.trim();

    if (!name) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!identificationNumber) {
      toast.error("La identificación es obligatoria");
      return;
    }

    await updateClient(
      {
        id: clientId,
        name,
        identificationNumber,
        data: values,
      },
      {
        onSuccess: () => {
          toast.success("Cliente actualizado");
          setIsEditing(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFieldErrors({});
    if (client.data) {
      setValues((client.data.data as Record<string, unknown>) ?? {});
      setBasicName(client.data.name ?? "");
      setBasicId(client.data.identificationNumber ?? "");
    }
  };

  if (client.isLoading) {
    return (
      <main className="w-full h-full flex-1 flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

  if (!client.data) {
    return (
      <main className="w-full h-full flex-1 flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground">Cliente no encontrado</p>
      </main>
    );
  }

  return (
    <main className="w-full h-full flex-1 flex flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{client.data.name}</h1>
          <div className="ml-auto flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-border/40"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <X className="size-3.5" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="gap-1.5"
                >
                  <Save className="size-3.5" />
                  Guardar
                </Button>
              </>
            ) : (
              <RoleGate permission="clients_edit">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-border/40"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-3.5" />
                  Editar
                </Button>
              </RoleGate>
            )}
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4">
        {hasTemplate ? (
          <ClientStepper
            sections={sections}
            values={values}
            onChange={handleChange}
            readOnly={!isEditing}
            onFileUpload={handleFileUpload}
            resolvedFiles={resolvedFiles}
            errors={fieldErrors}
          />
        ) : (
          <div className="grid grid-cols-4 gap-3 max-w-2xl">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="basic-name" className="text-xs font-medium">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="basic-name"
                placeholder="Nombre del cliente"
                value={basicName}
                onChange={(e) => setBasicName(e.target.value)}
                readOnly={!isEditing}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="basic-id" className="text-xs font-medium">
                Identificación <span className="text-destructive">*</span>
              </Label>
              <Input
                id="basic-id"
                placeholder="Número de identificación"
                value={basicId}
                onChange={(e) => setBasicId(e.target.value)}
                readOnly={!isEditing}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
