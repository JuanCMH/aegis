"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RiAttachmentLine,
  RiCloseLine,
  RiLoader3Line,
  RiSparklingFill,
} from "@remixicon/react";
import { getPdfContent } from "@/lib/extract-pdf";
import { normalizePdfText } from "@/lib/normalize-pdf-text";
import {
  useGenerateTemplateFromDoc,
  useReviewTemplate,
} from "@/packages/clients/api";
import type { TemplateSection, TemplateField } from "@/packages/clients/types";

type ReviewSuggestion = {
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
}

type Tab = "generate" | "review";

export function TemplateAiModal({
  open,
  onOpenChange,
  sections,
  onApplyGenerated,
  onApplySuggestions,
}: TemplateAiModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("generate");
  const [file, setFile] = useState<File | null>(null);
  const [instruction, setInstruction] = useState("");

  // Generate mode
  const { execute: generateFromDoc, isPending: isGenerating } =
    useGenerateTemplateFromDoc();

  // Review mode
  const { execute: reviewTemplate, isPending: isReviewing } =
    useReviewTemplate();
  const [suggestions, setSuggestions] = useState<
    (ReviewSuggestion & { accepted: boolean })[]
  >([]);

  const isLoading = isGenerating || isReviewing;

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

      const response = await generateFromDoc({ prompt: text });
      if (!response) return;

      const cleaned = response.replace(/```json\n?|```/g, "").trim();
      const parsed = JSON.parse(cleaned) as {
        sections: TemplateSection[];
      };

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
      const response = await reviewTemplate({
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

  const handleClose = () => {
    onOpenChange(false);
    setFile(null);
    setInstruction("");
    setSuggestions([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0 max-w-lg">
        <DialogHeader className="p-4">
          <DialogTitle className="flex items-center gap-2">
            <RiSparklingFill className="size-4 text-h-indigo" />
            Asistente de plantilla
          </DialogTitle>
          <DialogDescription>
            Genera una plantilla desde un documento o revisa la plantilla actual
            para obtener sugerencias de mejora.
          </DialogDescription>
        </DialogHeader>
        <Separator className="opacity-40" />

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3">
          <button
            type="button"
            onClick={() => {
              setTab("generate");
              setSuggestions([]);
            }}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              tab === "generate"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            Generar desde documento
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("review");
              setFile(null);
            }}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              tab === "review"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            Revisar plantilla
          </button>
        </div>

        {tab === "generate" ? (
          <form className="space-y-3 p-4" onSubmit={handleGenerate}>
            <div className="grid w-full items-center gap-1.5">
              <Label className="text-xs text-muted-foreground/70 font-medium">
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
                className="justify-start border-border/40"
                onClick={() => fileRef.current?.click()}
              >
                <RiAttachmentLine className="size-4 text-muted-foreground" />
                <span className="ml-2">Adjuntar archivo</span>
              </Button>
            </div>
            {!!file && (
              <div
                className={cn(isLoading && "opacity-50 pointer-events-none")}
              >
                <div className="border border-border/40 rounded-md flex items-center justify-between p-2">
                  <div className="flex items-center">
                    {isLoading ? (
                      <RiLoader3Line className="size-5 text-muted-foreground shrink-0 animate-spin" />
                    ) : (
                      <RiAttachmentLine className="size-5 text-muted-foreground shrink-0" />
                    )}
                    <span className="ml-2 text-sm line-clamp-1">
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
                    <RiCloseLine />
                  </Button>
                </div>
              </div>
            )}
            {isLoading && (
              <p className="text-xs text-muted-foreground">
                Analizando el documento y generando la plantilla...
              </p>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button disabled={isLoading} variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button disabled={!file || isLoading} type="submit">
                Generar plantilla
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form className="space-y-3 p-4" onSubmit={handleReview}>
            {suggestions.length === 0 ? (
              <>
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-xs text-muted-foreground/70 font-medium">
                    Instrucciones adicionales (opcional)
                  </Label>
                  <Textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Ej: Agrega campos para información bancaria, cambia los campos de contacto..."
                    className="min-h-20 resize-none border-border/40"
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
                <DialogFooter>
                  <DialogClose asChild>
                    <Button disabled={isLoading} variant="outline">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    disabled={isLoading || sections.length === 0}
                    type="submit"
                  >
                    Revisar
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-md border border-border/40"
                    >
                      <Checkbox
                        checked={s.accepted}
                        onCheckedChange={() => toggleSuggestion(i)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-1 py-0.5 rounded uppercase",
                              s.type === "add" &&
                                "text-green-500 bg-green-500/10",
                              s.type === "modify" &&
                                "text-yellow-500 bg-yellow-500/10",
                              s.type === "remove" &&
                                "text-red-500 bg-red-500/10",
                            )}
                          >
                            {s.type === "add"
                              ? "Agregar"
                              : s.type === "modify"
                                ? "Modificar"
                                : "Eliminar"}
                          </span>
                          <span className="text-xs font-medium truncate">
                            {s.field.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">
                            en {s.sectionLabel}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {s.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <DialogFooter>
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
                </DialogFooter>
              </>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type { ReviewSuggestion };
