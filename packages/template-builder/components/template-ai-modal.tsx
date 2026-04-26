"use client";

import { Loader2, Paperclip, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  AegisModal,
  AegisModalContent,
  AegisModalFooter,
  AegisModalHeader,
  DialogClose,
} from "@/components/aegis/aegis-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getPdfContent } from "@/lib/extract-pdf";
import { normalizePdfText } from "@/lib/normalize-pdf-text";
import { cn } from "@/lib/utils";
import type {
  TemplateField,
  TemplateSection,
} from "@/packages/template-builder/types";

export type ReviewSuggestion = {
  type: "add" | "modify" | "remove";
  sectionId: string;
  sectionLabel: string;
  field: TemplateField;
  reason: string;
};

interface TemplateAiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: TemplateSection[];
  onApplyGenerated: (sections: TemplateSection[]) => void;
  onApplySuggestions: (suggestions: ReviewSuggestion[]) => void;
  /**
   * Async generator: recibe el texto del PDF normalizado y devuelve el JSON
   * crudo (sin parsear) emitido por el agente — el modal se encarga de
   * limpiar fences y parsear `{ sections: [...] }`.
   */
  onGenerateFromText: (prompt: string) => Promise<string | null | undefined>;
  /**
   * Async revisor: recibe las secciones actuales + instrucción opcional,
   * devuelve el JSON crudo del agente con `{ suggestions: [...] }`.
   */
  onReviewTemplate: (args: {
    sections: TemplateSection[];
    instruction?: string;
  }) => Promise<string | null | undefined>;
  isGenerating: boolean;
  isReviewing: boolean;
  /** Texto contextual para el header (ej. "plantilla de clientes"). */
  entityLabel?: string;
}

/**
 * Modal genérico de asistente IA para plantillas. No conoce de Convex ni de
 * dominios — el consumidor le inyecta los handlers que disparan los actions.
 */
