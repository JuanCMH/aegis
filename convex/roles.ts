import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import { rolesErrors } from "./lib/error_messages";
import { permissionsSchema } from "./lib/permissions";

const populateCustomRole = (ctx: QueryCtx, id: Id<"roles">) => ctx.db.get(id);

type checkPermissionArgs = {
  ctx: QueryCtx;
  userId: Id<"users">;
  workspaceId: Id<"workspaces">;
  permission?: keyof typeof permissionsSchema;
};

export const populateMember = (
  ctx: QueryCtx,
  userId: Id<"users">,
  workspaceId: Id<"workspaces">,
) =>
  ctx.db
    .query("members")
    .withIndex("workspaceId_userId", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();

export const checkPermission = async ({
  ctx,
  userId,
  permission,
  workspaceId,
}: checkPermissionArgs) => {
  const member = await populateMember(ctx, userId, workspaceId);
  if (!member) return false;
  if (member.role === "admin") return true;

  const customRole =
    member?.customRoleId &&
    (await populateCustomRole(ctx, member.customRoleId));

  return permission ? customRole?.[permission] : false;
};

export const update = mutation({
  args: {
    id: v.id("roles"),
    name: v.string(),
    ...permissionsSchema,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new ConvexError(rolesErrors.userNotAuthenticated);

    const role = await ctx.db.get(args.id);
    if (!role) throw new ConvexError(rolesErrors.roleNotFound);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "editRoles",
      workspaceId: role.workspaceId,
    });
    if (!hasPermission) throw new ConvexError(rolesErrors.cannotEditRoles);

    const { id, name, ...permissions } = args;
    await ctx.db.patch(args.id, {
      name: args.name,
      ...permissions,
    });

    const user = await ctx.db.get(userId);
    const userName = user?.name || "Usuario desconocido";

    const permissionsCount = Object.entries(permissions).filter(
      ([_, value]) => value === true,
    ).length;

    await ctx.runMutation(api.logs.create, {
      description: `Rol actualizado: ${role.name} (${permissionsCount} permisos)`,
      userName,
      type: "update",
      workspaceId: role.workspaceId,
      affectedEntityType: "role",
      affectedEntityId: args.id,
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
    if (userId === null)
      throw new ConvexError(rolesErrors.userNotAuthenticated);

    const role = await ctx.db.get(args.id);
    if (!role) throw new ConvexError(rolesErrors.roleNotFound);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "deleteRoles",
      workspaceId: role.workspaceId,
    });
    if (!hasPermission) throw new ConvexError(rolesErrors.cannotDeleteRoles);

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

    const user = await ctx.db.get(userId);
    const userName = user?.name || "Usuario desconocido";
    await ctx.runMutation(api.logs.create, {
      description: `Rol eliminado: ${role.name}`,
      userName,
      type: "delete",
      workspaceId: role.workspaceId,
      affectedEntityType: "role",
      affectedEntityId: args.id,
    });

    return args.id;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    workspaceId: v.id("workspaces"),
    ...permissionsSchema,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new ConvexError(rolesErrors.userNotAuthenticated);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "createRoles",
      workspaceId: args.workspaceId,
    });
    if (!hasPermission) throw new ConvexError(rolesErrors.cannotCreateRoles);

    const role = await ctx.db.insert("roles", {
      ...args,
    });

    const user = await ctx.db.get(userId);
    const userName = user?.name || "Usuario desconocido";

    const permissionsCount = Object.entries(args).filter(
      ([key, value]) =>
        key !== "name" && key !== "workspaceId" && value === true,
    ).length;

    await ctx.runMutation(api.logs.create, {
      description: `Rol creado: ${args.name} (${permissionsCount} permisos)`,
      userName,
      type: "create",
      workspaceId: args.workspaceId,
      affectedEntityType: "role",
      affectedEntityId: role,
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

    const member = await populateMember(ctx, userId, role.workspaceId);
    if (!member) return null;

    return role;
  },
});

export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const member = await populateMember(ctx, userId, args.workspaceId);
    if (!member) return null;

    const roles = await ctx.db
      .query("roles")
      .withIndex("workspaceId", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return roles;
  },
});
