import { Plus } from "lucide-react";
import React, { type Dispatch, type SetStateAction, useState } from "react";
import { toast } from "sonner";
import {
  AegisModal,
  AegisModalContent,
  AegisModalFooter,
  AegisModalHeader,
  DialogClose,
} from "@/components/aegis/aegis-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import { useCreateBond } from "../../api";

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
  const companyId = useCompanyId();

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
        companyId,
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
    <AegisModal
      open={createOpen}
      onOpenChange={handleClose}
      maxWidth="sm:max-w-md"
    >
      <AegisModalHeader
        icon={Plus}
        title="Crear amparo"
        description="Crea un nuevo amparo para que pueda ser utilizado en las cotizaciones."
      />
      <AegisModalContent>
        <form
          id="create-bond-form"
          className="space-y-4"
          onSubmit={handleCreateBond}
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
              value={createData.name}
              disabled={isCreatingBond}
              placeholder="Amparo de cumplimiento"
              onChange={(e) =>
                setCreateData((prev) => ({ ...prev, name: e.target.value }))
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
              value={createData.description}
              disabled={isCreatingBond}
              className="h-24 resize-none"
              placeholder="Descripción opcional del amparo"
              onChange={(e) =>
                setCreateData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
        </form>
      </AegisModalContent>
      <AegisModalFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Cancelar
          </Button>
        </DialogClose>
        <Button form="create-bond-form" disabled={isCreatingBond} type="submit">
          Crear
        </Button>
      </AegisModalFooter>
    </AegisModal>
  );
};
