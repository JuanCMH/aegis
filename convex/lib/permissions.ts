import { v } from "convex/values";

/**
 * Granular permissions (47 keys) — see docs/PERMISSIONS.md §3.
 *
 * Keys follow `<domain>.<action>` convention. Admin (literal role) implicitly
 * has every permission; Member (literal role, no customRoleId) falls back to
 * `memberPermissionDefaults`. Custom roles store a full row in `roles`.
 */
export const permissionsSchema = {
  // Company
  company_view: v.boolean(),
  company_edit: v.boolean(),
  company_delete: v.boolean(),
  company_viewAudit: v.boolean(),

  // Members
  members_view: v.boolean(),
  members_invite: v.boolean(),
  members_expel: v.boolean(),
  members_assignRole: v.boolean(),

  // Invitations
  invitations_revoke: v.boolean(),

  // Roles
  roles_view: v.boolean(),
  roles_create: v.boolean(),
  roles_edit: v.boolean(),
  roles_delete: v.boolean(),

  // Clients
  clients_view: v.boolean(),
  clients_create: v.boolean(),
  clients_edit: v.boolean(),
  clients_delete: v.boolean(),
  clients_export: v.boolean(),
  clients_useAI: v.boolean(),

  // Client templates
  clientTemplates_view: v.boolean(),
  clientTemplates_edit: v.boolean(),

  // Policies
  policies_view: v.boolean(),
  policies_create: v.boolean(),
  policies_edit: v.boolean(),
  policies_delete: v.boolean(),
  policies_renew: v.boolean(),
  policies_cancel: v.boolean(),
  policies_viewCommissions: v.boolean(),
  policies_editCommissions: v.boolean(),
  policies_export: v.boolean(),

  // Quotes
  quotes_view: v.boolean(),
  quotes_create: v.boolean(),
  quotes_edit: v.boolean(),
  quotes_delete: v.boolean(),
  quotes_convertToPolicy: v.boolean(),
  quotes_share: v.boolean(),
  quotes_useAI: v.boolean(),

  // Bonds
  bonds_view: v.boolean(),
  bonds_manage: v.boolean(),

  // Insurers
  insurers_view: v.boolean(),
  insurers_manage: v.boolean(),

  // Lines of Business
  linesOfBusiness_view: v.boolean(),
  linesOfBusiness_manage: v.boolean(),

  // Dashboard
  dashboard_viewOperational: v.boolean(),
  dashboard_viewFinancial: v.boolean(),
  dashboard_export: v.boolean(),

  // Logs
  logs_view: v.boolean(),
};

export type PermissionKey = keyof typeof permissionsSchema;

/**
 * Default permissions applied to any member with literal role `"member"` and
 * no customRoleId. See docs/PERMISSIONS.md §4.2.
 */
export const memberPermissionDefaults: Record<PermissionKey, boolean> = {
  company_view: true,
  company_edit: false,
  company_delete: false,
  company_viewAudit: false,

  members_view: false,
  members_invite: false,
  members_expel: false,
  members_assignRole: false,

  invitations_revoke: false,

  roles_view: false,
  roles_create: false,
  roles_edit: false,
  roles_delete: false,

  clients_view: true,
  clients_create: true,
  clients_edit: true,
  clients_delete: false,
  clients_export: true,
  clients_useAI: true,

  clientTemplates_view: true,
  clientTemplates_edit: false,

  policies_view: true,
  policies_create: true,
  policies_edit: true,
  policies_delete: false,
  policies_renew: true,
  policies_cancel: false,
  policies_viewCommissions: true,
  policies_editCommissions: false,
  policies_export: true,

  quotes_view: true,
  quotes_create: true,
  quotes_edit: true,
  quotes_delete: false,
  quotes_convertToPolicy: true,
  quotes_share: true,
  quotes_useAI: true,

  bonds_view: true,
  bonds_manage: false,

  insurers_view: true,
  insurers_manage: false,

  linesOfBusiness_view: true,
  linesOfBusiness_manage: false,

  dashboard_viewOperational: true,
  dashboard_viewFinancial: false,
  dashboard_export: false,

  logs_view: false,
};
