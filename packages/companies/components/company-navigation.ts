"use client";

import {
  Building2,
  ClipboardList,
  FileCheck2,
  FileSpreadsheet,
  FileStack,
  FileText,
  Files,
  FolderOpen,
  Landmark,
  LayoutDashboard,
  LayoutTemplate,
  List,
  type LucideIcon,
  ScrollText,
  Settings2,
  Shield,
  ShieldCheck,
  UserCircle,
  UserPlus,
  Users,
} from "lucide-react";

export type NavAction =
  | { type: "link"; url: string }
  | { type: "callback"; key: string };

export interface NavItem {
  id: string;
  title: string;
  /** Lucide icon component for in-app render. */
  icon: LucideIcon;
  /** Lucide icon name (string) for serializable persistence. */
  iconName: string;
  /** Action: navigate or run callback (e.g. open a sheet). */
  action: NavAction;
  /** Hint shown on hover / palette search context. */
  description?: string;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

/* --------- Sheet callback keys (consumed by the sidebar layer). --------- */
export const SHEET_KEYS = {
  members: "members",
  roles: "roles",
  insurers: "insurers",
  linesOfBusiness: "linesOfBusiness",
  bonds: "bonds",
  companySettings: "companySettings",
} as const;

export type SheetKey = (typeof SHEET_KEYS)[keyof typeof SHEET_KEYS];

/* --------------------------------------------------------------------- */
/*  Canonical navigation as defined by the aegis-interface skill (§2.6).  */
/* --------------------------------------------------------------------- */
export function buildCompanyNavigation(companyId: string): NavGroup[] {
  return [
    {
      title: "Operación",
      icon: LayoutDashboard,
      items: [
        {
          id: `dashboard:${companyId}`,
          title: "Dashboard",
          icon: LayoutDashboard,
          iconName: "LayoutDashboard",
          action: { type: "link", url: `/companies/${companyId}` },
          description: "Vista general de la agencia",
        },
        {
          id: `clients:${companyId}`,
          title: "Clientes",
          icon: Users,
          iconName: "Users",
          action: { type: "link", url: `/companies/${companyId}/clients` },
          description: "Lista y gestión de clientes",
        },
        {
          id: `clients-new:${companyId}`,
          title: "Nuevo cliente",
          icon: UserCircle,
          iconName: "UserCircle",
          action: { type: "link", url: `/companies/${companyId}/clients/new` },
          description: "Crear un cliente",
        },
        {
          id: `quotes:${companyId}`,
          title: "Cotizaciones",
          icon: FileStack,
          iconName: "FileStack",
          action: { type: "link", url: `/companies/${companyId}/quotes` },
          description: "Lista de cotizaciones",
        },
        {
          id: `quotes-new:${companyId}`,
          title: "Nueva cotización",
          icon: FileText,
          iconName: "FileText",
          action: { type: "link", url: `/companies/${companyId}/quotes/new` },
          description: "Crear una cotización",
        },
        {
          id: `policies:${companyId}`,
          title: "Pólizas",
          icon: Files,
          iconName: "Files",
          action: { type: "link", url: `/companies/${companyId}/policies` },
          description: "Lista de pólizas",
        },
        {
          id: `policies-new:${companyId}`,
          title: "Nueva póliza",
          icon: FileCheck2,
          iconName: "FileCheck2",
          action: { type: "link", url: `/companies/${companyId}/policies/new` },
          description: "Crear una póliza",
        },
      ],
    },
    {
      title: "Catálogos",
      icon: List,
      items: [
        {
          id: "insurers",
          title: "Aseguradoras",
          icon: Landmark,
          iconName: "Landmark",
          action: { type: "callback", key: SHEET_KEYS.insurers },
          description: "Catálogo de aseguradoras",
        },
        {
          id: "linesOfBusiness",
          title: "Ramos",
          icon: FolderOpen,
          iconName: "FolderOpen",
          action: { type: "callback", key: SHEET_KEYS.linesOfBusiness },
          description: "Catálogo de ramos",
        },
        {
          id: "bonds",
          title: "Amparos",
          icon: Shield,
          iconName: "Shield",
          action: { type: "callback", key: SHEET_KEYS.bonds },
          description: "Catálogo de amparos",
        },
      ],
    },
    {
      title: "Administración",
      icon: ShieldCheck,
      items: [
        {
          id: "members",
          title: "Miembros",
          icon: UserPlus,
          iconName: "UserPlus",
          action: { type: "callback", key: SHEET_KEYS.members },
          description: "Equipo y permisos",
        },
        {
          id: "roles",
          title: "Roles",
          icon: ShieldCheck,
          iconName: "ShieldCheck",
          action: { type: "callback", key: SHEET_KEYS.roles },
          description: "Roles personalizados",
        },
        {
          id: `client-template:${companyId}`,
          title: "Plantilla de cliente",
          icon: LayoutTemplate,
          iconName: "LayoutTemplate",
          action: {
            type: "link",
            url: `/companies/${companyId}/settings/client-template`,
          },
          description: "Campos personalizados de cliente",
        },
        {
          id: `policy-template:${companyId}`,
          title: "Plantilla de póliza",
          icon: ClipboardList,
          iconName: "ClipboardList",
          action: {
            type: "link",
            url: `/companies/${companyId}/settings/policy-template`,
          },
          description: "Campos personalizados de póliza",
        },
        {
          id: `logs:${companyId}`,
          title: "Auditoría",
          icon: ScrollText,
          iconName: "ScrollText",
          action: {
            type: "link",
            url: `/companies/${companyId}/logs`,
          },
          description: "Bitácora de cambios",
        },
      ],
    },
    {
      title: "Configuración",
      icon: Settings2,
      items: [
        {
          id: `settings:${companyId}`,
          title: "Ajustes de la agencia",
          icon: Settings2,
          iconName: "Settings2",
          action: { type: "callback", key: SHEET_KEYS.companySettings },
          description: "Datos generales",
        },
      ],
    },
  ];
}

/** Flatten the canonical navigation for command-palette indexing. */
export function flattenNavigation(groups: NavGroup[]) {
  return groups.flatMap((g) =>
    g.items.map((item) => ({ ...item, group: g.title })),
  );
}

/** Re-export pure-icon refs (helpful when picking icons elsewhere). */
export const NavIcons = {
  Building2,
  FileSpreadsheet,
  Landmark,
  ScrollText,
};
