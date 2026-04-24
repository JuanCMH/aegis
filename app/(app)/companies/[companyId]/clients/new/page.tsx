"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Save } from "lucide-react";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import {
  useGetClientTemplate,
  useCreateClient,
  useExtractClientFromDoc,
} from "@/packages/clients/api";
import { useGenerateUploadUrl } from "@/components/hooks/use-generate-upload-url";
import { ClientStepper } from "@/packages/clients/components/client-stepper";
import { getPdfContent } from "@/lib/extract-pdf";
import { normalizePdfText } from "@/lib/normalize-pdf-text";
import type { TemplateSection } from "@/packages/clients/types";
import { validateClientData } from "@/packages/clients/lib/validate-client-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const NewClientPage = () => {
  const router = useRouter();
  const companyId = useCompanyId();
  const template = useGetClientTemplate({ companyId });
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { execute: extractFromDoc, isPending: isExtracting } =
    useExtractClientFromDoc();

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [aiFields, setAiFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [basicName, setBasicName] = useState("");
  const [basicId, setBasicId] = useState("");

  const sections = template.data?.sections as TemplateSection[] | undefined;
  const hasTemplate = Boolean(sections && sections.length > 0);

  const handleChange = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setAiFields((prev) => {
      const next = new Set(prev);
      next.delete(fieldId);
      return next;
    });
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

    // Offer AI extraction for PDF files
    if (file.type === "application/pdf" && sections) {
      toast("Documento subido. ¿Deseas extraer datos con IA?", {
        action: {
          label: "Extraer",
          onClick: () => handleAiExtract(file),
        },
        duration: 8000,
      });
    }
  };

  const handleAiExtract = async (file: File) => {
    if (!sections) return;

    try {
      const raw = await getPdfContent(file);
      const text = normalizePdfText(raw);
      if (!text.trim()) {
        toast.error("No se pudo extraer texto del documento");
        return;
      }

      const response = await extractFromDoc({
        prompt: text,
        templateSections: sections,
      });
      if (!response) return;

      const cleaned = response.replace(/```json\n?|```/g, "").trim();
      const extracted = JSON.parse(cleaned) as Record<string, unknown>;

      const filledKeys = Object.keys(extracted).filter(
        (k) => extracted[k] != null && extracted[k] !== "",
      );

      if (filledKeys.length === 0) {
        toast.info("No se encontraron datos relevantes en el documento");
        return;
      }

      setValues((prev) => {
        const merged = { ...prev };
        for (const key of filledKeys) {
          if (!merged[key] || merged[key] === "") {
            merged[key] = extracted[key];
          }
        }
        return merged;
      });
      setAiFields(new Set(filledKeys));
      toast.success(`Se extrajeron ${filledKeys.length} campos con IA`);
    } catch {
      toast.error("Error al extraer datos del documento");
    }
  };

  const handleSave = async () => {
    // With template: validate all fields
    if (sections && sections.length > 0) {
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

    await createClient(
      {
        companyId,
        name,
        identificationNumber,
        ...(hasTemplate && template.data
          ? { templateId: template.data._id, data: values }
          : {}),
      },
      {
        onSuccess: (clientId) => {
          toast.success("Cliente creado");
          router.push(`/companies/${companyId}/clients/${clientId}`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  if (template.isLoading) {
    return (
      <main className="w-full h-full flex-1 flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <main className="w-full h-full flex-1 flex flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">Nuevo Cliente</h1>
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isCreating}
                className="gap-1.5"
              >
                <Save className="size-3.5" />
                Guardar
              </Button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4">
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
              />
            </div>
          </div>
        </div>
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
          <h1 className="text-base font-medium">Nuevo Cliente</h1>
          <div className="ml-auto flex items-center gap-2">
            {isExtracting && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Spinner className="size-3" />
                Extrayendo con IA...
              </span>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isCreating || isExtracting}
              className="gap-1.5"
            >
              <Save className="size-3.5" />
              Guardar
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4">
        <ClientStepper
          sections={sections}
          values={values}
          onChange={handleChange}
          onFileUpload={handleFileUpload}
          aiFields={aiFields}
          errors={fieldErrors}
        />
      </div>
    </main>
  );
};

export default NewClientPage;
