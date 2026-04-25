"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/aegis/date-picker";
import { CurrencyInput } from "@/components/aegis/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Image } from "lucide-react";
import { FIELD_SIZE_SPAN } from "@/packages/clients/lib/grid";
import type { TemplateField } from "@/packages/clients/types";

interface DynamicFieldProps {
  field: TemplateField;
  value: unknown;
  onChange: (fieldId: string, value: unknown) => void;
  readOnly?: boolean;
  onFileUpload?: (fieldId: string, file: File) => void;
  resolvedFileUrl?: string;
  isAiFilled?: boolean;
  error?: string;
}

export function DynamicField({
  field,
  value,
  onChange,
  readOnly,
  onFileUpload,
  resolvedFileUrl,
  isAiFilled,
  error,
}: DynamicFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderInput = () => {
    switch (field.type) {
      case "text":
      case "phone":
      case "email":
      case "url": {
        const typeMap: Record<string, string> = {
          text: "text",
          phone: "tel",
          email: "email",
          url: "url",
        };
        return (
          <Input
            type={typeMap[field.type]}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            readOnly={readOnly}
            required={field.required}
            minLength={field.config.minLength}
            maxLength={field.config.maxLength}
            className={cn(readOnly && "cursor-default")}
          />
        );
      }

      case "textarea":
        return (
          <Textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            readOnly={readOnly}
            required={field.required}
            minLength={field.config.minLength}
            maxLength={field.config.maxLength}
            className={cn("min-h-20 resize-none", readOnly && "cursor-default")}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            readOnly={readOnly}
            required={field.required}
            min={field.config.minValue}
            max={field.config.maxValue}
            className={cn(readOnly && "cursor-default")}
          />
        );

      case "currency":
        return (
          <CurrencyInput
            value={(value as string) ?? ""}
            onChange={(v) => onChange(field.id, v)}
            placeholder={field.placeholder}
            readOnly={readOnly}
          />
        );

      case "date":
        return (
          <DatePicker
            date={value ? new Date(value as string) : undefined}
            onSelect={(d) => onChange(field.id, d?.toISOString())}
            readOnly={readOnly}
            placeholder={field.placeholder}
          />
        );

      case "select":
        return (
          <Select
            value={(value as string) ?? ""}
            onValueChange={(v) => onChange(field.id, v)}
            disabled={readOnly}
          >
            <SelectTrigger className={cn(readOnly && "cursor-default")}>
              <SelectValue
                placeholder={field.placeholder ?? "Seleccionar..."}
              />
            </SelectTrigger>
            <SelectContent>
              {(field.config.options ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "switch":
        return (
          <div className="flex items-center h-9">
            <Switch
              checked={!!value}
              onCheckedChange={(v) => onChange(field.id, v)}
              disabled={readOnly}
            />
          </div>
        );

      case "file":
      case "image": {
        const isImage = field.type === "image";
        const Icon = isImage ? Image : FileText;
        const accept = isImage
          ? "image/*"
          : field.config.acceptedFormats?.join(",");

        if (readOnly) {
          if (resolvedFileUrl) {
            return (
              <a
                href={resolvedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate block"
              >
                {isImage ? "Ver imagen" : "Ver archivo"}
              </a>
            );
          }
          return (
            <p className="text-sm text-muted-foreground/60">Sin archivo</p>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (
                    field.config.maxFileSize &&
                    file.size > field.config.maxFileSize
                  ) {
                    return;
                  }
                  onFileUpload?.(field.id, file);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 border-border/40"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              {value ? "Cambiar" : "Subir"}
            </Button>
            {!!value && (
              <span className="text-xs text-muted-foreground truncate">
                Archivo cargado
              </span>
            )}
            {resolvedFileUrl && isImage && (
              <img
                src={resolvedFileUrl}
                alt={field.label}
                className="size-8 rounded-md object-cover border border-border/40"
              />
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={cn(FIELD_SIZE_SPAN[field.size], "space-y-1.5")}>
      {field.type !== "switch" ? (
        <Label className="text-xs text-muted-foreground/70 font-medium flex items-center gap-1">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
          {isAiFilled && (
            <span className="text-[10px] font-semibold text-aegis-sapphire bg-aegis-sapphire/10 px-1 py-0.5 rounded">
              IA
            </span>
          )}
        </Label>
      ) : (
        <Label className="text-xs text-muted-foreground/70 font-medium flex items-center gap-1">
          {field.label}
          {isAiFilled && (
            <span className="text-[10px] font-semibold text-aegis-sapphire bg-aegis-sapphire/10 px-1 py-0.5 rounded">
              IA
            </span>
          )}
        </Label>
      )}
      {renderInput()}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
