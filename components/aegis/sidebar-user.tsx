"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/hooks/use-confirm";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/get-error-message";
import { useCurrentUser } from "@/packages/auth/api";
import {
  useGetCurrentMember,
  useLeaveCompany,
} from "@/packages/members/api";
import { ProfileModal } from "@/packages/users/components/modals/profile-modal";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  ChevronsUpDown,
  LogOut,
  User,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function SidebarUser() {
  const { isMobile } = useSidebar();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [profileOpen, setProfileOpen] = useState(false);

  // Route context — present only inside a company route.
  const params = useParams<{ companyId?: Id<"companies"> }>();
  const companyId = params?.companyId;

  const { data: currentMember } = useGetCurrentMember(
    companyId ? { companyId } : { companyId: undefined as unknown as Id<"companies"> },
  );
  const { mutate: leave, isPending: isLeaving } = useLeaveCompany();

  const [LeaveConfirm, confirmLeave] = useConfirm({
    title: "Salir de la agencia",
    message:
      "¿Seguro que quieres salir de esta agencia? Perderás el acceso a sus clientes, pólizas y cotizaciones inmediatamente.",
    type: "critical",
    confirmText: "Salir de la agencia",
  });

  if (!user) return null;

  const avatarFallback = user.name!.charAt(0).toUpperCase();
  const canLeave =
    Boolean(companyId) && currentMember && !currentMember.isOwner;

  const handleLeave = async () => {
    if (!companyId) return;
    const ok = await confirmLeave();
    if (!ok) return;
    await leave(
      { companyId },
      {
        onSuccess: () => {
          toast.success("Has salido de la agencia");
          router.push("/companies");
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <>
      <LeaveConfirm />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.userImage} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-aegis-sapphire/10 text-aegis-sapphire font-semibold">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.userImage} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-aegis-sapphire/10 text-aegis-sapphire font-semibold">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setProfileOpen(true)}
                className="flex items-center justify-between gap-2 cursor-pointer"
              >
                Perfil
                <User className="size-4 ml-2" />
              </DropdownMenuItem>
              {canLeave && (
                <DropdownMenuItem
                  onClick={handleLeave}
                  disabled={isLeaving}
                  className="flex items-center justify-between gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  Salir de la agencia
                  <LogOut className="size-4 ml-2" />
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => signOut()}
                className="flex items-center justify-between gap-2 cursor-pointer"
              >
                Cerrar sesión
                <X className="size-4 ml-2" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <ProfileModal open={profileOpen} setOpen={setProfileOpen} user={user} />
    </>
  );
}
