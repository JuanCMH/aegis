"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Save, LayoutGrid, Sparkles } from "lucide-react";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import {
  useGetClientTemplate,
  useSaveClientTemplate,
} from "@/packages/clients/api";
import { FieldPalette, FIELD_TYPE_CONFIG } from "./field-palette";
import { FieldConfigPanel } from "./field-config-panel";
import { TemplateCanvas } from "./template-canvas";
import { SectionTabs } from "./section-tabs";
import { TemplateAiModal, type ReviewSuggestion } from "./template-ai-modal";
import { RoleGate } from "@/packages/roles/components/role-gate";
import type {
  TemplateSection,
  TemplateField,
  FieldType,
} from "@/packages/clients/types";

function generateId() {
  return crypto.randomUUID();
}

function createDefaultTemplate(): TemplateSection[] {
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

function createNewField(fieldType: FieldType): TemplateField {
  const config = FIELD_TYPE_CONFIG.find((c) => c.type === fieldType);
  return {
    id: generateId(),
    type: fieldType,
    label: config?.label ?? "Nuevo campo",
    required: false,
    size: "medium",
    showInTable: false,
    isFixed: false,
    config:
      fieldType === "select"
        ? { options: [{ label: "Opción 1", value: `opt_${Date.now()}` }] }
        : {},
  };
}

export function TemplateBuilder() {
  const companyId = useCompanyId();
  const template = useGetClientTemplate({ companyId });
  const { mutate: saveTemplate, isPending: isSaving } = useSaveClientTemplate();

  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [selectedField, setSelectedField] = useState<TemplateField | null>(
    null,
  );
  const [configOpen, setConfigOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activeFieldDrag, setActiveFieldDrag] = useState<TemplateField | null>(
    null,
  );
  const [activePaletteType, setActivePaletteType] = useState<FieldType | null>(
    null,
  );
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Initialize from backend or default
  useEffect(() => {
    if (initialized || template === undefined) return;

    const data = template.data;
    if (data && data.sections.length > 0) {
      const loaded = data.sections as TemplateSection[];
      setSections(loaded);
      setActiveSectionId(loaded[0].id);
    } else {
      const defaultSections = createDefaultTemplate();
      setSections(defaultSections);
      setActiveSectionId(defaultSections[0].id);
    }
    setInitialized(true);
  }, [template, initialized]);

  const activeSection = sections.find((s) => s.id === activeSectionId);

  // Section management
  const handleAddSection = useCallback(() => {
    const newSection: TemplateSection = {
      id: generateId(),
      label: `Sección ${sections.length + 1}`,
      order: sections.length,
      fields: [],
    };
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.id);
  }, [sections.length]);

  const handleRenameSection = useCallback((id: string, label: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)));
  }, []);

  const handleDeleteSection = useCallback(
    (id: string) => {
      const section = sections.find((s) => s.id === id);
      if (!section) return;
      if (section.fields.length > 0) {
        toast.error("Elimina todos los campos de la sección primero");
        return;
      }
      setSections((prev) => prev.filter((s) => s.id !== id));
      if (activeSectionId === id) {
        const remaining = sections.filter((s) => s.id !== id);
        if (remaining.length > 0) setActiveSectionId(remaining[0].id);
      }
    },
    [sections, activeSectionId],
  );

  // Field management
  const handleFieldClick = useCallback((field: TemplateField) => {
    setSelectedField(field);
    setConfigOpen(true);
  }, []);

  const handleFieldUpdate = useCallback((updated: TemplateField) => {
    setSelectedField(updated);
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        fields: s.fields.map((f) => (f.id === updated.id ? updated : f)),
      })),
    );
  }, []);

  const handleFieldDelete = useCallback((fieldId: string) => {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        fields: s.fields.filter((f) => f.id !== fieldId),
      })),
    );
    setConfigOpen(false);
    setSelectedField(null);
  }, []);

  const handleFieldResize = useCallback(
    (fieldId: string, size: TemplateField["size"]) => {
      setSections((prev) =>
        prev.map((s) => ({
          ...s,
          fields: s.fields.map((f) => (f.id === fieldId ? { ...f, size } : f)),
        })),
      );
      setSelectedField((current) =>
        current?.id === fieldId ? { ...current, size } : current,
      );
    },
    [],
  );

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === "palette-item") {
      setActivePaletteType(data.fieldType as FieldType);
      setActiveFieldDrag(null);
    } else if (data?.type === "canvas-field") {
      setActiveFieldDrag(data.field as TemplateField);
      setActivePaletteType(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveFieldDrag(null);
    setActivePaletteType(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Palette item dropped on canvas
    if (activeData?.type === "palette-item") {
      const fieldType = activeData.fieldType as FieldType;
      const targetSectionId =
        overData?.type === "canvas"
          ? (overData.sectionId as string)
          : overData?.type === "section-tab"
            ? (overData.sectionId as string)
            : activeSectionId;

      const newField = createNewField(fieldType);
      setSections((prev) =>
        prev.map((s) =>
          s.id === targetSectionId
            ? { ...s, fields: [...s.fields, newField] }
            : s,
        ),
      );
      return;
    }

    // Canvas field dropped on section tab → move to that section
    if (
      activeData?.type === "canvas-field" &&
      overData?.type === "section-tab"
    ) {
      const field = activeData.field as TemplateField;
      const targetSectionId = overData.sectionId as string;

      // Find current section
      const currentSection = sections.find((s) =>
        s.fields.some((f) => f.id === field.id),
      );
      if (!currentSection || currentSection.id === targetSectionId) return;

      setSections((prev) =>
        prev.map((s) => {
          if (s.id === currentSection.id) {
            return { ...s, fields: s.fields.filter((f) => f.id !== field.id) };
          }
          if (s.id === targetSectionId) {
            return { ...s, fields: [...s.fields, field] };
          }
          return s;
        }),
      );
      return;
    }

    // Reorder within canvas
    if (
      activeData?.type === "canvas-field" &&
      overData?.type === "canvas-field"
    ) {
      const activeField = activeData.field as TemplateField;
      const overField = overData.field as TemplateField;

      setSections((prev) =>
        prev.map((s) => {
          const activeIdx = s.fields.findIndex((f) => f.id === activeField.id);
          const overIdx = s.fields.findIndex((f) => f.id === overField.id);
          if (activeIdx === -1 || overIdx === -1) return s;
          return { ...s, fields: arrayMove(s.fields, activeIdx, overIdx) };
        }),
      );
    }
  };

  // Save
  const handleSave = async () => {
    await saveTemplate(
      { companyId, sections },
      {
        onSuccess: () => toast.success("Plantilla guardada"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  // AI: apply generated template
  const handleApplyGenerated = useCallback((generated: TemplateSection[]) => {
    setSections(generated);
    if (generated.length > 0) setActiveSectionId(generated[0].id);
  }, []);

  // AI: apply review suggestions
  const handleApplySuggestions = useCallback((accepted: ReviewSuggestion[]) => {
    setSections((prev) => {
      let updated = [...prev.map((s) => ({ ...s, fields: [...s.fields] }))];

      for (const suggestion of accepted) {
        if (suggestion.type === "add") {
          // Find or create target section
          let section = updated.find((s) => s.id === suggestion.sectionId);
          if (!section) {
            section = {
              id: suggestion.sectionId || generateId(),
              label: suggestion.sectionLabel || "Nueva Sección",
              order: updated.length,
              fields: [],
            };
            updated.push(section);
          }
          section.fields.push({
            ...suggestion.field,
            id: suggestion.field.id || generateId(),
            isFixed: false,
          });
        } else if (suggestion.type === "modify") {
          updated = updated.map((s) => ({
            ...s,
            fields: s.fields.map((f) =>
              f.id === suggestion.field.id
                ? { ...f, ...suggestion.field, isFixed: f.isFixed }
                : f,
            ),
          }));
        } else if (suggestion.type === "remove") {
          updated = updated.map((s) => ({
            ...s,
            fields: s.fields.filter(
              (f) => f.id !== suggestion.field.id || f.isFixed,
            ),
          }));
        }
      }

      return updated;
    });
  }, []);

  // Drag overlay render
  const renderDragOverlay = () => {
    if (activePaletteType) {
      const config = FIELD_TYPE_CONFIG.find(
        (c) => c.type === activePaletteType,
      );
      if (!config) return null;
      const Icon = config.icon;
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/40 bg-card shadow-sm">
          <Icon className="size-3.5 text-muted-foreground" />
          <span className="text-sm">{config.label}</span>
        </div>
      );
    }
    if (activeFieldDrag) {
      const config = FIELD_TYPE_CONFIG.find(
        (c) => c.type === activeFieldDrag.type,
      );
      const Icon = config?.icon;
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/40 bg-card shadow-sm">
          {Icon && <Icon className="size-3.5 text-muted-foreground" />}
          <span className="text-sm">{activeFieldDrag.label}</span>
        </div>
      );
    }
    return null;
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  const totalFields = sections.reduce((acc, s) => acc + s.fields.length, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl border border-aegis-sapphire/15 bg-aegis-sapphire/10 text-aegis-sapphire">
            <LayoutGrid className="size-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-aegis-graphite">
              Plantilla de Clientes
            </h1>
            <p className="text-xs text-aegis-steel">
              Diseña el formulario que usarás para registrar clientes ·{" "}
              {totalFields} {totalFields === 1 ? "campo" : "campos"} en{" "}
              {sections.length}{" "}
              {sections.length === 1 ? "sección" : "secciones"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RoleGate permission="clients_useAI">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAiModalOpen(true)}
              className="gap-1.5 border-border/50"
            >
              <Sparkles className="size-3.5" />
              Asistente IA
            </Button>
          </RoleGate>
          <RoleGate permission="clientTemplates_edit">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5"
            >
              <Save className="size-3.5" />
              Guardar
            </Button>
          </RoleGate>
        </div>
      </header>

      {/* Body */}
      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex min-h-0 flex-1">
          {/* Canvas area (izquierda, ocupa el resto) */}
          <div className="flex min-w-0 flex-1 flex-col">
            <SectionTabs
              sections={sections}
              activeSectionId={activeSectionId}
              onSelectSection={setActiveSectionId}
              onAddSection={handleAddSection}
              onRenameSection={handleRenameSection}
              onDeleteSection={handleDeleteSection}
            />
            <div className="flex-1 overflow-auto">
              <div className="mx-auto max-w-6xl px-8 py-8">
                {activeSection && (
                  <TemplateCanvas
                    sectionId={activeSection.id}
                    fields={activeSection.fields}
                    selectedFieldId={selectedField?.id ?? null}
                    onFieldClick={handleFieldClick}
                    onFieldResize={handleFieldResize}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Palette (derecha) */}
          <aside className="w-72 shrink-0 border-l border-border/40 bg-card">
            <FieldPalette />
          </aside>
        </div>

        <DragOverlay dropAnimation={null}>{renderDragOverlay()}</DragOverlay>
      </DndContext>

      {/* Field config panel */}
      <FieldConfigPanel
        field={selectedField}
        open={configOpen}
        onOpenChange={setConfigOpen}
        onUpdate={handleFieldUpdate}
        onDelete={handleFieldDelete}
      />

      {/* AI modal */}
      <TemplateAiModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        sections={sections}
        onApplyGenerated={handleApplyGenerated}
        onApplySuggestions={handleApplySuggestions}
      />
    </div>
  );
}