export function TemplateAiModal({
  open,
  onOpenChange,
  sections,
  onApplyGenerated,
  onApplySuggestions,
  onGenerateFromText,
  onReviewTemplate,
  isGenerating,
  isReviewing,
  entityLabel,
}: TemplateAiModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"generate" | "review">("generate");
  const [file, setFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState("");
  const [suggestions, setSuggestions] = useState<
    (ReviewSuggestion & { accepted: boolean })[]
  >([]);

  const isLoading = isGenerating || isReviewing;

  const handleClose = () => {
    onOpenChange(false);
    setFile(null);
    setInstruction("");
    setSuggestions([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo no puede superar los 10MB");
      return;
    }

    try {
      const raw = await getPdfContent(file);
      const text = normalizePdfText(raw);

      if (!text.trim()) {
        toast.error("No se pudo extraer texto del documento");
        return;
      }

      const response = await onGenerateFromText(text);
      if (!response) return;

      const cleaned = response.replace(/```json\n?|```/g, "").trim();
      const parsed = JSON.parse(cleaned) as { sections: TemplateSection[] };

      if (!parsed.sections || parsed.sections.length === 0) {
        toast.error("No se pudo generar una plantilla a partir del documento");
        return;
      }

      onApplyGenerated(parsed.sections);
      toast.success(
        `Plantilla generada con ${parsed.sections.length} secciones`,
      );
      handleClose();
    } catch {
      toast.error("Error al generar la plantilla desde el documento");
    }
  };

  const handleReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await onReviewTemplate({
        sections,
        instruction: instruction.trim() || undefined,
      });
      if (!response) return;

      const cleaned = response.replace(/```json\n?|```/g, "").trim();
      const parsed = JSON.parse(cleaned) as {
        suggestions: ReviewSuggestion[];
      };

      if (!parsed.suggestions || parsed.suggestions.length === 0) {
        toast.info("La IA no encontró sugerencias para la plantilla actual");
        return;
      }

      setSuggestions(parsed.suggestions.map((s) => ({ ...s, accepted: true })));
    } catch {
      toast.error("Error al revisar la plantilla");
    }
  };

  const handleApplySuggestions = () => {
    const accepted = suggestions.filter((s) => s.accepted);
    if (accepted.length === 0) {
      toast.info("No hay sugerencias seleccionadas");
      return;
    }
    onApplySuggestions(accepted);
    toast.success(`Se aplicaron ${accepted.length} sugerencias`);
    handleClose();
  };

  const toggleSuggestion = (index: number) => {
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, accepted: !s.accepted } : s)),
    );
  };

  const description = entityLabel
    ? `Genera una ${entityLabel} desde un documento o revisa la actual para obtener sugerencias de mejora.`
    : "Genera una plantilla desde un documento o revisa la actual para obtener sugerencias de mejora.";

  return (
    <AegisModal open={open} onOpenChange={handleClose} maxWidth="sm:max-w-lg">
      <AegisModalHeader
        icon={Sparkles}
        title="Asistente de plantilla"
        description={description}
      />

      <AegisModalContent className="space-y-4">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as "generate" | "review");
            setSuggestions([]);
            setFile(null);
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Desde documento</TabsTrigger>
            <TabsTrigger value="review">Revisar actual</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-4">
            <form
              id="template-ai-form"
              className="space-y-3"
              onSubmit={handleGenerate}
            >
              <div className="grid w-full items-center gap-1.5">
                <Label className="text-xs font-medium text-aegis-steel">
                  Documento PDF
                </Label>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  ref={fileRef}
                  onChange={(e) => {
                    if (e.target.files) setFile(e.target.files[0]);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className="justify-start"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip className="size-4 text-muted-foreground" />
                  <span className="ml-2">Adjuntar archivo</span>
                </Button>
              </div>

              {!!file && (
                <div
                  className={cn(isLoading && "opacity-50 pointer-events-none")}
                >
                  <div className="flex items-center justify-between rounded-md border border-border/60 p-2">
                    <div className="flex items-center">
                      {isLoading ? (
                        <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
                      ) : (
                        <Paperclip className="size-5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="ml-2 line-clamp-1 text-sm">
                        {file.name}
                      </span>
                    </div>
                    <Button
                      size="icon-sm"
                      onClick={() => {
                        setFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      variant="destructive"
                      disabled={isLoading}
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              )}

              {isLoading && (
                <p className="text-xs text-muted-foreground">
                  Analizando el documento y generando la plantilla...
                </p>
              )}
            </form>
          </TabsContent>

          <TabsContent value="review" className="mt-4">
            {suggestions.length === 0 ? (
              <form
                id="template-ai-form"
                className="space-y-3"
                onSubmit={handleReview}
              >
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-xs font-medium text-aegis-steel">
                    Instrucciones adicionales (opcional)
                  </Label>
                  <Textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Ej: Agrega campos para información bancaria, cambia los campos de contacto..."
                    className="min-h-20 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  La IA analizará la plantilla actual ({sections.length}{" "}
                  secciones,{" "}
                  {sections.reduce((acc, s) => acc + s.fields.length, 0)}{" "}
                  campos) y sugerirá mejoras.
                </p>
                {isLoading && (
                  <p className="text-xs text-muted-foreground">
                    Revisando la plantilla...
                  </p>
                )}
              </form>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <div
                    key={`${s.sectionId}-${i}`}
                    className="flex items-start gap-2 rounded-md border border-border/60 p-2"
                  >
                    <Checkbox
                      checked={s.accepted}
                      onCheckedChange={() => toggleSuggestion(i)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "rounded px-1 py-0.5 text-[10px] font-semibold uppercase",
                            s.type === "add" &&
                              "bg-aegis-emerald/10 text-aegis-emerald",
                            s.type === "modify" &&
                              "bg-aegis-amber/10 text-aegis-amber",
                            s.type === "remove" &&
                              "bg-destructive/10 text-destructive",
                          )}
                        >
                          {s.type === "add"
                            ? "Agregar"
                            : s.type === "modify"
                              ? "Modificar"
                              : "Eliminar"}
                        </span>
                        <span className="truncate text-xs font-medium">
                          {s.field.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70">
                          en {s.sectionLabel}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground/70">
                        {s.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </AegisModalContent>

      <AegisModalFooter>
        {tab === "review" && suggestions.length > 0 ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSuggestions([])}
            >
              Volver
            </Button>
            <Button type="button" onClick={handleApplySuggestions}>
              Aplicar seleccionadas (
              {suggestions.filter((s) => s.accepted).length})
            </Button>
          </>
        ) : (
          <>
            <DialogClose asChild>
              <Button disabled={isLoading} variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
            {tab === "generate" ? (
              <Button
                form="template-ai-form"
                disabled={!file || isLoading}
                type="submit"
              >
                Generar plantilla
              </Button>
            ) : (
              <Button
                form="template-ai-form"
                disabled={isLoading || sections.length === 0}
                type="submit"
              >
                Revisar
              </Button>
            )}
          </>
        )}
      </AegisModalFooter>
    </AegisModal>
  );
}
