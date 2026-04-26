"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  useGenerateTemplateFromDoc,
  useGetPolicyTemplate,
  useReviewTemplate,
  useSavePolicyTemplate,
} from "@/packages/policies/api";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { TemplateBuilderShell } from "@/packages/template-builder/components/template-builder-shell";
import type { TemplateSection } from "@/packages/template-builder/types";

function generateId() {
  return crypto.randomUUID();
}

/**
 * Plantilla por defecto del módulo policies. Incluye los cuatro campos fijos
 * (`field_policyNumber`, `field_status`, `field_startDate`, `field_endDate`)
 * que son requeridos por el sistema y mapean a columnas indexadas del backend
 * (búsqueda, dashboard de renovaciones, filtros por estado).
 */
export function createDefaultPolicyTemplate(): TemplateSection[] {
  return [
    {
      id: generateId(),
      label: "Información general",
      order: 0,
      fields: [
        {
          id: "field_policyNumber",
          type: "text",
          label: "N° de póliza",
          placeholder: "12345678",
          required: true,
          size: "medium",
          showInTable: true,
          isFixed: true,
          config: {},
        },
        {
          id: generateId(),
          type: "text",
          label: "Tipo de póliza",
          placeholder: "Cumplimiento",
          required: false,
          size: "medium",
          showInTable: true,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "text",
          label: "Ramo",
          placeholder: "Cumplimiento",
          required: false,
          size: "medium",
          showInTable: true,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "text",
          label: "Aseguradora",
          placeholder: "Seguros del Estado",
          required: false,
          size: "medium",
          showInTable: true,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "text",
          label: "Agente",
          placeholder: "Nombre del agente",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
        {
          id: "field_status",
          type: "select",
          label: "Estado",
          placeholder: "Seleccione un estado",
          required: true,
          size: "medium",
          showInTable: true,
          isFixed: true,
          config: {
            options: [
              { label: "Activa", value: "active" },
              { label: "Vencida", value: "expired" },
              { label: "Cancelada", value: "canceled" },
              { label: "Pendiente", value: "pending" },
            ],
          },
        },
      ],
    },
    {
      id: generateId(),
      label: "Vigencia y montos",
      order: 1,
      fields: [
        {
          id: "field_startDate",
          type: "date",
          label: "Fecha de inicio",
          required: true,
          size: "medium",
          showInTable: true,
          isFixed: true,
          config: {},
        },
        {
          id: "field_endDate",
          type: "date",
          label: "Fecha de fin",
          required: true,
          size: "medium",
          showInTable: true,
          isFixed: true,
          config: {},
        },
        {
          id: generateId(),
          type: "date",
          label: "Fecha de emisión",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "currency",
          label: "Prima",
          placeholder: "$0",
          required: false,
          size: "medium",
          showInTable: true,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "currency",
          label: "Gastos de emisión",
          placeholder: "$0",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "currency",
          label: "IVA",
          placeholder: "$0",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "currency",
          label: "Total",
          placeholder: "$0",
          required: false,
          size: "medium",
          showInTable: true,
          isFixed: false,
          config: {},
        },
      ],
    },
    {
      id: generateId(),
      label: "Roles",
      order: 2,
      fields: [
        {
          id: generateId(),
          type: "text",
          label: "Tomador",
          placeholder: "Nombre del tomador",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "text",
          label: "Documento tomador",
          placeholder: "123456789",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "text",
          label: "Asegurado",
          placeholder: "Nombre del asegurado",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "text",
          label: "Documento asegurado",
          placeholder: "123456789",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "text",
          label: "Beneficiario",
          placeholder: "Nombre del beneficiario",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
        {
          id: generateId(),
          type: "text",
          label: "Documento beneficiario",
          placeholder: "123456789",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
      ],
    },
    {
      id: generateId(),
      label: "Comisiones",
      order: 3,
      fields: [
        {
          id: generateId(),
          type: "number",
          label: "% Comisión",
          placeholder: "0",
          required: false,
          size: "small",
          showInTable: false,
          isFixed: false,
          config: { minValue: 0, maxValue: 100 },
        },
        {
          id: generateId(),
          type: "number",
          label: "% Participación",
          placeholder: "0",
          required: false,
          size: "small",
          showInTable: false,
          isFixed: false,
          config: { minValue: 0, maxValue: 100 },
        },
        {
          id: generateId(),
          type: "currency",
          label: "Total comisión",
          placeholder: "$0",
          required: false,
          size: "medium",
          showInTable: false,
          isFixed: false,
          config: {},
        },
      ],
    },
    {
      id: generateId(),
      label: "Observaciones",
      order: 4,
      fields: [
        {
          id: generateId(),
          type: "textarea",
          label: "Descripción del riesgo",
          required: false,
          size: "full",
          showInTable: false,
          isFixed: false,
          config: { maxLength: 500 },
        },
        {
          id: generateId(),
          type: "textarea",
          label: "Observaciones",
          required: false,
          size: "full",
          showInTable: false,
          isFixed: false,
          config: { maxLength: 500 },
        },
      ],
    },
  ];
}

/**
 * Wrapper específico del módulo policies sobre `TemplateBuilderShell`.
 * Inyecta los hooks de Convex (carga, guardado, IA) y la plantilla por defecto.
 */
export function TemplateBuilder() {
  const companyId = useCompanyId();
  const template = useGetPolicyTemplate({ companyId });
  const { mutate: saveTemplate, isPending: isSaving } = useSavePolicyTemplate();
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
      title="Plantilla de Pólizas"
      initialSections={
        template.data ? (template.data.sections as TemplateSection[]) : null
      }
      isInitialLoading={template.isLoading}
      defaultSections={createDefaultPolicyTemplate()}
      onSave={handleSave}
      isSaving={isSaving}
      editPermission="policyTemplates_edit"
      aiPermission="policies_useAI"
      ai={{
        onGenerateFromText: handleGenerateFromText,
        onReviewTemplate: handleReviewTemplate,
        isGenerating,
        isReviewing,
        entityLabel: "plantilla de pólizas",
      }}
    />
  );
}
