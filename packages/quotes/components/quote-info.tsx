import { toast } from "sonner";
import { useCreateQuote } from "../api";
import { ContractDataType } from "../types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BondDataType } from "@/packages/bonds/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/get-error-message";
import { generateQuotePDF } from "../lib/export-quote-pdf";
import { generateQuoteExcel } from "../lib/export-quote-excel";
import { Dispatch, SetStateAction, useState } from "react";
import { useGetCompany } from "@/packages/companies/api";
import { Id } from "@/convex/_generated/dataModel";
import BidBondInfo from "@/packages/bonds/components/bid-bond-info";
import { Download, ShieldCheck } from "lucide-react";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { useGenerateUploadUrl } from "@/components/hooks/use-generate-upload-url";
import PerformanceBondsInfo from "@/packages/bonds/components/performance-bonds-info";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { differenceInCalendarDays } from "date-fns";
import { cn } from "@/lib/utils";

interface QuoteInfoProps {
  quoteType: "bidBond" | "performanceBonds";
  setQuoteType: Dispatch<SetStateAction<"bidBond" | "performanceBonds">>;
  contractData: ContractDataType;
  setContractData: Dispatch<SetStateAction<ContractDataType>>;
  bidBondData: BondDataType;
  setBidBondData: Dispatch<SetStateAction<BondDataType>>;
  performanceBondsData: BondDataType[];
  setPerformanceBondsData: Dispatch<SetStateAction<BondDataType[]>>;
  documentFile: File | null;
  setDocumentFile: Dispatch<SetStateAction<File | null>>;
}

