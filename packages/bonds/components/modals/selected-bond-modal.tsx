import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AegisModal,
  AegisModalContent,
  AegisModalFooter,
  AegisModalHeader,
  DialogClose,
} from "@/components/aegis/aegis-modal";
import { useConfirm } from "@/components/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Doc } from "@/convex/_generated/dataModel";
import { useRemoveBond, useUpdateBond } from "../../api";

interface SelectedBondModalProps {
  selectedBond: Doc<"bonds"> | undefined;
  handleCloseSelectedBond: () => void;
}

type BondFormData = {
  name: string;
  description: string;
};

export const SelectedBondModal = ({
  selectedBond,
  handleCloseSelectedBond,
}: SelectedBondModalProps) => {
  const [updateData, setUpdateData] = useState<BondFormData>({
    name: selectedBond ? selectedBond.name : "",
    description: selectedBond?.description ?? "",
  });

  const handleClose = () => {
    setUpdateData({ name: "", description: "" });
    handleCloseSelectedBond();
  };

  const [ConfirmDialog, confirm] = useConfirm({
    title: "Eliminar amparo",
    message: "¿Estás seguro que deseas eliminar este amparo?",
    type: "critical",
  });

  const {
    mutate: updateBond,
    isPending: isUpdatingBond,
    errorMessage: updateErrorMessage,
  } = useUpdateBond();
  const {
    mutate: removeBond,
    isPending: isRemovingBond,
    errorMessage: removeErrorMessage,
  } = useRemoveBond();

  const handleUpdateBond = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBond) return;
    updateBond(
      { ...updateData, id: selectedBond._id },
      {
        onSuccess: () => {
          toast.success("Amparo actualizado correctamente");
          handleClose();
        },
        onError: () => {
          toast.error(updateErrorMessage);
        },
      },
    );
  };

  const handleRemoveBond = async () => {
    if (!selectedBond) return;
    const ok = await confirm();
    if (!ok) return;

    removeBond(
      { id: selectedBond._id },
      {
        onSuccess: () => {
          toast.success("Amparo eliminado correctamente");
          handleClose();
        },
        onError: () => {
          toast.error(removeErrorMessage);
        },
      },
    );
  };

  const isBusy = isUpdatingBond || isRemovingBond;

  return (
    <>
      <ConfirmDialog />
      <AegisModal
        open={!!selectedBond}
        onOpenChange={handleCloseSelectedBond}
        maxWidth="sm:max-w-md"
      >
        <AegisModalHeader
          icon={Pencil}
          title={selectedBond?.name ?? "Amparo"}
          description="Edita la información del amparo seleccionado."
        />
        <AegisModalContent>
          <form
            id="update-bond-form"
            className="space-y-4"
            onSubmit={handleUpdateBond}
          >
            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="bond-name"
                className="text-xs font-medium text-aegis-steel"
              >
                Nombre
              </Label>
              <Input
                required
                id="bond-name"
                minLength={4}
                maxLength={70}
                value={updateData.name}
                disabled={isBusy}
                placeholder="Amparo de cumplimiento"
                onChange={(e) =>
                  setUpdateData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="bond-description"
                className="text-xs font-medium text-aegis-steel"
              >
                Descripción
              </Label>
              <Textarea
                id="bond-description"
                maxLength={300}
                value={updateData.description}
                disabled={isBusy}
                className="h-24 resize-none"
                placeholder="Descripción opcional del amparo"
                onChange={(e) =>
                  setUpdateData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </form>
        </AegisModalContent>
        <AegisModalFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={isBusy}
            onClick={handleRemoveBond}
          >
            Eliminar
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isBusy}>
                Cancelar
              </Button>
            </DialogClose>
            <Button form="update-bond-form" disabled={isBusy} type="submit">
              Guardar
            </Button>
          </div>
        </AegisModalFooter>
      </AegisModal>
    </>
  );
};
