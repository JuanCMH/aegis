"use client";

import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Save, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import type { PermissionKey } from "@/convex/lib/permissions";
import { RoleGate } from "@/packages/roles/components/role-gate";
import { FieldConfigPanel } from "./field-config-panel";
import { FieldPalette, FIELD_TYPE_CONFIG } from "./field-palette";
import { SectionTabs } from "./section-tabs";
import { TemplateCanvas } from "./template-canvas";
import { TemplateAiModal, type ReviewSuggestion } from "./template-ai-modal";
import type {
  FieldType,
  TemplateField,
  TemplateSection,
} from "@/packages/template-builder/types";

function generateId() {
  return crypto.randomUUID();
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

export interface TemplateBuilderShellProps {
  /** Título mostrado en el header (ej. "Plantilla de Pólizas"). */
  title: string;
  /** Plantilla cargada desde el backend. `null` si todavía no se inicializa. */
  initialSections: TemplateSection[] | null;
  /** Cargando inicial (skeleton/spinner). */
  isInitialLoading: boolean;
  /** Plantilla por defecto cuando el backend no tiene una guardada. */
  defaultSections: TemplateSection[];
  /** Persistencia. Recibe el snapshot a guardar. */
  onSave: (sections: TemplateSection[]) => Promise<void>;
  isSaving: boolean;
  /** Permiso requerido para mostrar el botón "Guardar". */
  editPermission: PermissionKey;
  /** Permiso requerido para mostrar el botón "Asistente IA". Opcional. */
  aiPermission?: PermissionKey;
  /** Handlers IA — opcionales; si se pasan, habilitan el modal. */
  ai?: {
    onGenerateFromText: (prompt: string) => Promise<string | null | undefined>;
    onReviewTemplate: (args: {
      sections: TemplateSection[];
      instruction?: string;
    }) => Promise<string | null | undefined>;
    isGenerating: boolean;
    isReviewing: boolean;
    entityLabel?: string;
  };
}

/**
 * Cascarón genérico del template builder. Encapsula el estado local de
 * secciones/dnd/dirty/save, deja al consumidor inyectar:
 *   - la plantilla cargada
 *   - los defaults
 *   - la persistencia
 *   - los handlers IA (opcionales)
 *
 * No conoce de Convex ni de dominios.
 */
export function TemplateBuilderShell({
  title,
  initialSections,
  isInitialLoading,
  defaultSections,
  onSave,
  isSaving,
  editPermission,
  aiPermission,
  ai,
}: TemplateBuilderShellProps) {
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
  // Snapshot serializado del último estado persistido (o cargado) para
  // derivar `isDirty` sin instrumentar cada mutación.
  const [savedSnapshot, setSavedSnapshot] = useState<string>("[]");
  // Bandera síncrona para evitar la ventana corta tras guardar donde el
  // state aún muestra `isDirty=true` y dispara `beforeunload`.
  const justSavedRef = useRef(false);

  // Initialize from backend or default
  useEffect(() => {
    if (initialized || isInitialLoading) return;

    let initial: TemplateSection[];
    if (initialSections && initialSections.length > 0) {
      initial = initialSections;
    } else {
      initial = defaultSections;
    }
    setSections(initial);
    if (initial.length > 0) setActiveSectionId(initial[0].id);
    setSavedSnapshot(JSON.stringify(initial));
    setInitialized(true);
  }, [initialSections, isInitialLoading, defaultSections, initialized]);

  const isDirty = initialized && JSON.stringify(sections) !== savedSnapshot;

  // Guard de cambios sin guardar al salir de la pestaña.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (justSavedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

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
    const payload = sections;
    const snapshot = JSON.stringify(payload);
    try {
      await onSave(payload);
      // Bandera síncrona: cubre la ventana entre setState y el siguiente
      // render para que un beforeunload inmediato no se dispare.
      justSavedRef.current = true;
      setSavedSnapshot(snapshot);
      setTimeout(() => {
        justSavedRef.current = false;
      }, 0);
    } catch {
      // El consumidor maneja el toast de error vía su mutate hook.
    }
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
      {/* Header — alineado al patrón de la app (h-12 + SidebarTrigger) */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{title}</h1>
          <span className="text-xs text-muted-foreground">
            {totalFields} {totalFields === 1 ? "campo" : "campos"} ·{" "}
            {sections.length} {sections.length === 1 ? "sección" : "secciones"}
            {isDirty ? " · cambios sin guardar" : ""}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {ai && aiPermission && (
              <RoleGate permission={aiPermission}>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => setAiModalOpen(true)}
                  className="cursor-pointer"
                >
                  <Sparkles />
                  Asistente IA
                </Button>
              </RoleGate>
            )}
            <RoleGate permission={editPermission}>
              <Button
                size="sm"
                type="button"
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="cursor-pointer"
              >
                <Save />
                Guardar
              </Button>
            </RoleGate>
          </div>
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
      {ai && (
        <TemplateAiModal
          open={aiModalOpen}
          onOpenChange={setAiModalOpen}
          sections={sections}
          onApplyGenerated={handleApplyGenerated}
          onApplySuggestions={handleApplySuggestions}
          onGenerateFromText={ai.onGenerateFromText}
          onReviewTemplate={ai.onReviewTemplate}
          isGenerating={ai.isGenerating}
          isReviewing={ai.isReviewing}
          entityLabel={ai.entityLabel}
        />
      )}
    </div>
  );
}
