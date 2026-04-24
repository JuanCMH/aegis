"use client";

import { ShieldCheck } from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCreateRole, useUpdateRole } from "../../api";
import {
  emptyPermissions,
  memberDefaultPermissions,
  permissionsFromRecord,
  type PermissionsMap,
} from "../../lib/role-templates";
import type { RoleWithCount } from "../../types";
import { PermissionMatrix } from "../permission-matrix";

interface RoleFormModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  companyId: Id<"companies">;
  /** When set, the modal operates in edit mode. */
  role: RoleWithCount | null;
}

export function RoleFormModal({
  open,
  setOpen,
  companyId,
  role,
}: RoleFormModalProps) {
  const isEdit = Boolean(role);

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<PermissionsMap>(() =>
    emptyPermissions(),
  );

  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
  const isPending = isCreating || isUpdating;

  // Initialise when the modal opens or the target role changes.
  useEffect(() => {
    if (!open) return;
    if (role) {
      setName(role.name);
      setPermissions(permissionsFromRecord(role));
    } else {
      setName("");
      setPermissions(memberDefaultPermissions());
    }
  }, [open, role]);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (isEdit && role) {
      await updateRole(
        {
          id: role._id,
          name: name.trim(),
          ...permissions,
        },
        {
          onSuccess: () => {
            toast.success("Rol actualizado");
            setOpen(false);
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      );
      return;
    }

    await createRole(
      {
        companyId,
        name: name.trim(),
        ...permissions,
      },
      {
        onSuccess: () => {
          toast.success("Rol creado");
          setOpen(false);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <AegisModal open={open} onOpenChange={setOpen} maxWidth="sm:max-w-2xl">
      <AegisModalHeader
        icon={ShieldCheck}
        iconClassName="bg-aegis-cyan/10 border-aegis-cyan/10 text-aegis-cyan"
        title={isEdit ? "Editar rol" : "Nuevo rol personalizado"}
        description={
          isEdit
            ? "Actualiza el nombre o los permisos del rol."
            : "Define un conjunto de permisos a medida para tu agencia."
        }
      />
      <form
        id="role-form"
        onSubmit={handleSubmit}
        className="contents"
        noValidate
      >
        <AegisModalContent>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="role-name"
                className="text-xs font-medium text-aegis-steel"
              >
                Nombre del rol
              </Label>
              <Input
                id="role-name"
                required
                autoFocus
                placeholder="Ej. Asesor Senior, Contador, Lector"
                value={name}
                disabled={isPending}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-aegis-steel">
                Permisos
              </Label>
              <PermissionMatrix
                value={permissions}
                onChange={setPermissions}
                disabled={isPending}
              />
            </div>
          </div>
        </AegisModalContent>
        <AegisModalFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="role-form" disabled={!canSubmit || isPending}>
            {isEdit ? "Guardar cambios" : "Crear rol"}
          </Button>
        </AegisModalFooter>
      </form>
    </AegisModal>
  );
}
