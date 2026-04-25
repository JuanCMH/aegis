"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { FieldType } from "@/packages/clients/types";
import {
  TextCursorInput,
  FileText,
  Hash,
  CircleDollarSign,
  Calendar,
  ChevronDown,
  Phone,
  Mail,
  Paperclip,
  Image,
  ToggleRight,
  Link,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type FieldTypeConfig = {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const FIELD_TYPE_CONFIG: FieldTypeConfig[] = [
  { type: "text", label: "Texto", icon: TextCursorInput },
  { type: "textarea", label: "Descripción", icon: FileText },
  { type: "number", label: "Numérico", icon: Hash },
  { type: "currency", label: "Valor (COP)", icon: CircleDollarSign },
  { type: "date", label: "Fecha", icon: Calendar },
  { type: "select", label: "Selección", icon: ChevronDown },
  { type: "phone", label: "Teléfono", icon: Phone },
  { type: "email", label: "Correo", icon: Mail },
  { type: "file", label: "Archivo", icon: Paperclip },
  { type: "image", label: "Imagen", icon: Image },
  { type: "switch", label: "Sí/No", icon: ToggleRight },
  { type: "url", label: "Enlace", icon: Link },
];

function DraggableFieldItem({ config }: { config: FieldTypeConfig }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${config.type}`,
    data: { type: "palette-item", fieldType: config.type },
  });

  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border/50 bg-card cursor-grab active:cursor-grabbing",
        "hover:border-aegis-sapphire/40 hover:bg-aegis-sapphire/5 transition-all select-none",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center justify-center size-8 rounded-lg bg-muted/60 shrink-0">
        <Icon className="size-4 text-aegis-steel" />
      </div>
      <span className="text-sm font-medium text-aegis-graphite">
        {config.label}
      </span>
    </div>
  );
}

export function FieldPalette() {
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
        <div className="flex flex-col gap-2 py-3">
          {FIELD_TYPE_CONFIG.map((config) => (
            <DraggableFieldItem key={config.type} config={config} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
