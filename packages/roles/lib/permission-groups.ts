import {
  Building2,
  FileCheck2,
  FileSignature,
  LayoutDashboard,
  ListChecks,
  MailOpen,
  ScrollText,
  Shield,
  ShieldCheck,
  Tag,
  UserCog,
  Users,
} from "lucide-react";
import type { PermissionKey } from "@/convex/lib/permissions";

export interface PermissionItem {
  key: PermissionKey;
  label: string;
  description?: string;
  /** If true, this permission is critical/destructive. Highlighted in UI. */
  destructive?: boolean;
}

export interface PermissionGroup {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: PermissionItem[];
}

/**
 * All 46 permissions grouped by domain for the matrix UI.
 * Order matches docs/PERMISSIONS.md §3.
 */
export const permissionGroups: PermissionGroup[] = [
  {
    id: "company",
    label: "Agencia",
    description: "Configuración general y datos de la compañía.",
    icon: Building2,
    items: [
      { key: "company_view", label: "Ver información de la agencia" },
      { key: "company_edit", label: "Editar información de la agencia" },
      {
        key: "company_delete",
        label: "Eliminar agencia",
        destructive: true,
      },
      { key: "company_viewAudit", label: "Ver historial de auditoría" },
    ],
  },
  {
    id: "members",
    label: "Miembros",
    description: "Gestión del equipo y asignación de roles.",
    icon: Users,
    items: [
      { key: "members_view", label: "Ver lista de miembros" },
      { key: "members_invite", label: "Invitar nuevos miembros" },
      {
        key: "members_expel",
        label: "Expulsar miembros",
        destructive: true,
      },
      { key: "members_assignRole", label: "Asignar y cambiar roles" },
    ],
  },
  {
    id: "invitations",
    label: "Invitaciones",
    description: "Control de invitaciones pendientes.",
    icon: MailOpen,
    items: [
      { key: "invitations_revoke", label: "Revocar invitaciones pendientes" },
    ],
  },
  {
    id: "roles",
    label: "Roles y permisos",
    description: "Crear y mantener roles personalizados.",
    icon: ShieldCheck,
    items: [
      { key: "roles_view", label: "Ver roles personalizados" },
      { key: "roles_create", label: "Crear roles personalizados" },
      { key: "roles_edit", label: "Editar roles personalizados" },
      {
        key: "roles_delete",
        label: "Eliminar roles personalizados",
        destructive: true,
      },
    ],
  },
  {
    id: "clients",
    label: "Clientes",
    description: "CRM de clientes y herramientas asistidas.",
    icon: UserCog,
    items: [
      { key: "clients_view", label: "Ver clientes" },
      { key: "clients_create", label: "Crear clientes" },
      { key: "clients_edit", label: "Editar clientes" },
      {
        key: "clients_delete",
        label: "Eliminar clientes",
        destructive: true,
      },
      { key: "clients_export", label: "Exportar clientes" },
      { key: "clients_useAI", label: "Usar asistente IA en clientes" },
    ],
  },
  {
    id: "clientTemplates",
    label: "Plantillas de cliente",
    description: "Campos personalizados y formato de la ficha de cliente.",
    icon: ListChecks,
    items: [
      { key: "clientTemplates_view", label: "Ver plantillas" },
      { key: "clientTemplates_edit", label: "Editar plantillas" },
    ],
  },
  {
    id: "policies",
    label: "Pólizas",
    description: "Ciclo de vida completo de las pólizas.",
    icon: FileCheck2,
    items: [
      { key: "policies_view", label: "Ver pólizas" },
      { key: "policies_create", label: "Crear pólizas" },
      { key: "policies_edit", label: "Editar pólizas" },
      {
        key: "policies_delete",
        label: "Eliminar pólizas",
        destructive: true,
      },
      { key: "policies_renew", label: "Renovar pólizas" },
      { key: "policies_cancel", label: "Cancelar pólizas" },
      {
        key: "policies_viewCommissions",
        label: "Ver comisiones",
      },
      {
        key: "policies_editCommissions",
        label: "Editar comisiones",
      },
      { key: "policies_export", label: "Exportar pólizas" },
    ],
  },
  {
    id: "quotes",
    label: "Cotizaciones",
    description: "Gestión y conversión de cotizaciones.",
    icon: FileSignature,
    items: [
      { key: "quotes_view", label: "Ver cotizaciones" },
      { key: "quotes_create", label: "Crear cotizaciones" },
      { key: "quotes_edit", label: "Editar cotizaciones" },
      {
        key: "quotes_delete",
        label: "Eliminar cotizaciones",
        destructive: true,
      },
      {
        key: "quotes_convertToPolicy",
        label: "Convertir cotización en póliza",
      },
      { key: "quotes_share", label: "Compartir cotizaciones" },
      { key: "quotes_useAI", label: "Usar asistente IA en cotizaciones" },
    ],
  },
  {
    id: "bonds",
    label: "Fianzas",
    description: "Pólizas de fianza y sus partes.",
    icon: Shield,
    items: [
      { key: "bonds_view", label: "Ver fianzas" },
      { key: "bonds_manage", label: "Gestionar fianzas" },
    ],
  },
  {
    id: "insurers",
    label: "Aseguradoras",
    description: "Catálogo de aseguradoras del espacio.",
    icon: Building2,
    items: [
      { key: "insurers_view", label: "Ver aseguradoras" },
      { key: "insurers_manage", label: "Gestionar aseguradoras" },
    ],
  },
  {
    id: "linesOfBusiness",
    label: "Ramos",
    description: "Catálogo de ramos o líneas de negocio.",
    icon: Tag,
    items: [
      { key: "linesOfBusiness_view", label: "Ver ramos" },
      { key: "linesOfBusiness_manage", label: "Gestionar ramos" },
    ],
  },
  {
    id: "dashboard",
    label: "Tablero",
    description: "Visibilidad operativa y financiera.",
    icon: LayoutDashboard,
    items: [
      {
        key: "dashboard_viewOperational",
        label: "Ver tablero operativo",
      },
      {
        key: "dashboard_viewFinancial",
        label: "Ver tablero financiero",
      },
      { key: "dashboard_export", label: "Exportar reportes" },
    ],
  },
  {
    id: "logs",
    label: "Registros",
    description: "Historial detallado de actividad.",
    icon: ScrollText,
    items: [{ key: "logs_view", label: "Ver registros de actividad" }],
  },
];

/** Flat list of all permission keys in canonical order. */
export const allPermissionKeys: PermissionKey[] = permissionGroups.flatMap(
  (group) => group.items.map((item) => item.key),
);
