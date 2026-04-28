"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FileSignature, AlertTriangle } from "lucide-react";
import {
  AegisModal,
  AegisModalContent,
  AegisModalFooter,
  AegisModalHeader,
} from "@/components/aegis/aegis-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { getErrorMessage } from "@/lib/get-error-message";
import { useGetPolicyTemplate } from "@/packages/policies/api";
import { useConvertQuoteToPolicy } from "../../api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

interface QuoteConvertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Doc<"quotes">;
  /** Override redirect target after successful convert. */
  onConverted?: (policyId: Id<"policies">) => void;
}

/**
 * Modal para convertir una cotización aceptada en póliza activa. Muestra el
 * número de póliza (requerido), referencia al template y permite navegar al
 * editor de plantilla si la empresa aún no tiene una.
 */
export function QuoteConvertModal({
  open,
  onOpenChange,
  quote,
  onConverted,
}: QuoteConvertModalProps) {
  const router = useRouter();
  const { data: template, isLoading: isLoadingTemplate } = useGetPolicyTemplate(
    {
      companyId: quote.companyId,
    },
  );
  const { mutate: convert, isPending } = useConvertQuoteToPolicy();

  const [policyNumber, setPolicyNumber] = useState(
    quote.quoteNumber ? quote.quoteNumber.replace(/^COT/, "POL") : "",
  );

  useEffect(() => {
    if (!open) return;
    setPolicyNumber(
      quote.quoteNumber ? quote.quoteNumber.replace(/^COT/, "POL") : "",
    );
  }, [open, quote.quoteNumber]);

  const hasTemplate = !!template && !isLoadingTemplate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNumber.trim()) {
      toast.error("Ingresa un número de póliza.");
      return;
    }
    convert(
      {
        quoteId: quote._id,
        policyNumber: policyNumber.trim(),
        templateId: template?._id,
      },
      {
        onSuccess: (policyId) => {
          toast.success("Cotización convertida en póliza");
          onOpenChange(false);
          if (onConverted) {
            onConverted(policyId as Id<"policies">);
          } else {
            router.push(`/companies/${quote.companyId}/policies/${policyId}`);
          }
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <AegisModal open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-md">
      <AegisModalHeader
        icon={FileSignature}
        title="Convertir a póliza"
        description="Genera una póliza activa a partir de esta cotización aceptada."
      />
      <form onSubmit={handleSubmit}>
        <AegisModalContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="policy-number" className="text-xs">
              NÚMERO DE PÓLIZA*
            </Label>
            <Input
              id="policy-number"
              autoFocus
              placeholder="POL-2026-0001"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Identificador único de la póliza dentro de tu empresa.
            </p>
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/30 p-3 text-xs">
            <p className="mb-1 font-semibold">Plantilla de póliza</p>
            {isLoadingTemplate ? (
              <p className="text-muted-foreground">Cargando plantilla...</p>
            ) : hasTemplate ? (
              <p className="text-muted-foreground">
                Se usará la plantilla configurada de la empresa (
                {template?.sections?.length ?? 0} sección
                {(template?.sections?.length ?? 0) === 1 ? "" : "es"}).
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-aegis-amber">
                  <AlertTriangle className="size-4 shrink-0" />
                  <p>
                    Tu empresa aún no tiene una plantilla de póliza configurada.
                    Configúrala antes de convertir.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link
                    href={`/companies/${quote.companyId}/settings/policy-template`}
                  >
                    Configurar plantilla
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </AegisModalContent>
        <AegisModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !hasTemplate}>
            <FileSignature />
            Convertir
          </Button>
        </AegisModalFooter>
      </form>
    </AegisModal>
  );
}
