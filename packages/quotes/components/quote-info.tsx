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
import { useGetWorkspace } from "@/packages/workspaces/api";
import BidBondInfo from "@/packages/bonds/components/bid-bond-info";
import { RiDownloadLine, RiShieldCheckFill } from "@remixicon/react";
import { useWorkspaceId } from "@/packages/workspaces/hooks/use-workspace-id";
import PerformanceBondsInfo from "@/packages/bonds/components/performance-bonds-info";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuoteInfoProps {
  quoteType: "bidBond" | "performanceBonds";
  setQuoteType: Dispatch<SetStateAction<"bidBond" | "performanceBonds">>;
  contractData: ContractDataType;
  setContractData: Dispatch<SetStateAction<ContractDataType>>;
  bidBondData: BondDataType;
  setBidBondData: Dispatch<SetStateAction<BondDataType>>;
  performanceBondsData: BondDataType[];
  setPerformanceBondsData: Dispatch<SetStateAction<BondDataType[]>>;
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
}: QuoteInfoProps) => {
  const workspaceId = useWorkspaceId();

  const [expenses, setExpenses] = useState(0);
  const [calculateExpensesTaxes, setCalculateExpensesTaxes] = useState(false);

  const {
    mutate: createQuote,
    isPending: isCreatingQuote,
    errorMessage,
  } = useCreateQuote();

  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({
    id: workspaceId,
  });

  const handleQuoteTypeChange = (value: string) => {
    if (value === "bidBond" || value === "performanceBonds") {
      setQuoteType(value);
    }
  };

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
  };

  const handleCreateBidQuote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requiredFields = [
      contractData.contractee,
      contractData.contractor,
      contractData.contractValue,
      contractData.contractStart,
      contractData.contractEnd,
      bidBondData.startDate,
      bidBondData.endDate,
      bidBondData.expiryDate,
      bidBondData.percentage,
      bidBondData.insuredValue,
      bidBondData.rate,
    ];

    if (requiredFields.some((field) => !field)) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }

    createQuote(
      {
        workspaceId,
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

  const handleCreatePerformanceBondsQuote = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const requiredFields = [
      contractData.contractee,
      contractData.contractor,
      contractData.contractValue,
      contractData.contractStart,
      contractData.contractEnd,
      ...performanceBondsData.flatMap((bond) => [
        bond.startDate,
        bond.endDate,
        bond.percentage,
        bond.insuredValue,
        bond.rate,
      ]),
    ];

    if (requiredFields.some((field) => !field)) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }

    createQuote(
      {
        workspaceId,
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
    <section className="m-2 border p-2 rounded-md shadow-sm bg-card">
      <Tabs value={quoteType} onValueChange={handleQuoteTypeChange}>
        <header className="flex items-center justify-between gap-2">
          <div className="flex gap-2 items-center">
            <RiShieldCheckFill className="size-4" />
            <TabsList className="h-8">
              <TabsTrigger value="bidBond">Seriedad</TabsTrigger>
              <TabsTrigger value="performanceBonds">Cumplimiento</TabsTrigger>
            </TabsList>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" disabled={isLoadingWorkspace}>
                <RiDownloadLine />
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
                    workspaceName: workspace?.name,
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
                    workspaceName: workspace?.name,
                  });
                }}
                className="cursor-pointer"
              >
                Exportar a PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <Separator />
        <TabsContent value="bidBond">
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
        <TabsContent value="performanceBonds">
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
      </Tabs>
    </section>
  );
};

export default QuoteInfo;
