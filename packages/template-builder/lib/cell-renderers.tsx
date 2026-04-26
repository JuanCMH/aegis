"use client";

import { Hint } from "@/components/aegis/hint";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Check,
  Minus,
  Paperclip,
  ImageIcon,
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import { fullDateTime, shortDate } from "@/lib/date-formats";
import { formatCop } from "@/lib/format-cop";
import type { TemplateField } from "@/packages/template-builder/types";

/**
 * Helpers de tabla genéricos: mapeo tamaño-de-columna por tipo, alineación,
 * comparable para sort, header con flecha y celda dinámica.
 *
 * Cualquier módulo (clients, policies, …) consume estos helpers desde su
 * propio `createXyzColumns` factory para construir columnas dinámicas a
 * partir de los `fields` del template.
 */

export function widthClassFor(field: TemplateField): string {
  switch (field.type) {
    case "switch":
      return "w-20";
    case "number":
      return "w-24";
    case "currency":
      return "w-32";
    case "date":
      return "w-28";
    case "phone":
    case "email":
      return "w-44";
    case "url":
      return "w-40";
    case "file":
    case "image":
      return "w-24";
    case "textarea":
      return "min-w-64 max-w-80";
    case "select":
      return "min-w-32";
    default:
      return "min-w-40 max-w-64";
  }
}

export function alignClassFor(field: TemplateField): string {
  if (field.type === "number" || field.type === "currency") return "text-right";
  if (field.type === "switch") return "text-center";
  return "text-left";
}

export function sortStringValue(field: TemplateField, value: unknown): string {
  if (value == null || value === "") return "";
  if (field.type === "switch") return value ? "1" : "0";
  if (field.type === "number" || field.type === "currency") {
    const n = Number(value);
    return Number.isNaN(n) ? "" : String(n).padStart(20, "0");
  }
  if (field.type === "date" && typeof value === "string") {
    return value;
  }
  if (field.type === "select") {
    const opt = field.config.options?.find((o) => o.value === value);
    return opt?.label ?? String(value);
  }
  return String(value);
}

export function SortHeader<TData>({
  column,
  children,
  align = "start",
}: {
  column: import("@tanstack/react-table").Column<TData, unknown>;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
}) {
  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <Button
      size="sm"
      variant="ghost"
      className={`h-7 has-[>svg]:px-2 ${
        align === "end" ? "ml-auto" : align === "center" ? "mx-auto" : ""
      }`}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span className="text-xs font-medium">{children}</span>
      <Icon className={`size-3.5 ${sorted ? "opacity-100" : "opacity-40"}`} />
    </Button>
  );
}

export function FieldCell({
  field,
  raw,
}: {
  field: TemplateField;
  raw: unknown;
}) {
  if (raw == null || raw === "") {
    return <span className="text-muted-foreground/60">—</span>;
  }

  switch (field.type) {
    case "switch": {
      return raw ? (
        <Check className="mx-auto size-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Minus className="mx-auto size-4 text-muted-foreground/50" />
      );
    }

    case "currency": {
      const num = Number(raw);
      const display = Number.isNaN(num) ? String(raw) : formatCop(num);
      return (
        <span className="block text-right font-medium tabular-nums">
          {display}
        </span>
      );
    }

    case "number": {
      const num = Number(raw);
      const display = Number.isNaN(num)
        ? String(raw)
        : new Intl.NumberFormat("es-CO").format(num);
      return <span className="block text-right tabular-nums">{display}</span>;
    }

    case "date": {
      if (typeof raw !== "string") return <span>{String(raw)}</span>;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return <span>{raw}</span>;
      return (
        <Hint label={fullDateTime(d)}>
          <span className="block tabular-nums">{shortDate(d)}</span>
        </Hint>
      );
    }

    case "select": {
      const opt = field.config.options?.find((o) => o.value === raw);
      const label = opt?.label ?? String(raw);
      return (
        <Badge variant="secondary" className="font-normal max-w-full truncate">
          {label}
        </Badge>
      );
    }

    case "email": {
      const v = String(raw);
      return (
        <Hint label={v}>
          <a
            href={`mailto:${v}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 truncate text-foreground hover:underline"
          >
            <Mail className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{v}</span>
          </a>
        </Hint>
      );
    }

    case "phone": {
      const v = String(raw);
      return (
        <a
          href={`tel:${v.replace(/\s+/g, "")}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 truncate text-foreground hover:underline"
        >
          <Phone className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="tabular-nums">{v}</span>
        </a>
      );
    }

    case "url": {
      const v = String(raw);
      return (
        <a
          href={v}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex max-w-full items-center gap-1.5 truncate text-foreground hover:underline"
        >
          <span className="truncate">{v}</span>
          <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
        </a>
      );
    }

    case "file":
    case "image": {
      const v = typeof raw === "string" ? raw : "";
      const Icon = field.type === "image" ? ImageIcon : Paperclip;
      if (!v) {
        return <span className="text-muted-foreground/60">—</span>;
      }
      return (
        <Badge
          variant="secondary"
          className="font-normal inline-flex items-center gap-1"
        >
          <Icon className="size-3" />
          {field.type === "image" ? "Imagen" : "Archivo"}
        </Badge>
      );
    }

    case "textarea": {
      const v = String(raw);
      return (
        <Hint label={v}>
          <span className="line-clamp-1 max-w-80 text-muted-foreground">
            {v}
          </span>
        </Hint>
      );
    }

    default: {
      const v = String(raw);
      return (
        <Hint label={v}>
          <span className="block truncate">{v}</span>
        </Hint>
      );
    }
  }
}
