"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RiAiGenerate2,
  RiAttachmentLine,
  RiCloseLine,
} from "@remixicon/react";
import { BondDataType } from "@/packages/bonds/types";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ContractDataType } from "@/packages/quotes/types";
import QuoteInfo from "@/packages/quotes/components/quote-info";
import ContractInfo from "@/packages/quotes/components/contract-info";
import { QuoteAgentModal } from "@/packages/quotes/components/modals/quote-agent-modal";
import { Hint } from "@/components/hint";

const NewQuotePage = () => {
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [quoteType, setQuoteType] = useState<"bidBond" | "performanceBonds">(
    "bidBond",
  );
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
            <h1 className="text-base font-medium">Nueva Cotización</h1>
            <div className="ml-auto flex items-center gap-2">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={documentInputRef}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setDocumentFile(e.target.files[0]);
                  }
                }}
              />
              {documentFile ? (
                <div className="flex items-center gap-1 border rounded-md px-2 py-1 text-sm">
                  <RiAttachmentLine className="size-4 text-muted-foreground shrink-0" />
                  <span className="max-w-32 truncate">{documentFile.name}</span>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="size-5"
                    onClick={() => {
                      setDocumentFile(null);
                      if (documentInputRef.current)
                        documentInputRef.current.value = "";
                    }}
                  >
                    <RiCloseLine className="size-3" />
                  </Button>
                </div>
              ) : (
                <Hint label="Adjuntar documento de referencia" align="end">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => documentInputRef.current?.click()}
                  >
                    <RiAttachmentLine />
                  </Button>
                </Hint>
              )}
              <Button
                type="button"
                size="icon-sm"
                className="cursor-pointer"
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
        <QuoteInfo
          quoteType={quoteType}
          setQuoteType={setQuoteType}
          contractData={contractData}
          setContractData={setContractData}
          bidBondData={bidBondData}
          setBidBondData={setBidBondData}
          performanceBondsData={performanceBondsData}
          setPerformanceBondsData={setPerformanceBondsData}
          documentFile={documentFile}
          setDocumentFile={setDocumentFile}
        />
      </main>
      <QuoteAgentModal
        open={agentModalOpen}
        setOpen={setAgentModalOpen}
        setExternalQuoteType={setQuoteType}
        setContractData={setContractData}
        setBidBondData={setBidBondData}
        setPerformanceBondsData={setPerformanceBondsData}
        onFileProcessed={(file) => setDocumentFile(file)}
      />
    </>
  );
};

export default NewQuotePage;
