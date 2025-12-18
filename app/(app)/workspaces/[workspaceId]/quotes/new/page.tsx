"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateQuote } from "@/packages/quotes/api";
import { useWorkspaceId } from "@/packages/workspaces/hooks/use-workspace-id";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ContractDataType } from "@/packages/quotes/types";
import BidBondInfo from "@/packages/bonds/components/bid-bond-info";
import { RiAiGenerate2, RiShieldCheckFill } from "@remixicon/react";
import ContractInfo from "@/packages/quotes/components/contract-info";
import { BondDataType } from "@/packages/bonds/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceBondsInfo from "@/packages/bonds/components/performance-bonds-info";
import { QuoteAgentModal } from "@/packages/quotes/components/modals/quote-agent-modal";

const NewQuotePage = () => {
  const workspaceId = useWorkspaceId();
  const { mutate: createQuote, isPending: isCreatingQuote } = useCreateQuote();
  const [expenses, setExpenses] = useState(0);
  const [calculateExpensesTaxes, setCalculateExpensesTaxes] = useState(false);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [quoteType, setQuoteType] = useState<"bidBond" | "performanceBonds">(
    "bidBond",
  );
  const [contractData, setContractData] = useState<ContractDataType>({
    contractor: "",
    contractorId: "",
    contractee: "",
    contracteeId: "",
    contractType: "",
    contractValue: 0,
    contractStart: new Date(),
    contractEnd: new Date(),
  });

  const [bidBondData, setBidBondData] = useState<BondDataType>({
    name: "Seriedad de la oferta",
    startDate: new Date(),
    endDate: new Date(),
    percentage: 0,
    insuredValue: 0,
    rate: 0,
  });

  const [performanceBondsData, setPerformanceBondsData] = useState<
    Array<BondDataType>
  >([]);

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
      contractValue: 0,
      contractStart: new Date(),
      contractEnd: new Date(),
    });
    setBidBondData({
      name: "Seriedad de la oferta",
      startDate: new Date(),
      endDate: new Date(),
      percentage: 0,
      insuredValue: 0,
      rate: 0,
    });
    setPerformanceBondsData([]);
  };

  const handleCreateBidQuote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createQuote(
      {
        workspaceId,
        quoteType: "bidBond",
        quoteBonds: [
          {
            name: bidBondData.name,
            startDate: bidBondData.startDate.getTime(),
            endDate: bidBondData.endDate.getTime(),
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
        onError: () => {
          toast.error("Error al crear la cotización");
        },
      },
    );
  };

  const handleCreatePerformanceBondsQuote = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
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
        onError: () => {
          toast.error("Error al crear la cotización");
        },
      },
    );
  };

  return (
    <>
      <div className="w-full h-full flex-1 flex flex-col p-2 pl-2 md:pl-0">
        <div className="p-2 border border-muted rounded-lg z-11 bg-card">
          <header className="p-1 border rounded-md z-10 sticky top-0 shrink-0 flex flex-col transition-[width,height] ease-linear">
            <div className="flex items-center w-full">
              <div className="flex gap-2 w-full items-center">
                <SidebarTrigger className="cursor-pointer" />
                <Breadcrumb className="flex">
                  <BreadcrumbList>
                    <BreadcrumbItem>Cotizaciones</BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbPage>Nueva Cotización</BreadcrumbPage>
                  </BreadcrumbList>
                </Breadcrumb>
                <Button
                  type="button"
                  size="icon-sm"
                  className="cursor-pointer ml-auto"
                  onClick={() => setAgentModalOpen(true)}
                >
                  <RiAiGenerate2 />
                </Button>
              </div>
            </div>
          </header>
          <ContractInfo
            contractData={contractData}
            setContractData={setContractData}
          />
        </div>
        <div className="p-2 border border-muted rounded-lg mt-2 z-11 bg-card pb-2">
          <Tabs value={quoteType} onValueChange={handleQuoteTypeChange}>
            <header className="flex items-center justify-between gap-2">
              <div className="flex gap-2 items-center">
                <RiShieldCheckFill className="size-4" />
                <h1 className="text-lg font-semibold">Amparos</h1>
              </div>
              <TabsList className="h-8">
                <TabsTrigger value="bidBond">Seriedad</TabsTrigger>
                <TabsTrigger value="performanceBonds">Cumplimiento</TabsTrigger>
              </TabsList>
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
                contractData={contractData}
                performanceBondsData={performanceBondsData}
                calculateExpensesTaxes={calculateExpensesTaxes}
                setExpenses={setExpenses}
                setPerformanceBondsData={setPerformanceBondsData}
                onSubmit={handleCreatePerformanceBondsQuote}
                isLoading={isCreatingQuote}
                setCalculateExpensesTaxes={setCalculateExpensesTaxes}
                setQuoteType={setQuoteType}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <QuoteAgentModal
        open={agentModalOpen}
        setOpen={setAgentModalOpen}
        setExternalQuoteType={setQuoteType}
        setContractData={setContractData}
        setBidBondData={setBidBondData}
        setPerformanceBondsData={setPerformanceBondsData}
      />
    </>
  );
};

export default NewQuotePage;
