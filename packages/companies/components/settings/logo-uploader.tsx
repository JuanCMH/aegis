"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { useGenerateUploadUrl } from "@/components/hooks/use-generate-upload-url";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useSetCompanyLogo } from "../../api";
import { gradientForName, initialOf } from "../../lib/company-visuals";

interface LogoUploaderProps {
  companyId: Id<"companies">;
  companyName?: string;
  logoUrl?: string | null;
  canEdit: boolean;
}

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPT = "image/png,image/jpeg,image/webp";

export function LogoUploader({
  companyId,
  companyName,
  logoUrl,
  canEdit,
}: LogoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { mutate: generateUploadUrl, isPending: generating } =
    useGenerateUploadUrl();
  const { mutate: setLogo, isPending: settingLogo } = useSetCompanyLogo();

  const isUploading = generating || settingLogo;

  const upload = async (file: File) => {
    if (!ACCEPT.split(",").includes(file.type)) {
      toast.error("Formato no soportado. Usa PNG, JPG o WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("La imagen supera 2 MB.");
      return;
    }

    const url = await generateUploadUrl({}, { throwError: true });
    if (!url) {
      toast.error("No se pudo iniciar la subida.");
      return;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) {
      toast.error("Falló la subida del logo.");
      return;
    }
    const { storageId } = (await res.json()) as {
      storageId: Id<"_storage">;
    };

    setLogo(
      { id: companyId, logo: storageId },
      {
        onSuccess: () => toast.success("Logo actualizado"),
        onError: () => toast.error("No se pudo guardar el logo"),
      },
    );
  };

  const handleRemove = () => {
    setLogo(
      { id: companyId, logo: null },
      {
        onSuccess: () => toast.success("Logo eliminado"),
        onError: () => toast.error("No se pudo eliminar el logo"),
      },
    );
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (!canEdit) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Preview */}
      <div
        className={cn(
          "relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted/40 transition",
          dragOver && "border-aegis-sapphire ring-2 ring-aegis-sapphire/30",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (canEdit) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={companyName ?? "Logo"}
            className="size-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex size-full items-center justify-center bg-linear-to-br text-2xl font-semibold text-foreground/80",
              gradientForName(companyName),
            )}
          >
            {initialOf(companyName)}
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="size-5 animate-spin text-aegis-sapphire" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-sm font-medium tracking-tight">Logo de la agencia</p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG o WebP. Máximo 2&nbsp;MB. Recomendado cuadrado.
        </p>
        {canEdit && (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="size-4" />
              {logoUrl ? "Cambiar" : "Subir logo"}
            </Button>
            {logoUrl && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isUploading}
                onClick={handleRemove}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
                Quitar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
