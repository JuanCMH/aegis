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
import { useWorkspaceId } from "@/packages/workspaces/hooks/use-workspace-id";
import React, { Dispatch, SetStateAction, useState } from "react";
import { useCreateBond } from "../../api";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RiAddFill } from "@remixicon/react";

interface CreateBondModalProps {
  createOpen: boolean;
  setCreateOpen: Dispatch<SetStateAction<boolean>>;
}

type BondFormData = {
  name: string;
  description: string;
};

export const CreateBondModal = ({
  createOpen,
  setCreateOpen,
}: CreateBondModalProps) => {
  const workspaceId = useWorkspaceId();

  const {
    mutate: createBond,
    isPending: isCreatingBond,
    errorMessage,
  } = useCreateBond();

  const [createData, setCreateData] = useState<BondFormData>({
    name: "",
    description: "",
  });

  const handleClose = () => {
    setCreateOpen(false);
    setCreateData({ name: "", description: "" });
  };

  const handleCreateBond = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createBond(
      {
        workspaceId,
        name: createData.name,
        description: createData.description,
      },
      {
        onSuccess: () => {
          toast.success("Amparo creado exitosamente");
          handleClose();
        },
        onError: () => {
          toast.error(errorMessage);
        },
      },
    );
  };

  return (
    <>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="p-4">
            <div className="flex items-start gap-3 pr-8">
              <div className="flex size-9 items-center justify-center rounded-lg border border-h-indigo/10 bg-h-indigo/10 text-h-indigo">
                <RiAddFill className="size-4" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="capitalize">Crear amparo</DialogTitle>
                <DialogDescription className="text-muted-foreground/80">
                  Crea un nuevo amparo para que pueda ser utilizado en las
                  cotizaciones.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <Separator className="opacity-40" />
          <form className="space-y-4 p-4" onSubmit={handleCreateBond}>
            <div className="grid w-full items-center gap-1">
              <Label htmlFor="bond-name" className="text-xs">
                NOMBRE
              </Label>
              <Input
                required
                id="bond-name"
                minLength={4}
                maxLength={70}
                value={createData.name}
                disabled={isCreatingBond}
                placeholder="Amparo de cumplimiento"
                onChange={(e) =>
                  setCreateData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid w-full items-center gap-1">
              <Label htmlFor="bond-description" className="text-xs">
                DESCRIPCIÓN
              </Label>
              <Textarea
                maxLength={300}
                value={createData.description}
                disabled={isCreatingBond}
                className="resize-none h-24"
                placeholder="Descripción opcional del amparo"
                onChange={(e) =>
                  setCreateData((prev) => ({
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
              <Button disabled={isCreatingBond} type="submit">
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
