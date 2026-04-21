import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { addMonths } from "date-fns";
import { Label } from "@/components/ui/label";
import { ContractDataType } from "../../types";
import { useGetQuoteFromDoc } from "../../api";
import { Button } from "@/components/ui/button";
import { getPdfContent } from "@/lib/extract-pdf";
import { BondDataType } from "@/packages/bonds/types";
import { Separator } from "@/components/ui/separator";
import { string2Object } from "@/lib/string-to-object";
import { getErrorMessage } from "@/lib/get-error-message";
import { normalizePdfText } from "@/lib/normalize-pdf-text";
import { useGetBondsByWorkspace } from "@/packages/bonds/api";
import { estimateTokens, MAX_TOKENS } from "@/lib/token-counter";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useWorkspaceId } from "@/packages/workspaces/hooks/use-workspace-id";
import {
  RiAttachmentLine,
  RiCloseLine,
  RiFilePdf2Line,
  RiLoader3Line,
  RiSparklingFill,
} from "@remixicon/react";

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
  const workspaceId = useWorkspaceId();
  const fileElementRef = useRef<HTMLInputElement>(null);

  const {
    execute: getQuote,
    isPending: isGettingQuote,
    errorMessage,
  } = useGetQuoteFromDoc();
  const { data: bonds, isLoading: isLoadingBonds } = useGetBondsByWorkspace({
    workspaceId,
  });

  const [file, setFile] = useState<File | null>(null);
  const [quoteType, setQuoteType] = useState<"bidBond" | "performanceBonds">(
    "bidBond",
  );

  const isLoading = isGettingQuote || isLoadingBonds;

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
      bonds?.map((bond) => ({
        id: bond._id,
        name: bond.name,
      })) || [];

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
              isNaN(contractStart.getTime()) ||
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

          setOpen(false);
          setFile(null);
          if (fileElementRef.current) {
            fileElementRef.current.value = "";
          }

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="p-4">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-10 items-center justify-center rounded-lg border border-h-indigo/10 bg-h-indigo/10 text-h-indigo">
              <RiSparklingFill className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Asistente de cotización</DialogTitle>
              <DialogDescription className="max-w-prose text-sm leading-relaxed text-muted-foreground/80">
                Sube un PDF y el asistente extraera la informacion mas relevante
                para acelerar tu cotizacion. Revisa siempre los datos antes de
                finalizarla.
              </DialogDescription>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs text-muted-foreground/80">
            PDF maximo de 10 MB. Funciona mejor con documentos claros y con
            datos legibles del contrato.
          </div>
        </DialogHeader>
        <Separator className="opacity-40" />
        <form className="space-y-4 p-4" onSubmit={extractPdf}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid w-full items-center gap-1">
              <Label htmlFor="quote-type" className="text-xs">
                TIPO DE COTIZACIÓN
              </Label>
              <Select
                disabled={isLoading}
                value={quoteType}
                onValueChange={handleQuoteTypeChange}
              >
                <SelectTrigger className="w-full border-border/40 bg-background/80 dark:bg-background/30">
                  <SelectValue
                    placeholder={"Selecciona un tipo de cotización"}
                  />
                </SelectTrigger>
                <SelectContent className="flex max-h-48">
                  <SelectItem value="bidBond">Seriedad de oferta</SelectItem>
                  <SelectItem value="performanceBonds">Cumplimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full items-center gap-1">
              <Label htmlFor="pdf-file" className="text-xs">
                SUBIR ARCHIVO PDF
              </Label>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileElementRef}
                onChange={(e) => {
                  if (e.target.files) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="justify-start border-dashed border-border/60 bg-muted/20 hover:bg-muted/40"
                onClick={() => fileElementRef.current?.click()}
              >
                <RiFilePdf2Line className="size-4 text-h-indigo" />
                <span className="ml-2">Adjuntar archivo PDF</span>
              </Button>
            </div>
          </div>
          {!!file && (
            <div className={cn(isLoading && "pointer-events-none opacity-50")}>
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3">
                <div className="flex min-w-0 items-center">
                  {isLoading ? (
                    <RiLoader3Line className="size-5 shrink-0 animate-spin text-h-indigo" />
                  ) : (
                    <RiFilePdf2Line className="size-5 shrink-0 text-h-indigo" />
                  )}
                  <div className="ml-3 min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground/80">
                      {isLoading
                        ? "Extrayendo informacion del documento..."
                        : "Archivo listo para procesar"}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon-sm"
                  onClick={() => {
                    setFile(null);
                    fileElementRef.current!.value = "";
                  }}
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  <RiCloseLine />
                </Button>
              </div>
            </div>
          )}
          {isLoading && (
            <p className="text-sm text-muted-foreground/80">
              Dependiendo de la complejidad del documento, el proceso de
              extracción puede tardar unos segundos.
            </p>
          )}
          <DialogFooter className="border-t border-border/40 pt-4">
            <DialogClose asChild>
              <Button disabled={isLoading} variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button disabled={!file || isLoading} type="submit">
              Extraer información
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
