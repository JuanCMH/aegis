import type { Doc } from "@/convex/_generated/dataModel";

export type {
  PermissionKey,
  permissionsSchema,
} from "@/convex/lib/permissions";
export { memberPermissionDefaults } from "@/convex/lib/permissions";

export type RoleDoc = Doc<"roles">;

export type RoleWithCount = RoleDoc & { memberCount: number };
