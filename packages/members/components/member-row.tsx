"use client";

import { MoreHorizontal, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/hooks/use-confirm";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Doc } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/get-error-message";
import { useChangeMemberRole, useRemoveMember } from "../api";
import type { MemberRow as MemberRowType } from "../types";
import { RoleBadge } from "./role-badge";

interface MemberRowProps {
  member: MemberRowType;
  currentUserId: string;
  canAssignRole: boolean;
  canExpel: boolean;
  customRoles: Doc<"roles">[];
}

export function MemberRow({
  member,
  currentUserId,
  canAssignRole,
  canExpel,
  customRoles,
}: MemberRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const { mutate: changeRole, isPending: isChangingRole } =
    useChangeMemberRole();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();

  const [RemoveConfirm, confirmRemove] = useConfirm({
    title: "Eliminar miembro",
    message: `¿Seguro que quieres eliminar a ${
      member.user?.name ?? member.user?.email ?? "este miembro"
    } de la agencia? Perderá el acceso inmediatamente.`,
    type: "critical",
    confirmText: "Eliminar",
  });

  const isSelf = member.userId === currentUserId;
  const fallback = (member.user?.name ?? member.user?.email ?? "?")
    .charAt(0)
    .toUpperCase();

  const handleChangeRole = async (
    role: "admin" | "member",
    customRoleId?: Doc<"roles">["_id"],
  ) => {
    await changeRole(
      { id: member._id, role, customRoleId },
      {
        onSuccess: () => toast.success("Rol actualizado"),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
    setMenuOpen(false);
  };

  const handleRemove = async () => {
    setMenuOpen(false);
    const ok = await confirmRemove();
    if (!ok) return;
    await removeMember(
      { id: member._id },
      {
        onSuccess: () => toast.success("Miembro eliminado"),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  const showMenu = !member.isOwner && !isSelf && (canAssignRole || canExpel);

  return (
    <>
      <RemoveConfirm />
      <TableRow className="hover:bg-muted/40">
        <TableCell className="py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-9 shrink-0">
              <AvatarImage
                src={member.user?.image ?? undefined}
                alt={member.user?.name ?? ""}
              />
              <AvatarFallback className="rounded-lg bg-aegis-sapphire/10 text-aegis-sapphire font-semibold">
                {fallback}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-aegis-graphite">
                {member.user?.name ?? "Sin nombre"}
                {isSelf && (
                  <span className="ml-2 text-xs font-normal text-aegis-steel">
                    (tú)
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-aegis-steel">
                {member.user?.email ?? "—"}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-3">
          <RoleBadge
            role={member.role}
            isOwner={member.isOwner}
            customRoleName={member.customRole?.name}
          />
        </TableCell>
        <TableCell className="py-3 text-right">
          {showMenu ? (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isChangingRole || isRemoving}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {canAssignRole && (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-aegis-steel">
                      <UserCog className="size-3.5" />
                      Cambiar rol
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => handleChangeRole("admin")}
                      disabled={member.role === "admin" && !member.customRoleId}
                    >
                      <ShieldCheck className="size-4 text-aegis-sapphire" />
                      Administrador
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleChangeRole("member")}
                      disabled={
                        member.role === "member" && !member.customRoleId
                      }
                    >
                      Miembro
                    </DropdownMenuItem>
                    {customRoles.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-medium text-aegis-steel">
                          Roles personalizados
                        </DropdownMenuLabel>
                        {customRoles.map((role) => (
                          <DropdownMenuItem
                            key={role._id}
                            onClick={() => handleChangeRole("member", role._id)}
                            disabled={member.customRoleId === role._id}
                          >
                            <ShieldCheck className="size-4 text-aegis-cyan" />
                            {role.name}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </>
                )}
                {canAssignRole && canExpel && <DropdownMenuSeparator />}
                {canExpel && (
                  <DropdownMenuItem
                    onClick={handleRemove}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Eliminar miembro
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </TableCell>
      </TableRow>
    </>
  );
}
