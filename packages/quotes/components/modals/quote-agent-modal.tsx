import { addMonths } from "date-fns";
import { FileText, Loader2, Sparkles, X } from "lucide-react";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AegisModal,
  AegisModalContent,
  AegisModalFooter,
  AegisModalHeader,
  DialogClose,
} from "@/components/aegis/aegis-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPdfContent } from "@/lib/extract-pdf";
import { getErrorMessage } from "@/lib/get-error-message";
import { normalizePdfText } from "@/lib/normalize-pdf-text";
import { string2Object } from "@/lib/string-to-object";
import { estimateTokens, MAX_TOKENS } from "@/lib/token-counter";
import { cn } from "@/lib/utils";
import { useGetBondsByCompany } from "@/packages/bonds/api";
import type { BondDataType } from "@/packages/bonds/types";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { useGetQuoteFromDoc } from "../../api";
import type { ContractDataType } from "../../types";

interface QuoteAgentModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setExternalQuoteType: Dispatch<
    SetStateAction<"bidBond" | "performanceBonds">
  >;
  setContractData: Dispatch<SetStateAction<ContractDataType>>;
  setBidBondData: Dispatch<SetStateAction<BondDataType>>;
  setPerformanceBondsData: Dispatch<SetStateAction<Array<BondDataType>>>;
  onFileProcessed?: (file: File) => void;
}

export const QuoteAgentModal = ({
  open,
  setOpen,
  setExternalQuoteType,
  setContractData,
  setBidBondData,
  setPerformanceBondsData,
  onFileProcessed,
}: QuoteAgentModalProps) => {
  const companyId = useCompanyId();
  const fileElementRef = useRef<HTMLInputElement>(null);

  const { execute: getQuote, isPending: isGettingQuote } = useGetQuoteFromDoc();
  const { data: bonds, isLoading: isLoadingBonds } = useGetBondsByCompany({
    companyId,
  });

  const [file, setFile] = useState<File | null>(null);
  const [quoteType, setQuoteType] = useState<"bidBond" | "performanceBonds">(
    "bidBond",
  );

  const isLoading = isGettingQuote || isLoadingBonds;

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    if (fileElementRef.current) fileElementRef.current.value = "";
  };

  const extractPdf = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo no puede superar los 10MB");
      return;
    }

    const result = await getPdfContent(file);
    const text = normalizePdfText(result);

    if (estimateTokens(text) > MAX_TOKENS) {
      toast.error(
        `El documento es demasiado extenso (aprox. ${estimateTokens(
          text,
        )} tokens). El máximo permitido es ${MAX_TOKENS}.`,
      );
      return;
    }

    const performanceBonds =
      bonds?.map((bond) => ({ id: bond._id, name: bond.name })) || [];

    const metadata =
      quoteType === "performanceBonds"
        ? `[QUOTE_TYPE]: ${quoteType}\n[PERFORMANCE_BONDS]: ${JSON.stringify(performanceBonds)}`
        : `[QUOTE_TYPE]: ${quoteType}`;

    const prompt = `${metadata}\n\n---DOCUMENT START---\n${text}\n---DOCUMENT END---`;

    getQuote(
      { prompt },
      {
        onSuccess: (quoteResponse) => {
          const data = string2Object(quoteResponse, quoteType);

          const hasContractData =
            data.contractData.contractor.trim() !== "" ||
            data.contractData.contractee.trim() !== "" ||
            data.contractData.contractValue > 0;

          if (!hasContractData) {
            toast.error(
              "No se pudo extraer información útil del documento. Verifica que el PDF contenga datos del contrato.",
            );
            return;
          }

          setExternalQuoteType(quoteType);
          setContractData(data.contractData);

          if (quoteType === "bidBond") {
            const { contractStart, contractValue } = data.contractData;

            if (
              !(contractStart instanceof Date) ||
              Number.isNaN(contractStart.getTime()) ||
              contractValue <= 0
            ) {
              toast.error("Datos insuficientes para generar la garantía");
              return;
            }

            setBidBondData({
              name: "Seriedad de la oferta",
              startDate: contractStart,
              endDate: addMonths(contractStart, 1),
              percentage: 10,
              insuredValue: contractValue * 0.1,
              rate: 0.15,
            });
          } else {
            setPerformanceBondsData(data.performanceBondsData);
          }

          handleClose();
          onFileProcessed?.(file);
          toast.success("Información extraída exitosamente del PDF");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  const handleQuoteTypeChange = (value: string) => {
    if (value === "bidBond" || value === "performanceBonds") {
      setQuoteType(value);
    }
  };

  return (
    <AegisModal open={open} onOpenChange={handleClose} maxWidth="sm:max-w-xl">
      <AegisModalHeader
        icon={Sparkles}
        title="Asistente de cotización"
        description="Sube un PDF y el asistente extraerá la información más relevante para acelerar tu cotización. Revisa siempre los datos antes de finalizarla."
      />

      <AegisModalContent>
        <form id="quote-agent-form" className="space-y-4" onSubmit={extractPdf}>
          <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            PDF máximo de 10 MB. Funciona mejor con documentos claros y con
            datos legibles del contrato.
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="quote-type"
                className="text-xs font-medium text-aegis-steel"
              >
                Tipo de cotización
              </Label>
              <Select
                disabled={isLoading}
                value={quoteType}
                onValueChange={handleQuoteTypeChange}
              >
                <SelectTrigger id="quote-type" className="w-full">
                  <SelectValue placeholder="Selecciona un tipo de cotización" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bidBond">Seriedad de oferta</SelectItem>
                  <SelectItem value="performanceBonds">Cumplimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="pdf-file"
                className="text-xs font-medium text-aegis-steel"
              >
                Archivo PDF
              </Label>
              <input
                id="pdf-file"
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileElementRef}
                onChange={(e) => {
                  if (e.target.files) setFile(e.target.files[0]);
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="justify-start"
                onClick={() => fileElementRef.current?.click()}
              >
                <FileText className="size-4 text-aegis-sapphire" />
                <span className="ml-2">Adjuntar archivo PDF</span>
              </Button>
            </div>
          </div>

          {!!file && (
            <div className={cn(isLoading && "pointer-events-none opacity-50")}>
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 p-3">
                <div className="flex min-w-0 items-center">
                  {isLoading ? (
                    <Loader2 className="size-5 shrink-0 animate-spin text-aegis-sapphire" />
                  ) : (
                    <FileText className="size-5 shrink-0 text-aegis-sapphire" />
                  )}
                  <div className="ml-3 min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isLoading
                        ? "Extrayendo información del documento..."
                        : "Archivo listo para procesar"}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon-sm"
                  onClick={() => {
                    setFile(null);
                    if (fileElementRef.current)
                      fileElementRef.current.value = "";
                  }}
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                  type="button"
                >
                  <X />
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Dependiendo de la complejidad del documento, el proceso de
              extracción puede tardar unos segundos.
            </p>
          )}
        </form>
      </AegisModalContent>

      <AegisModalFooter>
        <DialogClose asChild>
          <Button disabled={isLoading} variant="outline" type="button">
            Cancelar
          </Button>
        </DialogClose>
        <Button
          form="quote-agent-form"
          disabled={!file || isLoading}
          type="submit"
        >
          Extraer información
        </Button>
      </AegisModalFooter>
    </AegisModal>
  );
};
