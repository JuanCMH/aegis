import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useWorkspaceId } from "@/packages/workspaces/hooks/use-workspace-id";
import { RiAddLine } from "@remixicon/react";
import { Dispatch, SetStateAction, useState } from "react";
import { useGetBondsByWorkspace } from "../../api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateBondModal } from "./create-bond-modal";
import { BondItem } from "../bond-item";
import { SelectedBondModal } from "./selected-bond-modal";
import { BondDataType } from "../../types";
import { ContractDataType } from "@/packages/quotes/types";

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
  const workspaceId = useWorkspaceId();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedBondId, setSelectedBondId] = useState<Id<"bonds"> | undefined>(
    undefined,
  );

  const { data: bonds, isLoading: isLoadingBonds } = useGetBondsByWorkspace({
    workspaceId,
  });

  const handleCloseSelectedBond = () => setSelectedBondId(undefined);
  const selectedBond = bonds?.find((b) => b._id === selectedBondId);
  const handleCreateOpen = () => setCreateOpen(true);
  const handleSelectedBond = (bond: Doc<"bonds">) => {
    setSelectedBondId(bond._id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0">
          <DialogHeader className="p-4">
            <DialogTitle>Gestionar amparos</DialogTitle>
            <DialogDescription>
              Crea y administra los amparos disponibles para las cotizaciones.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="flex-1 flex flex-col gap-y-2 p-4">
            <header className="flex justify-between items-center w-full">
              <h1 className="text-sm font-semibold">Amparos</h1>
              {!isLoadingBonds && (
                <Hint label={"Crear amparo"} side="top" align="center">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={handleCreateOpen}
                    className="ml-auto p-0.5 text-sm shrink-0 size-6"
                  >
                    <RiAddLine className="size-5" />
                  </Button>
                </Hint>
              )}
            </header>
            <ScrollArea className="max-h-48">
              <main className="flex flex-col gap-2">
                {bonds && !isLoadingBonds && bonds.length === 0 && (
                  <p className="text-sm text-center border p-4 border-dashed rounded-md">
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
          </div>
        </DialogContent>
      </Dialog>
      <CreateBondModal createOpen={createOpen} setCreateOpen={setCreateOpen} />
      <SelectedBondModal
        key={selectedBond?._id}
        selectedBond={selectedBond}
        handleCloseSelectedBond={handleCloseSelectedBond}
      />
    </>
  );
};
