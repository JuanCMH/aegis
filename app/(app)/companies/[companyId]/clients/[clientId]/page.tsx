"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  IdCard,
  Pencil,
  Save,
  Trash2,
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Hint } from "@/components/aegis/hint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/components/hooks/use-confirm";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { useClientId } from "@/packages/clients/store/use-client-id";
import {
  useGetClientById,
  useUpdateClient,
  useRemoveClient,
} from "@/packages/clients/api";
import { useGenerateUploadUrl } from "@/components/hooks/use-generate-upload-url";
import { ClientStepper } from "@/packages/clients/components/client-stepper";
import { FIELD_GRID_CLASSES } from "@/packages/clients/lib/grid";
import { validateClientData } from "@/packages/clients/lib/validate-client-data";
import { fullDateTime, shortDate } from "@/lib/date-formats";
import type { TemplateSection } from "@/packages/clients/types";
import { RoleGate } from "@/packages/roles/components/role-gate";

export default function ClientDetailPage() {
  const router = useRouter();
  const companyId = useCompanyId();
  const clientId = useClientId();
  const client = useGetClientById({ id: clientId });
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();
  const { mutate: removeClient, isPending: isRemoving } = useRemoveClient();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [basicName, setBasicName] = useState("");
  const [basicId, setBasicId] = useState("");

  const [ConfirmDialog, confirm] = useConfirm({
    title: "Eliminar cliente",
    message: "¿Estás seguro? Esta acción no se puede deshacer.",
    type: "critical",
  });

  const sections = useMemo<TemplateSection[]>(
    () =>
      (client.data?.templateSections as TemplateSection[] | undefined) ?? [],
    [client.data?.templateSections],
  );
  const hasTemplate = sections.length > 0;
  const resolvedFiles = (client.data?.resolvedFiles ?? {}) as Record<
    string,
    string
  >;

  // Sync values from client data when not editing
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

    if (!name) return toast.error("El nombre es obligatorio");
    if (!identificationNumber)
      return toast.error("La identificación es obligatoria");

    await updateClient(
      { id: clientId, name, identificationNumber, data: values },
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

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;
    await removeClient(
      { id: clientId },
      {
        onSuccess: () => {
          toast.success("Cliente eliminado");
          router.push(`/companies/${companyId}/clients`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  // Keyboard shortcuts: ESC cancels, Cmd/Ctrl+S saves
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isUpdating) void handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isUpdating, values, basicName, basicId]);

  // ---- Loading skeleton ---------------------------------------------------
  if (client.isLoading) {
    return (
      <main className="flex h-full w-full flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <Skeleton className="h-4 w-40" />
            <div className="ml-auto flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl space-y-4 px-8 py-6">
            <Skeleton className="h-4 w-64" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---- Not found ----------------------------------------------------------
  if (!client.data) {
    return (
      <main className="flex h-full w-full flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">Cliente no encontrado</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-muted-foreground">
            No pudimos encontrar este cliente. Pudo haber sido eliminado.
          </p>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="cursor-pointer"
          >
            <Link href={`/companies/${companyId}/clients`}>
              <ArrowLeft />
              Volver a la lista
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const createdAt = new Date(client.data._creationTime);

  return (
    <main className="flex h-full w-full flex-1 flex-col">
      <ConfirmDialog />
      <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <Hint label="Volver a la lista">
            <Button
              asChild
              size="icon-sm"
              variant="ghost"
              className="cursor-pointer"
            >
              <Link
                href={`/companies/${companyId}/clients`}
                aria-label="Volver a la lista de clientes"
              >
                <ArrowLeft />
              </Link>
            </Button>
          </Hint>
          <h1 className="truncate text-base font-medium">{client.data.name}</h1>
          {isEditing && (
            <span className="ml-2 inline-flex items-center rounded-full bg-aegis-sapphire/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-aegis-sapphire">
              Editando
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {isEditing ? (
              <>
                <Hint label="Cancelar (Esc)">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="cursor-pointer"
                  >
                    <X />
                    Cancelar
                  </Button>
                </Hint>
                <Hint label="Guardar (⌘ + S)">
                  <Button
                    size="sm"
                    type="button"
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="cursor-pointer"
                  >
                    <Save />
                    Guardar
                  </Button>
                </Hint>
              </>
            ) : (
              <>
                <RoleGate permission="clients_delete">
                  <Hint label="Eliminar cliente">
                    <Button
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                      onClick={handleDelete}
                      disabled={isRemoving}
                      className="cursor-pointer text-muted-foreground hover:text-destructive"
                      aria-label="Eliminar cliente"
                    >
                      <Trash2 />
                    </Button>
                  </Hint>
                </RoleGate>
                <RoleGate permission="clients_edit">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer"
                  >
                    <Pencil />
                    Editar
                  </Button>
                </RoleGate>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-8 py-6">
          {/* Metadata strip */}
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <IdCard className="size-3.5" />
              <span className="tabular-nums text-foreground/80">
                {client.data.identificationNumber}
              </span>
            </span>
            <Hint label={fullDateTime(createdAt)}>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Creado el {shortDate(createdAt)}
              </span>
            </Hint>
            {!hasTemplate && (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                Sin plantilla
              </span>
            )}
          </div>

          {hasTemplate ? (
            <ClientStepper
              sections={sections}
              values={values}
              onChange={handleChange}
              readOnly={!isEditing}
              onFileUpload={handleFileUpload}
              resolvedFiles={resolvedFiles}
              errors={fieldErrors}
              companyId={companyId}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
                Esta empresa aún no tiene una plantilla configurada. Solo se
                muestran los campos básicos.
              </div>
              <div className={FIELD_GRID_CLASSES}>
                <div className="col-span-1 space-y-1.5 sm:col-span-3 lg:col-span-6">
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
                <div className="col-span-1 space-y-1.5 sm:col-span-3 lg:col-span-6">
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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
