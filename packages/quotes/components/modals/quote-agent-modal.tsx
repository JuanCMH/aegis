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
import { Label } from "@/components/ui/label";
import { useGetQuoteFromDoc } from "../../api";
import { Button } from "@/components/ui/button";
import { getPdfContent } from "@/lib/extract-pdf";
import { Separator } from "@/components/ui/separator";
import { normalizePdfText } from "@/lib/normalize-pdf-text";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { RiAttachmentLine, RiCloseLine, RiLoader3Line } from "@remixicon/react";
import { toast } from "sonner";
import { ContractDataType } from "../../types";
import { BondDataType } from "@/packages/bonds/types";
import { string2Object } from "@/lib/string-to-object";
import { addMonths } from "date-fns";
import { useGetBondsByWorkspace } from "@/packages/bonds/api";
import { useWorkspaceId } from "@/packages/workspaces/hooks/use-workspace-id";
import { estimateTokens, MAX_TOKENS } from "@/lib/token-counter";

interface QuoteAgentModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setExternalQuoteType: Dispatch<
    SetStateAction<"bidBond" | "performanceBonds">
  >;
  setContractData: Dispatch<SetStateAction<ContractDataType>>;
  setBidBondData: Dispatch<SetStateAction<BondDataType>>;
  setPerformanceBondsData: Dispatch<SetStateAction<Array<BondDataType>>>;
}

export const QuoteAgentModal = ({
  open,
  setOpen,
  setExternalQuoteType,
  setContractData,
  setBidBondData,
  setPerformanceBondsData,
}: QuoteAgentModalProps) => {
  const workspaceId = useWorkspaceId();
  const fileElementRef = useRef<HTMLInputElement>(null);

  const { execute: getQuote, isPending: isGettingQuote } = useGetQuoteFromDoc();
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

    const prompt =
      quoteType === "performanceBonds"
        ? `Quote type: ${quoteType}, Performance Bonds: ${JSON.stringify(
            performanceBonds,
          )}, PDF: ${text}`
        : `Quote type: ${quoteType}, PDF: ${text}`;

    getQuote(
      { prompt },
      {
        onSuccess: (quoteResponse) => {
          const data = string2Object(quoteResponse, quoteType);

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

          toast.success("Información extraída exitosamente del PDF");
        },
        onError: () => {
          toast.error("Error al extraer la información del PDF");
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
      <DialogContent className="p-0 gap-0">
        <DialogHeader className="p-4">
          <DialogTitle>Asistente de cotización</DialogTitle>
          <DialogDescription>
            Aquí puedes subir un PDF para que el asistente de cotización te
            ayude a extraer la información relevante para tu cotización.
            recuerda que siempre debes revisar la información extraída por el
            asistente antes de finalizar tu cotización.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <form className="space-y-4 p-4" onSubmit={extractPdf}>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1">
              <Label htmlFor="quote-type" className="text-xs">
                TIPO DE COTIZACIÓN
              </Label>
              <Select
                disabled={isLoading}
                value={quoteType}
                onValueChange={handleQuoteTypeChange}
              >
                <SelectTrigger className="w-full">
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
                className="justify-start"
                onClick={() => fileElementRef.current?.click()}
              >
                <RiAttachmentLine className="size-4 text-muted-foreground" />
                <span className="ml-2">Adjuntar archivo</span>
              </Button>
            </div>
          </div>
          {!!file && (
            <div className={cn(isLoading && "opacity-50 pointer-events-none")}>
              <div className="border rounded-md flex items-center justify-between group/file p-2">
                <div className="flex items-center">
                  {isLoading ? (
                    <RiLoader3Line className="size-5 text-muted-foreground shrink-0 animate-spin" />
                  ) : (
                    <RiAttachmentLine className="size-5 text-muted-foreground shrink-0" />
                  )}
                  <span className="ml-2 line-clamp-1">{file.name}</span>
                </div>
                <Button
                  size="icon-sm"
                  onClick={() => {
                    setFile(null);
                    fileElementRef.current!.value = "";
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
            <p className="text-sm text-muted-foreground">
              Dependiendo de la complejidad del documento, el proceso de
              extracción puede tardar unos segundos. Por favor, ten paciencia
              mientras el asistente procesa el archivo.
            </p>
          )}
          <DialogFooter>
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
