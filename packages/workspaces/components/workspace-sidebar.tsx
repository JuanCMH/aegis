import {
  RiListView,
  RiHome2Fill,
  RiGroup2Fill,
  RiAddCircleFill,
  RiFolderShield2Fill,
  RiMoneyDollarCircleFill,
} from "@remixicon/react";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
} from "@/components/ui/sidebar";
import { ComponentProps } from "react";
import { WorkspaceMenu } from "./workspace-menu";
import { SidebarUser } from "@/components/sidebar-user";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { SidebarModeToggle } from "../../../components/sidebar-mode-toggle";

export function WorkspaceSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const workspaceId = useWorkspaceId();

  const data = [
    {
      title: "Principal",
      icon: RiHome2Fill,
      items: [],
    },
    {
      title: "Clientes",
      icon: RiGroup2Fill,
      items: [
        {
          title: "Lista de Clientes",
          url: `/workspaces/${workspaceId}/clients`,
          icon: RiListView,
        },
        {
          title: "Nuevo Cliente",
          url: `/workspaces/${workspaceId}/clients/new`,
          icon: RiAddCircleFill,
        },
      ],
    },
    {
      title: "Cotizaciones",
      icon: RiMoneyDollarCircleFill,
      items: [
        {
          title: "Lista de Cotizaciones",
          url: `/workspaces/${workspaceId}/quotes`,
          icon: RiListView,
        },
        {
          title: "Crear Cotización",
          url: `/workspaces/${workspaceId}/quotes/new`,
          icon: RiAddCircleFill,
        },
      ],
    },
    {
      title: "Pólizas",
      icon: RiFolderShield2Fill,
      items: [
        {
          title: "Lista de Pólizas",
          url: `/workspaces/${workspaceId}/policies`,
          icon: RiListView,
        },
        {
          title: "Nueva Póliza",
          url: `/workspaces/${workspaceId}/policies/new`,
          icon: RiAddCircleFill,
        },
      ],
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <WorkspaceMenu data={data} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarModeToggle />
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
