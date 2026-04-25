"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock, Settings2 } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { DynamicField } from "@/packages/clients/components/dynamic-field";
import {
  FIELD_GRID_CLASSES,
  FIELD_SIZE_SPAN,
} from "@/packages/clients/lib/grid";
import type { FieldSize, TemplateField } from "@/packages/clients/types";

/**
 * Mapping de cuántas columnas ocupa cada preset según el breakpoint actual.
 * Los presets se mantienen siempre como S/M/L/Full pero se traducen a un
 * número de columnas distinto en cada layout. Mobile no permite resize
 * (todo es full width por ergonomía).
 */
const BREAKPOINT_PRESETS: Record<
  "desktop" | "tablet",
  Record<FieldSize, number>
> = {
  desktop: { small: 3, medium: 6, large: 9, full: 12 },
  tablet: { small: 2, medium: 3, large: 4, full: 6 },
};

function getBreakpoint(): "desktop" | "tablet" | "mobile" {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia("(min-width: 1024px)").matches) return "desktop";
  if (window.matchMedia("(min-width: 640px)").matches) return "tablet";
  return "mobile";
}

/** Snap al preset cuyo número de columnas es el más cercano al cursor. */
function snapColumnsToSize(cols: number, bp: "desktop" | "tablet"): FieldSize {
  const presets = BREAKPOINT_PRESETS[bp];
  let bestSize: FieldSize = "small";
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const [size, value] of Object.entries(presets) as [
    FieldSize,
    number,
  ][]) {
    const diff = Math.abs(cols - value);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestSize = size;
    }
  }
  return bestSize;
}

interface SortableFieldProps {
  field: TemplateField;
  isSelected: boolean;
  previewSize: FieldSize | null;
  onClick: () => void;
  onResizeStart: (
    fieldId: string,
    e: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
}

function SortableField({
  field,
  isSelected,
  previewSize,
  onClick,
  onResizeStart,
}: SortableFieldProps) {
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

  const effectiveSize = previewSize ?? field.size;
  const isResizing = previewSize !== null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        FIELD_SIZE_SPAN[effectiveSize],
        "group relative",
        isDragging && "z-50 opacity-50",
        isResizing && "z-40",
      )}
      data-field-id={field.id}
    >
      {/* WYSIWYG container — same render as the real form */}
      <div
        className={cn(
          "rounded-xl border-2 bg-card/50 px-3 pt-3 pb-2 transition-all",
          isSelected || isResizing
            ? "border-aegis-sapphire/70 bg-aegis-sapphire/5 shadow-[0_0_0_4px_rgba(56,113,224,0.08)]"
            : "border-transparent hover:border-aegis-sapphire/30 hover:bg-card",
        )}
      >
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

      {/* Click capture overlay */}
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
          (isSelected || isResizing) && "opacity-100",
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

      {/* Right-edge resize handle (Figma-style) */}
      <button
        type="button"
        aria-label="Redimensionar campo"
        onPointerDown={(e) => onResizeStart(field.id, e)}
        className={cn(
          "absolute top-2 bottom-2 -right-1 z-30 flex w-2 cursor-col-resize items-center justify-center rounded",
          "opacity-0 transition-opacity group-hover:opacity-100 hover:bg-aegis-sapphire/30",
          (isSelected || isResizing) && "opacity-100",
        )}
      >
        <span className="block h-8 w-0.5 rounded-full bg-aegis-sapphire/60" />
      </button>

      {/* Live size badge during resize */}
      {isResizing && (
        <div className="absolute -bottom-3 right-3 z-30 rounded-md border border-aegis-sapphire/40 bg-aegis-sapphire px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
          {effectiveSize}
        </div>
      )}

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
  onFieldResize: (fieldId: string, size: FieldSize) => void;
}

export function TemplateCanvas({
  sectionId,
  fields,
  selectedFieldId,
  onFieldClick,
  onFieldResize,
}: TemplateCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `canvas-${sectionId}`,
    data: { type: "canvas", sectionId },
  });
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState<{
    fieldId: string;
    size: FieldSize;
  } | null>(null);

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    gridRef.current = node;
  };

  const handleResizeStart = (
    fieldId: string,
    e: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const bp = getBreakpoint();
    if (bp === "mobile") return; // resize disabled on mobile

    const grid = gridRef.current;
    const fieldEl = grid?.querySelector<HTMLDivElement>(
      `[data-field-id="${fieldId}"]`,
    );
    if (!grid || !fieldEl) return;

    const totalCols = bp === "desktop" ? 12 : 6;
    const gridRect = grid.getBoundingClientRect();
    // Account for grid padding (p-6 = 24px each side) by using inner width.
    const styles = window.getComputedStyle(grid);
    const padLeft = parseFloat(styles.paddingLeft) || 0;
    const padRight = parseFloat(styles.paddingRight) || 0;
    const innerWidth = gridRect.width - padLeft - padRight;
    const colWidth = innerWidth / totalCols;
    const fieldRect = fieldEl.getBoundingClientRect();
    const fieldLeft = fieldRect.left - gridRect.left - padLeft;

    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);

    const handleMove = (ev: PointerEvent) => {
      const cursorX = ev.clientX - gridRect.left - padLeft;
      const cols = Math.max(1, Math.round((cursorX - fieldLeft) / colWidth));
      const snapped = snapColumnsToSize(cols, bp);
      setResizing((prev) =>
        prev?.fieldId === fieldId && prev.size === snapped
          ? prev
          : { fieldId, size: snapped },
      );
    };

    const handleUp = () => {
      handle.removeEventListener("pointermove", handleMove);
      handle.removeEventListener("pointerup", handleUp);
      handle.removeEventListener("pointercancel", handleUp);
      setResizing((current) => {
        if (current) onFieldResize(current.fieldId, current.size);
        return null;
      });
    };

    handle.addEventListener("pointermove", handleMove);
    handle.addEventListener("pointerup", handleUp);
    handle.addEventListener("pointercancel", handleUp);
  };

  return (
    <SortableContext
      items={fields.map((f) => f.id)}
      strategy={rectSortingStrategy}
    >
      <div
        ref={setRefs}
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
            previewSize={resizing?.fieldId === field.id ? resizing.size : null}
            onClick={() => onFieldClick(field)}
            onResizeStart={handleResizeStart}
          />
        ))}
      </div>
    </SortableContext>
  );
}
