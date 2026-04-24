import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useGetWorkspace, useGetWorkspacesByUserId } from "../api";
import { GalleryVerticalEnd } from "lucide-react";
import { RiAddLine, RiExpandUpDownLine } from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCreateWorkspaceModal } from "../store/use-create-workspace-modal";

export const WorkspaceSwitcher = () => {
  const router = useRouter();
  const { isMobile, state: sidebarState } = useSidebar();
  const workspaceId = useWorkspaceId();

  const { data: workspaces, isLoading: workspacesLoading } =
    useGetWorkspacesByUserId();
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  const [_openCreateWorkspace, setOpenCreateWorkspace] =
    useCreateWorkspaceModal();

  const isLoading = workspaceLoading || workspacesLoading;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={isLoading}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer gap-3"
            >
              <div className="flex size-8 items-center justify-center rounded-xl border border-h-indigo/10 bg-h-indigo/10 text-h-indigo shrink-0">
                <GalleryVerticalEnd className="size-4" />
              </div>
              {!isLoading && (
                <div
                  className={cn(
                    "grid flex-1 text-left text-sm leading-tight transition-opacity",
                    sidebarState === "collapsed" && !isMobile && "opacity-0",
                  )}
                >
                  <span className="truncate font-semibold">
                    {workspace?.name}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    Espacio actual
                  </span>
                </div>
              )}
              <RiExpandUpDownLine
                className={cn(
                  "ml-auto size-4 text-sidebar-foreground/60",
                  sidebarState === "collapsed" && !isMobile && "hidden",
                )}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={4}
            side={isMobile ? "bottom" : "right"}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Espacios
            </DropdownMenuLabel>
            <div className="max-h-60 overflow-y-auto overflow-x-hidden space-y-1">
              {workspaces?.map((workspace) => (
                <DropdownMenuItem
                  key={workspace?._id}
                  className={cn(
                    "gap-2 p-2 cursor-pointer",
                    workspace?._id === workspaceId &&
                      "bg-accent text-accent-foreground",
                  )}
                  onClick={() => router.push(`/workspaces/${workspace?._id}`)}
                >
                  <div className="flex size-6 items-center justify-center shrink-0">
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                  <span className="line-clamp-2">{workspace?.name}</span>
                  {workspace?._id === workspaceId && (
                    <div className="ml-auto">
                      <div className="size-2 rounded-full bg-primary" />
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setOpenCreateWorkspace(true)}
              className="gap-2 p-2 cursor-pointer"
            >
              <div className="flex size-6 items-center justify-center rounded-md border border-border/40 bg-background">
                <RiAddLine className="size-4" />
              </div>
              <div className="font-medium">Nuevo espacio</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
