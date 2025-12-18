"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  RiEditFill,
  RiArrowLeftLine,
  RiShieldCheckFill,
  RiDownloadLine,
} from "@remixicon/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Hint } from "@/components/hint";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { BondDataType } from "@/packages/bonds/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ContractDataType } from "@/packages/quotes/types";
import { useQuoteId } from "@/packages/quotes/hooks/use-quote-id";
import BidBondInfo from "@/packages/bonds/components/bid-bond-info";
import ContractInfo from "@/packages/quotes/components/contract-info";
import { useGetQuoteById, useUpdateQuote } from "@/packages/quotes/api";
import { generateQuotePDF } from "@/packages/quotes/lib/export-quote-pdf";
import { useWorkspaceId } from "@/packages/workspaces/hooks/use-workspace-id";
import PerformanceBondsInfo from "@/packages/bonds/components/performance-bonds-info";

const QuoteIdPage = () => {
  const router = useRouter();
  const quoteId = useQuoteId();
  const workspaceId = useWorkspaceId();

  const { mutate: updateQuote, isPending: isUpdatingQuote } = useUpdateQuote();

  const { data: quote, isLoading: isLoadingQuote } = useGetQuoteById({
    id: quoteId,
  });

  const [expenses, setExpenses] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [calculateExpensesTaxes, setCalculateExpensesTaxes] = useState(false);
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

  useEffect(() => {
    if (!isLoadingQuote && !quote) return;
    if (quote) {
      setContractData({
        contractor: quote.contractor,
        contractorId: quote.contractorId,
        contractee: quote.contractee,
        contracteeId: quote.contracteeId,
        contractType: quote.contractType,
        contractValue: quote.contractValue,
        contractStart: new Date(quote.contractStart),
        contractEnd: new Date(quote.contractEnd),
      });
      setExpenses(quote.expenses);
      setCalculateExpensesTaxes(quote.calculateExpensesTaxes);
    }
    if (quote && quote.quoteType === "bidBond") {
      const bond = quote.quoteBonds[0];
      setBidBondData({
        name: bond.name,
        startDate: new Date(bond.startDate),
        endDate: new Date(bond.endDate),
        percentage: bond.percentage,
        insuredValue: bond.insuredValue,
        rate: bond.rate,
      });
    }
    if (quote?.quoteType === "performanceBonds") {
      const bondsData = quote.quoteBonds.map((quoteBond) => {
        return {
          id: quoteBond.bondId,
          name: quoteBond.name,
          startDate: new Date(quoteBond.startDate),
          percentage: quoteBond.percentage,
          endDate: new Date(quoteBond.endDate),
          insuredValue: quoteBond.insuredValue,
          rate: quoteBond.rate,
        };
      });
      setPerformanceBondsData(bondsData);
    }
  }, [quote]);

  const onBack = () => router.push(`/workspaces/${workspaceId}/quotes`);

  const handleUpdateBidQuote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateQuote(
      {
        id: quoteId,
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
          setEditMode(false);
          toast.success("Cotización actualizada exitosamente");
        },
        onError: () => {
          toast.error("Error al actualizar la cotización");
        },
      },
    );
  };

  const handleUpdatePerformanceBondsQuote = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    updateQuote(
      {
        id: quoteId,
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
          setEditMode(false);
          toast.success("Cotización actualizada exitosamente");
        },
        onError: () => {
          toast.error("Error al actualizar la cotización");
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
                    <BreadcrumbPage>Detalles de Cotización</BreadcrumbPage>
                  </BreadcrumbList>
                </Breadcrumb>
                <div className="flex gap-2 ml-auto">
                  <Hint label="Volver a Cotizaciones" align="end">
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={onBack}
                    >
                      <RiArrowLeftLine />
                      Volver
                    </Button>
                  </Hint>
                  <Toggle
                    size="sm"
                    variant="outline"
                    pressed={editMode}
                    onPressedChange={setEditMode}
                    className="cursor-pointer  data-[state=on]:*:[svg]:fill-sky-500 data-[state=on]:*:[svg]:stroke-sky-500"
                  >
                    <RiEditFill />
                  </Toggle>
                </div>
              </div>
            </div>
          </header>
          <ContractInfo
            readOnly={!editMode}
            contractData={contractData}
            setContractData={setContractData}
          />
        </div>
        {quote && (
          <div className="p-2 border border-muted rounded-lg mt-2 z-11 bg-card pb-2">
            <Tabs value={quote.quoteType}>
              <header className="flex items-center justify-between gap-2">
                <div className="flex gap-2 items-center">
                  <RiShieldCheckFill
                    className="size-4"
                    onClick={() => console.log(bidBondData)}
                  />
                  <h1 className="text-lg font-semibold">
                    {quote.quoteType === "bidBond" && "Seriedad de la Oferta"}
                    {quote.quoteType === "performanceBonds" && "Cumplimiento"}
                  </h1>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    generateQuotePDF({
                      expenses,
                      contractData,
                      calculateExpensesTaxes,
                      bondsData:
                        quote.quoteType === "bidBond"
                          ? [bidBondData]
                          : performanceBondsData,
                      quoteType: quote.quoteType,
                    });
                  }}
                >
                  <RiDownloadLine />
                  Exportar PDF
                </Button>
              </header>
              <Separator />
              <TabsContent value="bidBond">
                <BidBondInfo
                  type="update"
                  editMode={editMode}
                  expenses={expenses}
                  contractData={contractData}
                  bidBondData={bidBondData}
                  calculateExpensesTaxes={calculateExpensesTaxes}
                  setExpenses={setExpenses}
                  setBidBondData={setBidBondData}
                  onSubmit={handleUpdateBidQuote}
                  isLoading={isUpdatingQuote}
                  setCalculateExpensesTaxes={setCalculateExpensesTaxes}
                />
              </TabsContent>
              <TabsContent value="performanceBonds">
                <PerformanceBondsInfo
                  type="update"
                  editMode={editMode}
                  expenses={expenses}
                  contractData={contractData}
                  performanceBondsData={performanceBondsData}
                  calculateExpensesTaxes={calculateExpensesTaxes}
                  setExpenses={setExpenses}
                  setPerformanceBondsData={setPerformanceBondsData}
                  onSubmit={handleUpdatePerformanceBondsQuote}
                  isLoading={isUpdatingQuote}
                  setCalculateExpensesTaxes={setCalculateExpensesTaxes}
                  setQuoteType={() => {}}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </>
  );
};

export default QuoteIdPage;
