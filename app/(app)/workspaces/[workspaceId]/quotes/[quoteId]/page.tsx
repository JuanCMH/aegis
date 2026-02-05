"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/get-error-message";
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
import { useGetWorkspace } from "@/packages/workspaces/api";
import { AegisLogo } from "@/components/logo";

const QuoteIdPage = () => {
  const router = useRouter();
  const quoteId = useQuoteId();
  const workspaceId = useWorkspaceId();

  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({
    id: workspaceId,
  });
  const {
    mutate: updateQuote,
    isPending: isUpdatingQuote,
    errorMessage,
  } = useUpdateQuote();

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
    agreement: "",
    contractValue: 0,
    contractStart: new Date(),
    contractEnd: new Date(),
  });
  const [bidBondData, setBidBondData] = useState<BondDataType>({
    name: "Seriedad de la oferta",
    startDate: new Date(),
    endDate: new Date(),
    expiryDate: undefined,
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
        agreement: quote.agreement,
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
        expiryDate: bond.expiryDate ? new Date(bond.expiryDate) : undefined,
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

    updateQuote(
      {
        id: quoteId,
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
          setEditMode(false);
          toast.success("Cotización actualizada exitosamente");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  const handleUpdatePerformanceBondsQuote = (
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
        agreement: contractData.agreement,
        contractValue: contractData.contractValue,
        contractStart: contractData.contractStart.getTime(),
        contractEnd: contractData.contractEnd.getTime(),
      },
      {
        onSuccess: () => {
          setEditMode(false);
          toast.success("Cotización actualizada exitosamente");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  return (
    <>
      <main className="w-full h-full flex-1 flex flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">Detalles de la Cotización</h1>
            <div className="ml-auto flex items-center gap-2">
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
        </header>
        <ContractInfo
          readOnly={!editMode}
          contractData={contractData}
          setContractData={setContractData}
        />
        {quote && (
          <div className="m-2 mt-0 border p-2 rounded-md shadow-sm bg-card">
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
                      workspaceName: workspace?.name,
                    });
                  }}
                  disabled={isLoadingWorkspace}
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
      </main>
    </>
  );
};

export default QuoteIdPage;
