"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  RiSave3Fill,
  RiEditLine,
  RiCloseLine,
} from "@remixicon/react";
import { useWorkspaceId } from "@/packages/workspaces/hooks/use-workspace-id";
import { useClientId } from "@/packages/clients/hooks/use-client-id";
import {
  useGetClientById,
  useGetClientTemplate,
  useUpdateClient,
} from "@/packages/clients/api";
import { useGenerateUploadUrl } from "@/components/hooks/use-generate-upload-url";
import { ClientStepper } from "@/packages/clients/components/client-stepper";
import type { TemplateSection } from "@/packages/clients/types";
import { validateClientData } from "@/packages/clients/lib/validate-client-data";

export default function ClientDetailPage() {
  const workspaceId = useWorkspaceId();
  const clientId = useClientId();
  const client = useGetClientById({ id: clientId });
  const template = useGetClientTemplate({ workspaceId });
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const sections = template.data?.sections as TemplateSection[] | undefined;
  const resolvedFiles = (client.data?.resolvedFiles ?? {}) as Record<
    string,
    string
  >;

  // Sync values from client data
  useEffect(() => {
    if (client.data && !isEditing) {
      setValues((client.data.data as Record<string, unknown>) ?? {});
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
    if (!sections) return;

    const { valid, errors } = validateClientData(sections, values);
    if (!valid) {
      setFieldErrors(errors);
      const count = Object.keys(errors).length;
      toast.error(`Hay ${count} campo${count > 1 ? "s" : ""} con errores`);
      return;
    }
    setFieldErrors({});

    const name = (values.field_name as string)?.trim() ?? "";
    const identificationNumber =
      (values.field_identificationNumber as string)?.trim() ?? "";

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
    }
  };

  if (client.isLoading || template.isLoading) {
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
                  <RiCloseLine className="size-3.5" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="gap-1.5"
                >
                  <RiSave3Fill className="size-3.5" />
                  Guardar
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-border/40"
                onClick={() => setIsEditing(true)}
              >
                <RiEditLine className="size-3.5" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4">
        {sections && sections.length > 0 ? (
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
          <p className="text-sm text-muted-foreground">
            No hay plantilla configurada
          </p>
        )}
      </div>
    </main>
  );
}
