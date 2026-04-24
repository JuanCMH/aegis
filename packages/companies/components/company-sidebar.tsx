"use client";

import {
  Building2,
  ClipboardList,
  FileCheck2,
  FileStack,
  FileText,
  Files,
  KeyRound,
  LayoutDashboard,
  List,
  Settings2,
  Shield,
  ShieldCheck,
  Tag,
  UserCircle,
  UserPlus,
  Users,
} from "lucide-react";
import type { ComponentProps } from "react";
import { SidebarModeToggle } from "@/components/aegis/sidebar-mode-toggle";
import { SidebarUser } from "@/components/aegis/sidebar-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useMembersSheet } from "@/packages/members/store/use-members-sheet";
import { useCompanyId } from "../store/use-company-id";
import { CompanyMenu } from "./company-menu";
import { CompanySwitcher } from "./company-switcher";

export function CompanySidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const companyId = useCompanyId();
  const [, setMembersSheetOpen] = useMembersSheet();

  const data = [
    {
      title: "Inicio",
      icon: LayoutDashboard,
      items: [
        {
          title: "Dashboard",
          url: `/companies/${companyId}`,
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Clientes",
      icon: Users,
      items: [
        {
          title: "Lista de clientes",
          url: `/companies/${companyId}/clients`,
          icon: List,
        },
        {
          title: "Nuevo cliente",
          url: `/companies/${companyId}/clients/new`,
          icon: UserCircle,
        },
        {
          title: "Plantilla",
          url: `/companies/${companyId}/settings/client-template`,
          icon: ClipboardList,
        },
      ],
    },
    {
      title: "Cotizaciones",
      icon: FileStack,
      items: [
        {
          title: "Lista de cotizaciones",
          url: `/companies/${companyId}/quotes`,
          icon: List,
        },
        {
          title: "Nueva cotización",
          url: `/companies/${companyId}/quotes/new`,
          icon: FileText,
        },
      ],
    },
    {
      title: "Pólizas",
      icon: Files,
      items: [
        {
          title: "Lista de pólizas",
          url: `/companies/${companyId}/policies`,
          icon: List,
        },
        {
          title: "Nueva póliza",
          url: `/companies/${companyId}/policies/new`,
          icon: FileCheck2,
        },
      ],
    },
    {
      title: "Agencia",
      icon: Building2,
      items: [
        {
          title: "Configuración",
          url: `/companies/${companyId}/settings`,
          icon: Settings2,
        },
        {
          title: "Miembros",
          onClick: () => setMembersSheetOpen(true),
          icon: UserPlus,
        },
        {
          title: "Roles",
          url: `/companies/${companyId}/settings/roles`,
          icon: ShieldCheck,
        },
        {
          title: "Aseguradoras",
          url: `/companies/${companyId}/settings/insurers`,
          icon: Building2,
        },
        {
          title: "Ramos",
          url: `/companies/${companyId}/settings/lines-of-business`,
          icon: Tag,
        },
        {
          title: "Amparos",
          url: `/companies/${companyId}/settings/bonds`,
          icon: Shield,
        },
        {
          title: "Permisos",
          url: `/companies/${companyId}/settings/permissions`,
          icon: KeyRound,
        },
      ],
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon" desktopOverlay {...props}>
      <SidebarHeader>
        <CompanySwitcher />
      </SidebarHeader>
      <SidebarContent>
        <CompanyMenu data={data} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarModeToggle />
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
