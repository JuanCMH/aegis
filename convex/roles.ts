import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import {
  memberPermissionDefaults,
  type PermissionKey,
  permissionsSchema,
} from "./lib/permissions";
import { roleErrors } from "./errors/roles";

const populateCustomRole = (ctx: QueryCtx, id: Id<"roles">) => ctx.db.get(id);

type checkPermissionArgs = {
  ctx: QueryCtx;
  userId: Id<"users">;
  companyId: Id<"companies">;
  permission?: PermissionKey;
};

export const populateMember = (
  ctx: QueryCtx,
  userId: Id<"users">,
  companyId: Id<"companies">,
) =>
  ctx.db
    .query("members")
    .withIndex("companyId_userId", (q) =>
      q.eq("companyId", companyId).eq("userId", userId),
    )
    .unique();

export const checkPermission = async ({
  ctx,
  userId,
  permission,
  companyId,
}: checkPermissionArgs) => {
  const member = await populateMember(ctx, userId, companyId);
  if (!member) return false;
  if (member.role === "admin") return true;
  if (!permission) return false;

  if (member.customRoleId) {
    const customRole = await populateCustomRole(ctx, member.customRoleId);
    return Boolean(customRole?.[permission]);
  }

  // Literal "member" role with no customRoleId → fall back to Member defaults.
  return memberPermissionDefaults[permission] ?? false;
};

export const update = mutation({
  args: {
    id: v.id("roles"),
    name: v.string(),
    ...permissionsSchema,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(roleErrors.unauthorized);

    const role = await ctx.db.get(args.id);
    if (!role) throw new ConvexError(roleErrors.notFound);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "roles_edit",
      companyId: role.companyId,
    });
    if (!hasPermission) throw new ConvexError(roleErrors.cannotEditRoles);

    const { id, name, ...permissions } = args;
    await ctx.db.patch(args.id, {
      name: args.name,
      ...permissions,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(roleErrors.unauthorized);

    const role = await ctx.db.get(args.id);
    if (!role) throw new ConvexError(roleErrors.notFound);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "roles_delete",
      companyId: role.companyId,
    });
    if (!hasPermission) throw new ConvexError(roleErrors.cannotDeleteRoles);

    const membersWithRole = await ctx.db
      .query("members")
      .withIndex("customRoleId", (q) => q.eq("customRoleId", args.id))
      .collect();

    for (const member of membersWithRole) {
      await ctx.db.patch(member._id, {
        customRoleId: undefined,
      });
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    companyId: v.id("companies"),
    ...permissionsSchema,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(roleErrors.unauthorized);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "roles_create",
      companyId: args.companyId,
    });
    if (!hasPermission) throw new ConvexError(roleErrors.cannotCreateRoles);

    const role = await ctx.db.insert("roles", {
      ...args,
    });

    return role;
  },
});

export const getById = query({
  args: {
    id: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const role = await ctx.db.get(args.id);
    if (!role) return null;

    const member = await populateMember(ctx, userId, role.companyId);
    if (!member) return null;

    return role;
  },
});

export const get = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) return [];

    const roles = await ctx.db
      .query("roles")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .collect();

    return roles;
  },
});

/**
 * Client-side permission check. Used by `<RoleGate>` and `useHasPermission`.
 * Returns `false` for unauthenticated users and non-members.
 */
export const hasPermission = query({
  args: {
    companyId: v.id("companies"),
    permission: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return false;
    // Runtime guard: reject unknown permission keys.
    if (!(args.permission in permissionsSchema)) return false;
    return await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: args.permission as PermissionKey,
    });
  },
});

/**
 * Batch variant of `hasPermission`. Returns a record keyed by permission.
 * Used by `<RoleGate>` when multiple permissions are requested via `permissions`.
 */
export const hasPermissions = query({
  args: {
    companyId: v.id("companies"),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const result: Record<string, boolean> = {};
    if (userId === null) {
      for (const p of args.permissions) result[p] = false;
      return result;
    }
    for (const p of args.permissions) {
      if (!(p in permissionsSchema)) {
        result[p] = false;
        continue;
      }
      result[p] = await checkPermission({
        ctx,
        userId,
        companyId: args.companyId,
        permission: p as PermissionKey,
      });
    }
    return result;
  },
});
