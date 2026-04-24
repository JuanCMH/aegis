"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Lock, GripVertical } from "lucide-react";
import { FIELD_TYPE_CONFIG } from "./field-palette";
import type { TemplateField, FieldSize } from "@/packages/clients/types";

const SIZE_MAP: Record<FieldSize, string> = {
  small: "col-span-1",
  medium: "col-span-2",
  large: "col-span-3",
  full: "col-span-4",
};

function SortableField({
  field,
  onClick,
}: {
  field: TemplateField;
  onClick: () => void;
}) {
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

  const config = FIELD_TYPE_CONFIG.find((c) => c.type === field.type);
  const Icon = config?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        SIZE_MAP[field.size],
        "group relative flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/40",
        "hover:border-border/60 hover:bg-accent/20 transition-all cursor-pointer select-none",
        isDragging && "opacity-40 z-50",
        field.isFixed && "border-dashed",
      )}
      onClick={onClick}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-3.5 text-muted-foreground/50" />
      </div>

      {Icon && (
        <div className="flex items-center justify-center size-6 rounded-md bg-muted/50 shrink-0">
          <Icon className="size-3 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{field.label}</p>
        {field.placeholder && (
          <p className="text-[10px] text-muted-foreground/60 truncate">
            {field.placeholder}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {field.required && (
          <span className="text-[10px] text-destructive/80">*</span>
        )}
        {field.isFixed && <Lock className="size-3 text-muted-foreground/40" />}
      </div>
    </div>
  );
}

interface TemplateCanvasProps {
  sectionId: string;
  fields: TemplateField[];
  onFieldClick: (field: TemplateField) => void;
}

export function TemplateCanvas({
  sectionId,
  fields,
  onFieldClick,
}: TemplateCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `canvas-${sectionId}`,
    data: { type: "canvas", sectionId },
  });

  return (
    <SortableContext
      items={fields.map((f) => f.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className={cn(
          "grid grid-cols-4 gap-2 p-4 min-h-[200px] rounded-lg border border-dashed border-border/40 transition-colors",
          isOver && "border-primary/40 bg-primary/5",
        )}
      >
        {fields.length === 0 && (
          <div className="col-span-4 flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Arrastra campos aquí para comenzar
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Los campos aparecerán en el formulario del cliente
            </p>
          </div>
        )}
        {fields.map((field) => (
          <SortableField
            key={field.id}
            field={field}
            onClick={() => onFieldClick(field)}
          />
        ))}
      </div>
    </SortableContext>
  );
}
