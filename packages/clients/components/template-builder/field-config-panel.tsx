"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Trash2, Plus, X } from "lucide-react";
import { FIELD_TYPE_CONFIG } from "./field-palette";
import type { TemplateField, FieldSize } from "@/packages/clients/types";

interface FieldConfigPanelProps {
  field: TemplateField | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (field: TemplateField) => void;
  onDelete: (fieldId: string) => void;
}

const SIZE_OPTIONS: { value: FieldSize; label: string }[] = [
  { value: "small", label: "Pequeño (1/4)" },
  { value: "medium", label: "Medio (1/2)" },
  { value: "large", label: "Grande (3/4)" },
  { value: "full", label: "Completo" },
];

export function FieldConfigPanel({
  field,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: FieldConfigPanelProps) {
  if (!field) return null;

  const fieldTypeConfig = FIELD_TYPE_CONFIG.find((c) => c.type === field.type);
  const Icon = fieldTypeConfig?.icon;

  const update = (partial: Partial<TemplateField>) => {
    onUpdate({ ...field, ...partial });
  };

  const updateConfig = (
    partial: Partial<TemplateField["config"]>,
  ) => {
    onUpdate({ ...field, config: { ...field.config, ...partial } });
  };

  const addOption = () => {
    const options = field.config.options ?? [];
    updateConfig({
      options: [...options, { label: "", value: `opt_${Date.now()}` }],
    });
  };

  const updateOption = (index: number, label: string) => {
    const options = [...(field.config.options ?? [])];
    options[index] = { ...options[index], label };
    updateConfig({ options });
  };

  const removeOption = (index: number) => {
    const options = (field.config.options ?? []).filter((_, i) => i !== index);
    updateConfig({ options });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 gap-0 flex flex-col">
        <SheetHeader className="p-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex items-center justify-center size-9 rounded-xl bg-muted/50 border border-border/40">
                <Icon className="size-4 text-muted-foreground" />
              </div>
            )}
            <div>
              <SheetTitle className="text-sm">
                Configurar campo
              </SheetTitle>
              <p className="text-xs text-muted-foreground/80">
                {fieldTypeConfig?.label}
              </p>
            </div>
          </div>
        </SheetHeader>
        <Separator className="opacity-40" />
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Label */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground/70 font-medium">
                Etiqueta
              </Label>
              <Input
                value={field.label}
                onChange={(e) => update({ label: e.target.value })}
                placeholder="Nombre del campo"
              />
            </div>

            {/* Placeholder */}
            {field.type !== "switch" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground/70 font-medium">
                  Placeholder
                </Label>
                <Input
                  value={field.placeholder ?? ""}
                  onChange={(e) =>
                    update({ placeholder: e.target.value || undefined })
                  }
                  placeholder="Texto de ayuda..."
                />
              </div>
            )}

            {/* Required + Show in table */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
                <Label className="text-xs font-medium">Obligatorio</Label>
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => update({ required: checked })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
                <Label className="text-xs font-medium">En tabla</Label>
                <Switch
                  checked={field.showInTable}
                  onCheckedChange={(checked) =>
                    update({ showInTable: checked })
                  }
                />
              </div>
            </div>

            {/* Size */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground/70 font-medium">
                Tamaño
              </Label>
              <Select
                value={field.size}
                onValueChange={(value: FieldSize) => update({ size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type-specific config */}
            {(field.type === "text" || field.type === "textarea") && (
              <>
                <Separator className="opacity-40" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground/70 font-medium">
                      Mín. caracteres
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={field.config.minLength ?? ""}
                      onChange={(e) =>
                        updateConfig({
                          minLength: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground/70 font-medium">
                      Máx. caracteres
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={field.config.maxLength ?? ""}
                      onChange={(e) =>
                        updateConfig({
                          maxLength: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {(field.type === "number" || field.type === "currency") && (
              <>
                <Separator className="opacity-40" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground/70 font-medium">
                      Valor mínimo
                    </Label>
                    <Input
                      type="number"
                      value={field.config.minValue ?? ""}
                      onChange={(e) =>
                        updateConfig({
                          minValue: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground/70 font-medium">
                      Valor máximo
                    </Label>
                    <Input
                      type="number"
                      value={field.config.maxValue ?? ""}
                      onChange={(e) =>
                        updateConfig({
                          maxValue: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {field.type === "select" && (
              <>
                <Separator className="opacity-40" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground/70 font-medium">
                      Opciones
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="gap-1.5 border-border/40 h-7"
                    >
                      <Plus className="size-3" />
                      <span className="text-xs">Agregar</span>
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {(field.config.options ?? []).map((opt, i) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <Input
                          value={opt.label}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Opción ${i + 1}`}
                          className="h-8 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeOption(i)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                    {(field.config.options ?? []).length === 0 && (
                      <p className="text-xs text-muted-foreground/60 py-2 text-center">
                        Sin opciones. Agrega al menos una.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {(field.type === "file" || field.type === "image") && (
              <>
                <Separator className="opacity-40" />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground/70 font-medium">
                    Tamaño máximo (MB)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={
                      field.config.maxFileSize
                        ? field.config.maxFileSize / (1024 * 1024)
                        : ""
                    }
                    onChange={(e) =>
                      updateConfig({
                        maxFileSize: e.target.value
                          ? Number(e.target.value) * 1024 * 1024
                          : undefined,
                      })
                    }
                    placeholder="Ej: 10"
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <Separator className="opacity-40" />
        <div className="p-4 flex items-center gap-2">
          {!field.isFixed && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mr-auto text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(field.id)}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          )}
          <SheetClose asChild>
            <Button variant="outline" size="sm" className="border-border/40 ml-auto">
              Cerrar
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