const QuoteInfo = ({
  quoteType,
  setQuoteType,
  contractData,
  setContractData,
  bidBondData,
  setBidBondData,
  performanceBondsData,
  setPerformanceBondsData,
  documentFile,
  setDocumentFile,
}: QuoteInfoProps) => {
  const companyId = useCompanyId();

  const [expenses, setExpenses] = useState(0);
  const [calculateExpensesTaxes, setCalculateExpensesTaxes] = useState(false);

  const {
    mutate: createQuote,
    isPending: isCreatingQuote,
    errorMessage,
  } = useCreateQuote();

  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const { data: company, isLoading: isLoadingCompany } = useGetCompany({
    id: companyId,
  });

  const handleQuoteTypeChange = (value: string) => {
    if (value === "bidBond" || value === "performanceBonds") {
      setQuoteType(value);
    }
  };

  const hasValidContractDates =
    differenceInCalendarDays(
      contractData.contractEnd,
      contractData.contractStart,
    ) > 0;

  const resetForm = () => {
    setContractData({
      contractor: "",
      contractorId: "",
      contractee: "",
      contracteeId: "",
      contractType: "",
      agreement: "",
      contractValue: 0,
      contractStart: new Date(),
      contractEnd: new Date(),
    });
    setBidBondData({
      name: "Seriedad de la oferta",
      startDate: new Date(),
      endDate: new Date(),
      expiryDate: new Date(),
      percentage: 0,
      insuredValue: 0,
      rate: 0,
    });
    setPerformanceBondsData([]);
    setDocumentFile(null);
  };

  const uploadDocument = async (): Promise<Id<"_storage"> | undefined> => {
    if (!documentFile) return undefined;
    const url = await new Promise<string>((resolve, reject) => {
      generateUploadUrl(
        {},
        {
          onSuccess: (data) => resolve(data as string),
          onError: reject,
        },
      );
    });
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": documentFile.type },
      body: documentFile,
    });
    const { storageId } = await result.json();
    return storageId as Id<"_storage">;
  };

  const handleCreateBidQuote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasValidContractDates) {
      toast.error(
        "La fecha de inicio del contrato debe ser anterior a la fecha de finalizacion.",
      );
      return;
    }

    if (
      !contractData.contractee.trim() ||
      !contractData.contractor.trim() ||
      contractData.contractValue <= 0 ||
      bidBondData.percentage <= 0 ||
      bidBondData.insuredValue <= 0 ||
      bidBondData.rate <= 0
    ) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }

    const documentId = await uploadDocument();

    createQuote(
      {
        companyId,
        quoteType: "bidBond",
        quoteBonds: [
          {
            name: bidBondData.name,
            startDate: bidBondData.startDate.getTime(),
            endDate: bidBondData.endDate.getTime(),
            expiryDate: bidBondData.expiryDate?.getTime(),
            percentage: bidBondData.percentage,
            insuredValue: bidBondData.insuredValue,
            rate: bidBondData.rate,
          },
        ],
        expenses,
        calculateExpensesTaxes,
        contractee: contractData.contractee,
        contracteeId: contractData.contracteeId,
        contractor: contractData.contractor,
        contractorId: contractData.contractorId,
        contractType: contractData.contractType,
        agreement: contractData.agreement,
        contractValue: contractData.contractValue,
        contractStart: contractData.contractStart.getTime(),
        contractEnd: contractData.contractEnd.getTime(),
        documentId,
      },
      {
        onSuccess: () => {
          resetForm();
          setExpenses(0);
          setCalculateExpensesTaxes(false);
          toast.success("Cotización creada exitosamente");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  const handleCreatePerformanceBondsQuote = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!hasValidContractDates) {
      toast.error(
        "La fecha de inicio del contrato debe ser anterior a la fecha de finalizacion.",
      );
      return;
    }

    if (
      !contractData.contractee.trim() ||
      !contractData.contractor.trim() ||
      contractData.contractValue <= 0 ||
      performanceBondsData.length === 0 ||
      performanceBondsData.some(
        (bond) =>
          bond.percentage <= 0 || bond.insuredValue <= 0 || bond.rate <= 0,
      )
    ) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }

    const documentId = await uploadDocument();

    createQuote(
      {
        companyId,
        quoteType: "performanceBonds",
        quoteBonds: performanceBondsData.map((bond) => ({
          name: bond.name,
          startDate: bond.startDate.getTime(),
          endDate: bond.endDate.getTime(),
          percentage: bond.percentage,
          insuredValue: bond.insuredValue,
          rate: bond.rate,
          bondId: bond.id,
        })),
        expenses,
        calculateExpensesTaxes,
        contractee: contractData.contractee,
        contracteeId: contractData.contracteeId,
        contractor: contractData.contractor,
        contractorId: contractData.contractorId,
        contractType: contractData.contractType,
        agreement: contractData.agreement,
        contractValue: contractData.contractValue,
        contractStart: contractData.contractStart.getTime(),
        contractEnd: contractData.contractEnd.getTime(),
        documentId,
      },
      {
        onSuccess: () => {
          resetForm();
          setExpenses(0);
          setCalculateExpensesTaxes(false);
          toast.success("Cotización creada exitosamente");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  return (
    <section className="m-2 overflow-hidden rounded-xl border border-border/40 bg-card/90 backdrop-blur-sm">
      <Tabs value={quoteType} onValueChange={handleQuoteTypeChange}>
        <header className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg border border-aegis-sapphire/10 bg-aegis-sapphire/10 text-aegis-sapphire">
              <ShieldCheck className="size-4" />
            </div>
            <TabsList className="h-10 rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="bidBond"
                className="px-3 text-sm data-[state=active]:shadow-none"
              >
                Seriedad
              </TabsTrigger>
              <TabsTrigger
                value="performanceBonds"
                className="px-3 text-sm data-[state=active]:shadow-none"
              >
                Cumplimiento
              </TabsTrigger>
            </TabsList>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-sm"
                variant="outline"
                disabled={isLoadingCompany}
                className={cn(
                  "border-border/40 bg-background/80 hover:bg-accent/60 dark:bg-background/30",
                )}
              >
                <Download />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  generateQuoteExcel({
                    expenses,
                    contractData,
                    calculateExpensesTaxes,
                    bondsData:
                      quoteType === "bidBond"
                        ? [bidBondData]
                        : performanceBondsData,
                    quoteType: quoteType,
                    companyName: company?.name,
                  });
                }}
                className="cursor-pointer"
              >
                Exportar a Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  generateQuotePDF({
                    expenses,
                    contractData,
                    calculateExpensesTaxes,
                    bondsData:
                      quoteType === "bidBond"
                        ? [bidBondData]
                        : performanceBondsData,
                    quoteType: quoteType,
                    companyName: company?.name,
                  });
                }}
                className="cursor-pointer"
              >
                Exportar a PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <Separator className="opacity-40" />
        <div className="p-4">
          <TabsContent value="bidBond" className="mt-0">
            <BidBondInfo
              type="create"
              expenses={expenses}
              contractData={contractData}
              bidBondData={bidBondData}
              calculateExpensesTaxes={calculateExpensesTaxes}
              setExpenses={setExpenses}
              setBidBondData={setBidBondData}
              onSubmit={handleCreateBidQuote}
              isLoading={isCreatingQuote}
              setCalculateExpensesTaxes={setCalculateExpensesTaxes}
            />
          </TabsContent>
          <TabsContent value="performanceBonds" className="mt-0">
            <PerformanceBondsInfo
              type="create"
              expenses={expenses}
              setExpenses={setExpenses}
              contractData={contractData}
              isLoading={isCreatingQuote}
              setQuoteType={setQuoteType}
              performanceBondsData={performanceBondsData}
              calculateExpensesTaxes={calculateExpensesTaxes}
              setPerformanceBondsData={setPerformanceBondsData}
              onSubmit={handleCreatePerformanceBondsQuote}
              setCalculateExpensesTaxes={setCalculateExpensesTaxes}
            />
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
};

export default QuoteInfo;
