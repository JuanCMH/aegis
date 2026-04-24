import { Plus, ShieldCheck } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import {
  AegisModal,
  AegisModalContent,
  AegisModalHeader,
} from "@/components/aegis/aegis-modal";
import { Hint } from "@/components/aegis/hint";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import type { ContractDataType } from "@/packages/quotes/types";
import { useGetBondsByCompany } from "../../api";
import type { BondDataType } from "../../types";
import { BondItem } from "../bond-item";
import { CreateBondModal } from "./create-bond-modal";
import { SelectedBondModal } from "./selected-bond-modal";

interface BondsModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  contractData: ContractDataType;
  performanceBondsData: BondDataType[];
  setPerformanceBondsData: Dispatch<SetStateAction<BondDataType[]>>;
}

export const BondsModal = ({
  open,
  setOpen,
  contractData,
  performanceBondsData,
  setPerformanceBondsData,
}: BondsModalProps) => {
  const companyId = useCompanyId();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedBondId, setSelectedBondId] = useState<Id<"bonds"> | undefined>(
    undefined,
  );

  const { data: bonds, isLoading: isLoadingBonds } = useGetBondsByCompany({
    companyId,
  });

  const handleCloseSelectedBond = () => setSelectedBondId(undefined);
  const selectedBond = bonds?.find((b) => b._id === selectedBondId);
  const handleCreateOpen = () => setCreateOpen(true);
  const handleSelectedBond = (bond: Doc<"bonds">) => {
    setSelectedBondId(bond._id);
  };

  return (
    <>
      <AegisModal open={open} onOpenChange={setOpen} maxWidth="sm:max-w-lg">
        <AegisModalHeader
          icon={ShieldCheck}
          title="Gestionar amparos"
          description="Crea y administra los amparos disponibles para las cotizaciones."
        />
        <AegisModalContent className="space-y-2">
          <header className="flex w-full items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Amparos</h2>
            {!isLoadingBonds && (
              <Hint label="Crear amparo" side="top" align="center">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleCreateOpen}
                  className="size-6 shrink-0 p-0.5"
                >
                  <Plus className="size-5" />
                </Button>
              </Hint>
            )}
          </header>
          <ScrollArea className="max-h-60">
            <main className="flex flex-col gap-2">
              {bonds && !isLoadingBonds && bonds.length === 0 && (
                <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No tienes amparos creados aún. Crea uno para comenzar a
                  gestionarlos.
                </p>
              )}
              {bonds?.map((bond) => (
                <BondItem
                  key={bond._id}
                  bond={bond}
                  contractData={contractData}
                  setSelectedBond={handleSelectedBond}
                  performanceBondsData={performanceBondsData}
                  setPerformanceBondsData={setPerformanceBondsData}
                />
              ))}
            </main>
          </ScrollArea>
        </AegisModalContent>
      </AegisModal>

      <CreateBondModal createOpen={createOpen} setCreateOpen={setCreateOpen} />
      <SelectedBondModal
        key={selectedBond?._id}
        selectedBond={selectedBond}
        handleCloseSelectedBond={handleCloseSelectedBond}
      />
    </>
  );
};
