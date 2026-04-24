import { useConfirm } from "@/components/hooks/use-confirm";
import { Doc } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useRemoveBond, useUpdateBond } from "../../api";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RiPencilLine } from "@remixicon/react";

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
    description: selectedBond ? selectedBond.description : "",
  });

  const handleClose = () => {
    setUpdateData({
      name: "",
      description: "",
    });
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

  return (
    <>
      <ConfirmDialog />
      <Dialog open={!!selectedBond} onOpenChange={handleCloseSelectedBond}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="p-4">
            <div className="flex items-start gap-3 pr-8">
              <div className="flex size-9 items-center justify-center rounded-lg border border-h-indigo/10 bg-h-indigo/10 text-h-indigo">
                <RiPencilLine className="size-4" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="capitalize">
                  {selectedBond?.name}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground/80">
                  Edita la información del amparo seleccionado.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <Separator className="opacity-40" />
          <div className="flex flex-col p-4 gap-2">
            <form className="space-y-4" onSubmit={handleUpdateBond}>
              <div className="grid w-full items-center gap-1">
                <Label htmlFor="bond-name" className="text-xs">
                  NOMBRE
                </Label>
                <Input
                  required
                  id="bond-name"
                  minLength={4}
                  maxLength={70}
                  value={updateData.name}
                  disabled={isUpdatingBond}
                  placeholder="Amparo de cumplimiento"
                  onChange={(e) =>
                    setUpdateData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid w-full items-center gap-1">
                <Label htmlFor="bond-description" className="text-xs">
                  DESCRIPCIÓN
                </Label>
                <Textarea
                  maxLength={300}
                  value={updateData.description}
                  disabled={isUpdatingBond}
                  className="resize-none h-24"
                  placeholder="Descripción opcional del amparo"
                  onChange={(e) =>
                    setUpdateData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <DialogFooter className="border-t border-border/40 pt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button disabled={isUpdatingBond} type="submit">
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
