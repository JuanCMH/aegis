"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  useGenerateTemplateFromDoc,
  useGetClientTemplate,
  useReviewTemplate,
  useSaveClientTemplate,
} from "@/packages/clients/api";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { TemplateBuilderShell } from "@/packages/template-builder/components/template-builder-shell";
import type { TemplateSection } from "@/packages/template-builder/types";

function generateId() {
  return crypto.randomUUID();
}

/**
 * Plantilla por defecto del módulo clients. Incluye los dos campos fijos
 * (`field_name`, `field_identificationNumber`) que son requeridos por el
 * sistema y mapean a columnas indexadas del backend.
 */
function createDefaultClientTemplate(): TemplateSection[] {
  return [
    {
      id: generateId(),
      label: "Información Básica",
      order: 0,
      fields: [
        {
          id: "field_name",
          type: "text",
          label: "Nombre",
          placeholder: "Nombre del cliente",
          required: true,
          size: "medium",
          showInTable: true,
          isFixed: true,
          config: {},
        },
        {
          id: "field_identificationNumber",
          type: "text",
          label: "N° Identificación",
          placeholder: "Número de identificación",
          required: true,
          size: "medium",
          showInTable: true,
          isFixed: true,
          config: {},
        },
      ],
    },
  ];
}

/**
 * Wrapper específico del módulo clients sobre `TemplateBuilderShell`.
 * Inyecta los hooks de Convex (carga, guardado, IA) y los defaults.
 */
export function TemplateBuilder() {
  const companyId = useCompanyId();
  const template = useGetClientTemplate({ companyId });
  const { mutate: saveTemplate, isPending: isSaving } = useSaveClientTemplate();
  const { execute: generateFromDoc, isPending: isGenerating } =
    useGenerateTemplateFromDoc();
  const { execute: reviewTemplate, isPending: isReviewing } =
    useReviewTemplate();

  const handleSave = useCallback(
    async (sections: TemplateSection[]) => {
      await saveTemplate(
        { companyId, sections },
        {
          onSuccess: () => toast.success("Plantilla guardada"),
          onError: (err) => toast.error(err.message),
          throwError: true,
        },
      );
    },
    [saveTemplate, companyId],
  );

  const handleGenerateFromText = useCallback(
    async (prompt: string) => {
      return generateFromDoc({ companyId, prompt });
    },
    [generateFromDoc, companyId],
  );

  const handleReviewTemplate = useCallback(
    async ({
      sections,
      instruction,
    }: {
      sections: TemplateSection[];
      instruction?: string;
    }) => {
      return reviewTemplate({ companyId, sections, instruction });
    },
    [reviewTemplate, companyId],
  );

  return (
    <TemplateBuilderShell
      title="Plantilla de Clientes"
      initialSections={
        template.data ? (template.data.sections as TemplateSection[]) : null
      }
      isInitialLoading={template.isLoading}
      defaultSections={createDefaultClientTemplate()}
      onSave={handleSave}
      isSaving={isSaving}
      editPermission="clientTemplates_edit"
      aiPermission="clients_useAI"
      ai={{
        onGenerateFromText: handleGenerateFromText,
        onReviewTemplate: handleReviewTemplate,
        isGenerating,
        isReviewing,
        entityLabel: "plantilla de clientes",
      }}
    />
  );
}
