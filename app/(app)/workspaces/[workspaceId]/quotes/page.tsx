"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BidBondInfo from "@/packages/quotes/components/bid-bond-info";
import BidBondResult from "@/packages/quotes/components/bid-bond-result";
import ContractInfo from "@/packages/quotes/components/contract-info";
import { BondDataType, ContractDataType } from "@/packages/quotes/types";
import { RiFileList3Fill } from "@remixicon/react";
import { useState } from "react";

const QuotesPage = () => {
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

  return (
    <form
      className="w-full h-full flex-1 flex flex-col px-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="p-2 border border-muted rounded-lg mx-2 mt-4 z-11 bg-card pb-2">
        <header className="z-10 sticky top-0 shrink-0 flex flex-col transition-[width,height] ease-linear">
          <div className="flex items-center w-full">
            <div className="flex gap-2">
              <SidebarTrigger className="cursor-pointer" />
              <Breadcrumb className="flex">
                <BreadcrumbList>
                  <BreadcrumbItem>Cotizador</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
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
            <div className="py-4 text-center text-muted-foreground">
              Componente de garantías de cumplimiento en construcción...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </form>
  );
};

export default QuotesPage;
