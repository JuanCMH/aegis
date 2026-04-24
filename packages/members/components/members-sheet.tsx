"use client";

import { Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCurrentUser } from "@/packages/auth/api";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import {
  useGetMembersByCompany,
  useGetPendingInvitations,
} from "@/packages/members/api";
import { MembersTable } from "@/packages/members/components/members-table";
import { PendingInvitationsList } from "@/packages/members/components/pending-invitations-list";
import { InviteMemberModal } from "@/packages/members/components/modals/invite-member-modal";
import { useMembersSheet } from "@/packages/members/store/use-members-sheet";
import { useGetRoles, useHasPermissions } from "@/packages/roles/api";
import { RoleGate } from "@/packages/roles/components/role-gate";

export function MembersSheet() {
  const companyId = useCompanyId();
  const [open, setOpen] = useMembersSheet();
  const [filter, setFilter] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: members, isLoading: isLoadingMembers } = useGetMembersByCompany(
    { companyId },
  );
  const { data: invitations, isLoading: isLoadingInvitations } =
    useGetPendingInvitations({ companyId });
  const { data: customRoles } = useGetRoles({ companyId });

  const { permissions } = useHasPermissions({
    companyId,
    permissions: [
      "members_invite",
      "members_expel",
      "members_assignRole",
      "invitations_revoke",
    ],
  });

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto p-0 sm:max-w-3xl"
        >
          <SheetHeader className="border-b border-muted bg-card p-6">
            <SheetTitle className="text-lg font-semibold tracking-tight text-aegis-graphite">
              Miembros de la agencia
            </SheetTitle>
            <SheetDescription className="text-sm text-aegis-steel">
              Gestiona quién tiene acceso y con qué rol.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-aegis-steel" />
                <Input
                  placeholder="Buscar por nombre o correo"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-9"
                />
              </div>
              <RoleGate permission="members_invite">
                <Button onClick={() => setInviteOpen(true)}>
                  <UserPlus className="size-4" />
                  Invitar miembro
                </Button>
              </RoleGate>
            </div>

            <PendingInvitationsList
              invitations={invitations}
              isLoading={isLoadingInvitations}
              canRevoke={permissions?.invitations_revoke ?? false}
              canInvite={permissions?.members_invite ?? false}
            />

            <MembersTable
              members={members}
              isLoading={isLoadingMembers}
              currentUserId={currentUser?._id ?? ""}
              canAssignRole={permissions?.members_assignRole ?? false}
              canExpel={permissions?.members_expel ?? false}
              customRoles={customRoles ?? []}
              filter={filter}
            />
          </div>
        </SheetContent>
      </Sheet>

      <InviteMemberModal
        open={inviteOpen}
        setOpen={setInviteOpen}
        companyId={companyId}
        customRoles={customRoles ?? []}
      />
    </>
  );
}
