"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  Calendar,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Hash,
  Image,
  Link,
  Mail,
  Paperclip,
  Phone,
  TextCursorInput,
  ToggleRight,
} from "lucide-react";
import { Hint } from "@/components/aegis/hint";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { FieldType } from "@/packages/template-builder/types";

type FieldCategory = "text" | "numeric" | "date" | "choice" | "file";

type FieldTypeConfig = {
  type: FieldType;
  label: string;
  description: string;
  category: FieldCategory;
  icon: React.ComponentType<{ className?: string }>;
};

export const FIELD_TYPE_CONFIG: FieldTypeConfig[] = [
  // Texto
  {
    type: "text",
    label: "Texto",
    description: "Texto corto en una sola línea (nombres, referencias).",
    category: "text",
    icon: TextCursorInput,
  },
  {
    type: "textarea",
    label: "Descripción",
    description: "Texto largo de varias líneas (notas, observaciones).",
    category: "text",
    icon: FileText,
  },
  {
    type: "email",
    label: "Correo",
    description: "Validación automática de formato de email.",
    category: "text",
    icon: Mail,
  },
  {
    type: "phone",
    label: "Teléfono",
    description: "Optimizado para teclado numérico en móvil.",
    category: "text",
    icon: Phone,
  },
  {
    type: "url",
    label: "Enlace",
    description: "URL con validación de formato.",
    category: "text",
    icon: Link,
  },
  // Numérico
  {
    type: "number",
    label: "Numérico",
    description: "Solo números (cantidades, edades).",
    category: "numeric",
    icon: Hash,
  },
  {
    type: "currency",
    label: "Valor (COP)",
    description: "Formato de moneda con separador de miles.",
    category: "numeric",
    icon: CircleDollarSign,
  },
  // Fechas
  {
    type: "date",
    label: "Fecha",
    description: "Calendario para seleccionar una fecha.",
    category: "date",
    icon: Calendar,
  },
  // Selección
  {
    type: "select",
    label: "Selección",
    description: "Lista desplegable con opciones predefinidas.",
    category: "choice",
    icon: ChevronDown,
  },
  {
    type: "switch",
    label: "Sí / No",
    description: "Interruptor binario para valores booleanos.",
    category: "choice",
    icon: ToggleRight,
  },
  // Archivos
  {
    type: "file",
    label: "Archivo",
    description: "Subida de documentos (PDF, Word, etc).",
    category: "file",
    icon: Paperclip,
  },
  {
    type: "image",
    label: "Imagen",
    description: "Subida de imágenes con vista previa.",
    category: "file",
    icon: Image,
  },
];

const CATEGORY_LABELS: Record<FieldCategory, string> = {
  text: "Texto",
  numeric: "Numérico",
  date: "Fechas",
  choice: "Selección",
  file: "Archivos",
};

const CATEGORY_ORDER: FieldCategory[] = [
  "text",
  "numeric",
  "date",
  "choice",
  "file",
];

function DraggableFieldItem({ config }: { config: FieldTypeConfig }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${config.type}`,
    data: { type: "palette-item", fieldType: config.type },
  });

  const Icon = config.icon;

  return (
    <Hint label={config.description} side="left" align="center">
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg border border-transparent bg-card cursor-grab active:cursor-grabbing",
          "hover:border-aegis-sapphire/40 hover:bg-aegis-sapphire/5 hover:shadow-sm",
          "transition-all select-none",
          isDragging && "opacity-40",
        )}
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/60 transition-colors group-hover:bg-aegis-sapphire/10">
          <Icon className="size-3.5 text-aegis-steel" />
        </div>
        <span className="text-sm font-medium text-aegis-graphite">
          {config.label}
        </span>
      </div>
    </Hint>
  );
}

export function FieldPalette() {
  // Group fields by category preserving order
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: FIELD_TYPE_CONFIG.filter((f) => f.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-border/40">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-aegis-steel">
          Campos disponibles
        </h3>
        <p className="mt-1 text-[11px] text-aegis-steel/80">
          Arrastra al canvas para agregar
        </p>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-4 py-3">
          {grouped.map(({ category, items }) => (
            <div key={category} className="flex flex-col gap-1">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-aegis-steel/60">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="flex flex-col gap-1">
                {items.map((config) => (
                  <DraggableFieldItem key={config.type} config={config} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
