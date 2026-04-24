"use client";

import { Search, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/packages/auth/api";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import {
  useGetMembersByCompany,
  useGetPendingInvitations,
} from "@/packages/members/api";
import { MembersTable } from "@/packages/members/components/members-table";
import { PendingInvitationsList } from "@/packages/members/components/pending-invitations-list";
import { InviteMemberModal } from "@/packages/members/components/modals/invite-member-modal";
import { useGetRoles, useHasPermissions } from "@/packages/roles/api";
import { RoleGate } from "@/packages/roles/components/role-gate";
import { cn } from "@/lib/utils";

export default function MembersPage() {
  const companyId = useCompanyId();
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
    <div className="flex h-full w-full flex-1 flex-col px-2">
      <div className="z-11 mx-2 mt-4 rounded-lg border border-muted bg-card pb-2">
        <header
          className={cn(
            "z-10 sticky top-0 flex shrink-0 flex-col transition-[width,height] ease-linear",
            "min-h-12",
          )}
        >
          <div className="flex w-full items-center p-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="cursor-pointer" />
              <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/companies/${companyId}`}>
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Miembros</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>
      </div>

      <div className="mx-2 mt-4 flex-1 space-y-4 pb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-aegis-graphite">
              Miembros de la agencia
            </h1>
            <p className="text-sm text-aegis-steel">
              Gestiona quién tiene acceso y con qué rol.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-aegis-steel" />
              <Input
                placeholder="Buscar por nombre o correo"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-9 sm:w-72"
              />
            </div>
            <RoleGate permission="members_invite">
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="size-4" />
                Invitar miembro
              </Button>
            </RoleGate>
          </div>
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

      <InviteMemberModal
        open={inviteOpen}
        setOpen={setInviteOpen}
        companyId={companyId}
        customRoles={customRoles ?? []}
      />
    </div>
  );
}
