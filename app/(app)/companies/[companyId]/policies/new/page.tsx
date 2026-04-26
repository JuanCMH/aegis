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
  useCreatePolicy,
  useExtractPolicyFromDoc,
  useGetPolicyTemplate,
} from "@/packages/policies/api";
import { PolicyStepper } from "@/packages/policies/components/policy-stepper";
import { ClientPicker } from "@/packages/policies/components/client-picker";
import { FIELD_GRID_CLASSES } from "@/packages/policies/lib/grid";
import { validatePolicyData } from "@/packages/policies/lib/validate-policy-data";
import type { TemplateSection } from "@/packages/policies/types";
import { useGenerateUploadUrl } from "@/components/hooks/use-generate-upload-url";
import { getPdfContent } from "@/lib/extract-pdf";
import { normalizePdfText } from "@/lib/normalize-pdf-text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/aegis/date-picker";
import type { Id } from "@/convex/_generated/dataModel";

type StatusValue = "active" | "expired" | "canceled" | "pending";

const toMs = (v: unknown): number | undefined => {
  if (v == null || v === "") return undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  const parsed = Date.parse(String(v));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const NewPolicyPage = () => {
  const router = useRouter();
  const companyId = useCompanyId();
  const template = useGetPolicyTemplate({ companyId });
  const { mutate: createPolicy, isPending: isCreating } = useCreatePolicy();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { execute: extractFromDoc, isPending: isExtracting } =
    useExtractPolicyFromDoc();

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [aiFields, setAiFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [clientId, setClientId] = useState<Id<"clients"> | undefined>(
    undefined,
  );

  // Fallback fields when no template
  const [basicNumber, setBasicNumber] = useState("");
  const [basicStatus, setBasicStatus] = useState<StatusValue>("pending");
  const [basicStart, setBasicStart] = useState<Date | undefined>(undefined);
  const [basicEnd, setBasicEnd] = useState<Date | undefined>(undefined);

  const sections = template.data?.sections as TemplateSection[] | undefined;
  const hasTemplate = Boolean(sections && sections.length > 0);

  const handleChange = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setAiFields((prev) => {
      if (!prev.has(fieldId)) return prev;
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
        companyId,
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

  const handleSave = async () => {
    let policyNumber: string;
    let status: StatusValue;
    let startDate: number | undefined;
    let endDate: number | undefined;

    if (hasTemplate && sections) {
      const { valid, errors } = validatePolicyData(sections, values);
      if (!valid) {
        setFieldErrors(errors);
        const count = Object.keys(errors).length;
        toast.error(`Hay ${count} campo${count > 1 ? "s" : ""} con errores`);
        return;
      }
      setFieldErrors({});

      policyNumber = String(values.field_policyNumber ?? "").trim();
      status = (values.field_status as StatusValue) ?? "pending";
      startDate = toMs(values.field_startDate);
      endDate = toMs(values.field_endDate);
    } else {
      policyNumber = basicNumber.trim();
      status = basicStatus;
      startDate = basicStart?.getTime();
      endDate = basicEnd?.getTime();
    }

    if (!policyNumber) {
      toast.error("El número de póliza es obligatorio");
      return;
    }
    if (!startDate) {
      toast.error("La fecha de inicio es obligatoria");
      return;
    }
    if (!endDate) {
      toast.error("La fecha de fin es obligatoria");
      return;
    }
    if (endDate < startDate) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    await createPolicy(
      {
        companyId,
        policyNumber,
        status,
        startDate,
        endDate,
        ...(clientId ? { clientId } : {}),
        ...(hasTemplate && template.data
          ? { templateId: template.data._id, data: values }
          : {}),
      },
      {
        onSuccess: (policyId) => {
          toast.success("Póliza creada");
          router.push(`/companies/${companyId}/policies/${policyId}`);
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

  return (
    <main className="w-full h-full flex-1 flex flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Nueva Póliza</h1>
          <div className="ml-auto flex items-center gap-2">
            <ClientPicker value={clientId} onChange={setClientId} />
            <Button
              size="sm"
              type="button"
              onClick={handleSave}
              disabled={isCreating || isExtracting}
              className="cursor-pointer"
            >
              <Save />
              Guardar
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-8 py-6">
          {hasTemplate && sections ? (
            <PolicyStepper
              sections={sections}
              values={values}
              onChange={handleChange}
              onFileUpload={handleFileUpload}
              aiFields={aiFields}
              errors={fieldErrors}
              isAiExtracting={isExtracting}
              companyId={companyId}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
                Esta empresa aún no tiene una plantilla configurada. Solo se
                guardarán los campos básicos. Configura una plantilla para
                capturar más información.
              </div>
              <div className={FIELD_GRID_CLASSES}>
                <div className="col-span-1 sm:col-span-3 lg:col-span-6 space-y-1.5">
                  <Label htmlFor="basic-number" className="text-xs font-medium">
                    Número de póliza <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="basic-number"
                    placeholder="Ej. POL-2025-001"
                    value={basicNumber}
                    onChange={(e) => setBasicNumber(e.target.value)}
                  />
                </div>
                <div className="col-span-1 sm:col-span-3 lg:col-span-6 space-y-1.5">
                  <Label className="text-xs font-medium">
                    Estado <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={basicStatus}
                    onValueChange={(v) => setBasicStatus(v as StatusValue)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="expired">Vencida</SelectItem>
                      <SelectItem value="canceled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 sm:col-span-3 lg:col-span-6 space-y-1.5">
                  <Label className="text-xs font-medium">
                    Fecha de inicio <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker date={basicStart} onSelect={setBasicStart} />
                </div>
                <div className="col-span-1 sm:col-span-3 lg:col-span-6 space-y-1.5">
                  <Label className="text-xs font-medium">
                    Fecha de fin <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker date={basicEnd} onSelect={setBasicEnd} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default NewPolicyPage;
