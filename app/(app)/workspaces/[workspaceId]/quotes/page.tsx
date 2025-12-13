"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPdfContent } from "@/lib/extract-pdf";
import { normalizePdfText } from "@/lib/normalize-pdf-text";
import { useGetQuoteFromDoc } from "@/packages/quotes/api";
import BidBondInfo from "@/packages/quotes/components/bid-bond-info";
import BidBondResult from "@/packages/quotes/components/bid-bond-result";
import ContractInfo from "@/packages/quotes/components/contract-info";
import PerformanceBondsInfo from "@/packages/quotes/components/performance-bonds-info";
import { BondDataType, ContractDataType } from "@/packages/quotes/types";
import { RiFileAi2Line, RiFileList3Fill } from "@remixicon/react";
import { useRef, useState } from "react";

const QuotesPage = () => {
  const getQuoteFromDoc = useGetQuoteFromDoc();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    days: 0,
    months: 0,
    percentage: 0,
    insuredValue: 0,
    rate: 0,
  });

  const [performanceBondsData, setPerformanceBondsData] = useState<
    Array<BondDataType>
  >([]);

  const extractPdfToLog = async (file: File) => {
    const result = await getPdfContent(file);
    // console.log("Extracted PDF Text:", result);
    // promt mus be reslt (string []) to only one string
    const promt = normalizePdfText(result);
    // console.log(result);
    const quoteResponse = await getQuoteFromDoc({ promt });

    console.log("Quote Response:", quoteResponse);
  };

  return (
    <form
      className="w-full h-full flex-1 flex flex-col px-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="p-2 border border-muted rounded-lg mx-2 mt-4 z-11 bg-card pb-2">
        <header className="z-10 sticky top-0 shrink-0 flex flex-col transition-[width,height] ease-linear">
          <div className="flex items-center w-full">
            <div className="flex gap-2 w-full">
              <SidebarTrigger className="cursor-pointer" />
              <Breadcrumb className="flex">
                <BreadcrumbList>
                  <BreadcrumbItem>Cotizador</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={async (e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    await extractPdfToLog(file);
                  }
                }}
              />
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                className="cursor-pointer ml-auto"
                onClick={() => fileInputRef.current?.click()}
              >
                <RiFileAi2Line className="size-4" />
              </Button>
            </div>
          </div>
        </header>
        <ContractInfo
          contractData={contractData}
          setContractData={setContractData}
        />
      </div>
      <div className="p-2 border border-muted rounded-lg mx-2 mt-4 z-11 bg-card pb-2">
        <Tabs defaultValue="bidBond">
          <header className="flex items-center justify-between gap-2">
            <div className="flex gap-2 items-center">
              <RiFileList3Fill className="w-4 h-4 text-sky-500" />
              <h1 className="text-lg font-semibold">Garantías</h1>
            </div>
            <TabsList>
              <TabsTrigger value="bidBond">Seriedad</TabsTrigger>
              <TabsTrigger value="performanceBonds">Cumplimiento</TabsTrigger>
            </TabsList>
          </header>
          <Separator />
          <TabsContent value="bidBond">
            <BidBondInfo
              contractData={contractData}
              bidBondData={bidBondData}
              setBidBondData={setBidBondData}
            />
            <BidBondResult bidBondData={bidBondData} />
          </TabsContent>
          <TabsContent value="performanceBonds">
            <PerformanceBondsInfo
              contractData={contractData}
              performanceBondsData={performanceBondsData}
              setPerformanceBondsData={setPerformanceBondsData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </form>
  );
};

export default QuotesPage;
