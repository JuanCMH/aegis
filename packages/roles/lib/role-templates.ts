import type { PermissionKey } from "@/convex/lib/permissions";
import { memberPermissionDefaults } from "@/convex/lib/permissions";
import { allPermissionKeys } from "./permission-groups";

export type PermissionsMap = Record<PermissionKey, boolean>;

/** All permissions = false. */
export const emptyPermissions = (): PermissionsMap =>
  Object.fromEntries(
    allPermissionKeys.map((k) => [k, false]),
  ) as PermissionsMap;

/** All permissions = true. */
export const fullPermissions = (): PermissionsMap =>
  Object.fromEntries(allPermissionKeys.map((k) => [k, true])) as PermissionsMap;

/** Copy of the literal Member defaults. */
export const memberDefaultPermissions = (): PermissionsMap => ({
  ...memberPermissionDefaults,
});

/** Read-only: view everything, mutate nothing. */
export const readOnlyPermissions = (): PermissionsMap => {
  const base = emptyPermissions();
  const viewKeys: PermissionKey[] = [
    "company_view",
    "members_view",
    "roles_view",
    "clients_view",
    "clientTemplates_view",
    "policies_view",
    "policies_viewCommissions",
    "quotes_view",
    "bonds_view",
    "insurers_view",
    "linesOfBusiness_view",
    "dashboard_viewOperational",
  ];
  for (const k of viewKeys) base[k] = true;
  return base;
};

/** Advisor: full operational CRUD on clients/quotes/policies, no admin. */
export const advisorPermissions = (): PermissionsMap => {
  const base = readOnlyPermissions();
  const advisorKeys: PermissionKey[] = [
    "clients_create",
    "clients_edit",
    "clients_export",
    "clients_useAI",
    "quotes_create",
    "quotes_edit",
    "quotes_convertToPolicy",
    "quotes_share",
    "quotes_useAI",
    "policies_create",
    "policies_edit",
    "policies_renew",
    "policies_export",
  ];
  for (const k of advisorKeys) base[k] = true;
  return base;
};

export interface RoleTemplate {
  id: string;
  label: string;
  description: string;
  build: () => PermissionsMap;
}

export const roleTemplates: RoleTemplate[] = [
  {
    id: "member",
    label: "Como Miembro",
    description: "Parte de los permisos por defecto para rol Miembro.",
    build: memberDefaultPermissions,
  },
  {
    id: "advisor",
    label: "Asesor",
    description: "Gestiona clientes, cotizaciones y pólizas.",
    build: advisorPermissions,
  },
  {
    id: "reader",
    label: "Sólo lectura",
    description: "Visualiza todo sin modificar nada.",
    build: readOnlyPermissions,
  },
  {
    id: "empty",
    label: "En blanco",
    description: "Sin permisos — ajusta manualmente.",
    build: emptyPermissions,
  },
];

/** Extract a `PermissionsMap` from any object, defaulting missing keys to `false`. */
export const permissionsFromRecord = (
  record: Partial<Record<PermissionKey, boolean>> | null | undefined,
): PermissionsMap => {
  const base = emptyPermissions();
  if (!record) return base;
  for (const k of allPermissionKeys) {
    base[k] = Boolean(record[k]);
  }
  return base;
};

/** Count selected permissions. */
export const countPermissions = (p: PermissionsMap): number =>
  allPermissionKeys.reduce((acc, k) => (p[k] ? acc + 1 : acc), 0);
