import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ComponentProps } from "react";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { SidebarModeToggle } from "../../../components/sidebar-mode-toggle";

import {
  RiDashboard2Fill,
  RiFolderShield2Fill,
  RiMoneyDollarCircleFill,
  RiPassportFill,
  RiTeamFill,
} from "@remixicon/react";
import { WorkspaceMenu } from "./workspace-menu";
import { SidebarUser } from "@/components/sidebar-user";

export function WorkspaceSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();

  const items = [
    {
      title: "Dashboard",
      icon: RiDashboard2Fill,
      url: `/workspaces/${workspaceId}`,
      isActive: pathname === `/workspaces/${workspaceId}`,
    },
    {
      title: "Clientes",
      icon: RiPassportFill,
      url: `/workspaces/${workspaceId}/customers`,
      isActive: pathname === `/workspaces/${workspaceId}/customers`,
    },
    {
      title: "Cotizaciones",
      icon: RiMoneyDollarCircleFill,
      url: `/workspaces/${workspaceId}/quotes`,
      isActive: pathname === `/workspaces/${workspaceId}/quotes`,
    },
    {
      title: "Pólizas",
      icon: RiFolderShield2Fill,
      url: `/workspaces/${workspaceId}/policies`,
      isActive: pathname === `/workspaces/${workspaceId}/policies`,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <WorkspaceMenu items={items} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarModeToggle />
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
