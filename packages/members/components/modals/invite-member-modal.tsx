"use client";

import { Check, Copy, Mail, UserPlus } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCreateInvitation } from "../../api";

interface InviteMemberModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  companyId: Id<"companies">;
  customRoles: Doc<"roles">[];
}

type RoleOption =
  | { kind: "literal"; value: "admin" | "member" }
  | { kind: "custom"; id: Id<"roles">; name: string };

const deserialize = (
  value: string,
  customRoles: Doc<"roles">[],
): RoleOption | null => {
  if (value === "literal:admin") return { kind: "literal", value: "admin" };
  if (value === "literal:member") return { kind: "literal", value: "member" };
  if (value.startsWith("custom:")) {
    const id = value.slice(7) as Id<"roles">;
    const role = customRoles.find((r) => r._id === id);
    if (!role) return null;
    return { kind: "custom", id: role._id, name: role.name };
  }
  return null;
};

export function InviteMemberModal({
  open,
  setOpen,
  companyId,
  customRoles,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [roleValue, setRoleValue] = useState<string>("literal:member");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const { mutate: createInvitation, isPending } = useCreateInvitation();

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRoleValue("literal:member");
      setCopiedLink(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const role = deserialize(roleValue, customRoles);
    if (!role) {
      toast.error("Selecciona un rol válido");
      return;
    }

    await createInvitation(
      {
        companyId,
        email,
        roleType: role.kind === "literal" ? role.value : "custom",
        customRoleId: role.kind === "custom" ? role.id : undefined,
      },
      {
        onSuccess: async ({ token }) => {
          const url = `${window.location.origin}/auth?invitation=${token}`;
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            // Non-fatal: UI still shows link to copy manually.
          }
          setCopiedLink(url);
          toast.success("Invitación creada — enlace copiado");
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  const handleCopyAgain = async () => {
    if (!copiedLink) return;
    try {
      await navigator.clipboard.writeText(copiedLink);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <AegisModal open={open} onOpenChange={setOpen} maxWidth="sm:max-w-md">
      <AegisModalHeader
        icon={UserPlus}
        title="Invitar miembro"
        description="Asigna un rol y envía el enlace de invitación."
      />

      {copiedLink ? (
        <>
          <AegisModalContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-aegis-emerald/10 px-3 py-2 text-sm text-aegis-graphite">
                <Check className="size-4 text-aegis-emerald" />
                Invitación enviada a{" "}
                <span className="font-medium">{email}</span>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-aegis-steel">
                  Enlace (expira en 7 días)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={copiedLink}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyAgain}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-aegis-steel">
                  Comparte este enlace con la persona que invitaste. Deberá
                  iniciar sesión con <strong>{email}</strong> para aceptar.
                </p>
              </div>
            </div>
          </AegisModalContent>
          <AegisModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEmail("");
                setRoleValue("literal:member");
                setCopiedLink(null);
              }}
            >
              Invitar a otra persona
            </Button>
            <DialogClose asChild>
              <Button type="button">Listo</Button>
            </DialogClose>
          </AegisModalFooter>
        </>
      ) : (
        <>
          <AegisModalContent>
            <form
              id="invite-member-form"
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <div className="space-y-1.5">
                <Label
                  htmlFor="invite-email"
                  className="text-xs font-medium text-aegis-steel"
                >
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-aegis-steel" />
                  <Input
                    id="invite-email"
                    type="email"
                    required
                    autoFocus
                    placeholder="persona@empresa.com"
                    value={email}
                    disabled={isPending}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-aegis-steel">
                  Rol inicial
                </Label>
                <Select
                  value={roleValue}
                  onValueChange={setRoleValue}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Roles del sistema</SelectLabel>
                      <SelectItem value="literal:admin">
                        Administrador
                      </SelectItem>
                      <SelectItem value="literal:member">Miembro</SelectItem>
                    </SelectGroup>
                    {customRoles.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Roles personalizados</SelectLabel>
                        {customRoles.map((role) => (
                          <SelectItem
                            key={role._id}
                            value={`custom:${role._id}`}
                          >
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-aegis-steel">
                  Podrás cambiar el rol después desde la tabla de miembros.
                </p>
              </div>
            </form>
          </AegisModalContent>
          <AegisModalFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="invite-member-form"
              disabled={isPending || !email}
            >
              Invitar y copiar enlace
            </Button>
          </AegisModalFooter>
        </>
      )}
    </AegisModal>
  );
}
