import { useFetch } from "@/components/hooks/use-fetch";
import { useMutate } from "@/components/hooks/use-mutate";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { PermissionKey } from "./types";

const route = api.roles;

export const useGetRoles = (data: typeof route.get._args) =>
  useFetch(route.get, data);

export const useGetRolesWithCounts = (data: typeof route.getWithCounts._args) =>
  useFetch(route.getWithCounts, data);

export const useGetRole = (data: typeof route.getById._args) =>
  useFetch(route.getById, data);

export const useCreateRole = () => useMutate(route.create);

export const useUpdateRole = () => useMutate(route.update);

export const useRemoveRole = () => useMutate(route.remove);

/**
 * Reactive permission check. Returns `undefined` while loading, then `boolean`.
 */
export const useHasPermission = (args: {
  companyId: Id<"companies">;
  permission: PermissionKey;
}) => useFetch(route.hasPermission, args);

/**
 * Batch variant — returns a reactive map of `{ [permission]: boolean }`.
 */
export const useHasPermissions = (args: {
  companyId: Id<"companies">;
  permissions: PermissionKey[];
}) => {
  const { data, isLoading } = useFetch(route.hasPermissions, args);
  return {
    permissions: data as Record<PermissionKey, boolean> | undefined,
    isLoading,
  };
};
