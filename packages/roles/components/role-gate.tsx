"use client";

import { useQuery } from "convex/react";
import type { ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCompanyId } from "@/packages/companies/store/use-company-id";
import type { PermissionKey } from "../types";

type SinglePermissionProps = {
  permission: PermissionKey;
  permissions?: never;
  mode?: never;
};

type MultiPermissionProps = {
  permission?: never;
  permissions: PermissionKey[];
  /** `any` = OR semantics, `all` = AND semantics. Defaults to `any`. */
  mode?: "any" | "all";
};

type RoleGateProps = (SinglePermissionProps | MultiPermissionProps) & {
  children: ReactNode;
  /** Rendered when the permission check fails. Defaults to `null`. */
  fallback?: ReactNode;
  /** Rendered while the permission is loading. Defaults to `null`. */
  loading?: ReactNode;
  /** Override the ambient companyId (from route) if gating for a different company. */
  companyId?: Id<"companies">;
};

/**
 * Hide or reveal UI based on the current user's permissions in the active company.
 *
 *     <RoleGate permission="policies_delete">
 *       <Button>Delete</Button>
 *     </RoleGate>
 *
 *     <RoleGate permissions={["clients_edit", "clients_delete"]} mode="any">
 *       ...
 *     </RoleGate>
 *
 * Server-side enforcement is still required — this component is purely UX.
 */
export function RoleGate({
  permission,
  permissions,
  mode = "any",
  children,
  fallback = null,
  loading = null,
  companyId: companyIdProp,
}: RoleGateProps) {
  const ambientCompanyId = useCompanyId();
  const companyId = companyIdProp ?? ambientCompanyId;
  const keys: PermissionKey[] = permission ? [permission] : (permissions ?? []);

  const result = useQuery(
    api.roles.hasPermissions,
    companyId && keys.length > 0 ? { companyId, permissions: keys } : "skip",
  );

  if (!companyId || keys.length === 0) return <>{fallback}</>;
  if (result === undefined) return <>{loading}</>;

  const values = keys.map((k) => Boolean(result[k]));
  const granted = mode === "all" ? values.every(Boolean) : values.some(Boolean);

  return <>{granted ? children : fallback}</>;
}
