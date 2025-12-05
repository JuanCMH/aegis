import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import {
  useGetOwnedWorkspaces,
  useGetWorkspace,
  useGetWorkspacesByUserId,
} from "../api";
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
        <div className="flex items-center gap-1">
          <div className="bg-blue-500  text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                disabled={isLoading}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                {!isLoading && (
                  <>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {workspace?.name}
                      </span>
                      <span className="truncate text-xs">Espacio actual</span>
                    </div>
                    <RiExpandUpDownLine className="ml-auto size-4" />
                  </>
                )}
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
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <RiAddLine className="size-4" />
                </div>
                <div className="font-medium">Nuevo espacio</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
