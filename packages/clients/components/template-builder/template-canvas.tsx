"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicField } from "@/packages/clients/components/dynamic-field";
import {
  FIELD_GRID_CLASSES,
  FIELD_SIZE_SPAN,
} from "@/packages/clients/lib/grid";
import type { TemplateField } from "@/packages/clients/types";

interface SortableFieldProps {
  field: TemplateField;
  isSelected: boolean;
  onClick: () => void;
}

function SortableField({ field, isSelected, onClick }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { type: "canvas-field", field },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        FIELD_SIZE_SPAN[field.size],
        "group relative",
        isDragging && "z-50 opacity-50",
      )}
    >
      {/* WYSIWYG container — same render as the real form */}
      <div
        className={cn(
          "rounded-xl border-2 bg-card/50 px-3 pt-3 pb-2 transition-all",
          isSelected
            ? "border-aegis-sapphire/70 bg-aegis-sapphire/5 shadow-[0_0_0_4px_rgba(56,113,224,0.08)]"
            : "border-transparent hover:border-aegis-sapphire/30 hover:bg-card",
        )}
      >
        {/* Real field render in disabled mode. We override the size span
            since the wrapper above already controls layout. */}
        <div className="[&>div]:col-span-1! [&>div]:w-full!">
          <DynamicField
            field={field}
            value={undefined}
            onChange={() => {
              /* noop in builder */
            }}
            readOnly
          />
        </div>
      </div>

      {/* Click capture overlay — selects the field and prevents the user
          from interacting with the underlying disabled inputs. */}
      <button
        type="button"
        aria-label={`Configurar ${field.label}`}
        onClick={onClick}
        className="absolute inset-0 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegis-sapphire/50 focus-visible:ring-offset-2"
      />

      {/* Hover toolbar */}
      <div
        className={cn(
          "absolute -top-3 right-3 z-20 flex items-center gap-0.5 rounded-md border border-border/60 bg-card px-1 py-0.5 shadow-sm",
          "opacity-0 transition-opacity group-hover:opacity-100",
          isSelected && "opacity-100",
        )}
      >
        <button
          type="button"
          aria-label="Mover campo"
          {...attributes}
          {...listeners}
          className="flex size-6 cursor-grab items-center justify-center rounded text-aegis-steel hover:bg-muted active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Configurar campo"
          onClick={onClick}
          className="flex size-6 cursor-pointer items-center justify-center rounded text-aegis-steel hover:bg-muted"
        >
          <Settings2 className="size-3.5" />
        </button>
      </div>

      {/* Fixed indicator — system-required field */}
      {field.isFixed && (
        <div
          className="absolute -top-2.5 left-3 z-20 flex items-center gap-1 rounded-md border border-aegis-amber/40 bg-aegis-amber/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-aegis-amber"
          title="Campo requerido por el sistema. Puedes personalizar la etiqueta o moverlo, pero no se puede eliminar."
        >
          <Lock className="size-2.5" />
          Requerido
        </div>
      )}
    </div>
  );
}

interface TemplateCanvasProps {
  sectionId: string;
  fields: TemplateField[];
  selectedFieldId: string | null;
  onFieldClick: (field: TemplateField) => void;
}

export function TemplateCanvas({
  sectionId,
  fields,
  selectedFieldId,
  onFieldClick,
}: TemplateCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `canvas-${sectionId}`,
    data: { type: "canvas", sectionId },
  });

  return (
    <SortableContext
      items={fields.map((f) => f.id)}
      strategy={rectSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[280px] rounded-xl border-2 border-dashed border-border/40 bg-background/40 p-6 transition-colors",
          FIELD_GRID_CLASSES,
          isOver && "border-aegis-sapphire/50 bg-aegis-sapphire/5",
        )}
      >
        {fields.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted/60">
              <GripVertical className="size-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-aegis-graphite">
              Arrastra campos desde el panel de la derecha
            </p>
            <p className="mt-1 text-xs text-aegis-steel">
              Aparecerán aquí tal cual los verán tus usuarios
            </p>
          </div>
        )}
        {fields.map((field) => (
          <SortableField
            key={field.id}
            field={field}
            isSelected={selectedFieldId === field.id}
            onClick={() => onFieldClick(field)}
          />
        ))}
      </div>
    </SortableContext>
  );
}
