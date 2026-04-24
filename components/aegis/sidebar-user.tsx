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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/packages/auth/api";
import { ProfileModal } from "@/packages/users/components/modals/profile-modal";
import { useAuthActions } from "@convex-dev/auth/react";
import { X, ChevronsUpDown, User } from "lucide-react";
import { useState } from "react";

export function SidebarUser() {
  const { isMobile } = useSidebar();
  const { signOut } = useAuthActions();
  const { data: user } = useCurrentUser();
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) return null;

  const avatarFallback = user.name!.charAt(0).toUpperCase();

  return (
    <>
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
