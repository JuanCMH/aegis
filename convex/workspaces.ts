import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { workspacesErrors } from "./lib/error_messages";
import { checkPermission, populateMember } from "./roles";

const random: RandomReader = {
  read(bytes) {
    crypto.getRandomValues(bytes);
  },
};
const generateCode = () =>
  generateRandomString(random, "abcdefghijklmnopqrstuvwxyz0123456789", 6);

export const join = mutation({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new ConvexError(workspacesErrors.userNotAuthenticated);

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("joinCode", (q) => q.eq("joinCode", args.joinCode))
      .unique();
    if (!workspace) throw new ConvexError(workspacesErrors.joinError);

    const member = await populateMember(ctx, userId, workspace._id);
    if (member)
      return {
        workspaceId: workspace._id,
      };

    // await ctx.db.insert("members", {
    //   userId,
    //   workspaceId: workspace._id,
    //   role: "member",
    // });

    const currentUser = await ctx.db.get(userId);
    const userName = currentUser?.name || "Usuario desconocido";
    // await ctx.runMutation(api.logs.create, {
    //   description: `Usuario se unió al workspace: ${workspace.name}`,
    //   userName,
    //   type: "info",
    //   workspaceId: workspace._id,
    //   affectedEntityType: "workspace",
    //   affectedEntityId: workspace._id,
    // });

    return {
      workspaceId: workspace._id,
    };
  },
});

export const newJoinCode = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new ConvexError(workspacesErrors.userNotAuthenticated);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "inviteUsers",
      workspaceId: args.id,
    });
    if (!hasPermission)
      throw new ConvexError(workspacesErrors.cannotCreateNewCode);

    const workspace = await ctx.db.get(args.id);
    if (!workspace) throw new ConvexError(workspacesErrors.workspaceNotFound);

    const joinCode = generateCode();
    await ctx.db.patch(args.id, { joinCode });

    const currentUser = await ctx.db.get(userId);
    const userName = currentUser?.name || "Usuario desconocido";
    await ctx.runMutation(api.logs.create, {
      description: `Código de unión actualizado para el espacio`,
      userName,
      type: "update",
      workspaceId: args.id,
      affectedEntityType: "workspace",
      affectedEntityId: args.id,
    });

    return args.id;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const ownedWorkspaces = await ctx.db
      .query("workspaces")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const maxWorkspaces = 2;
    if (ownedWorkspaces.length >= maxWorkspaces) {
      return null;
    }
    const joinCode = generateCode();
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      active: true,
      joinCode,
    });

    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin",
    });

    const currentUser = await ctx.db.get(userId);
    const userName = currentUser?.name || "Usuario desconocido";
    await ctx.runMutation(api.logs.create, {
      description: `Espacio creado: ${args.name}`,
      userName,
      type: "create",
      affectedEntityType: "workspace",
      affectedEntityId: workspaceId,
    });

    return workspaceId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const members = await ctx.db
      .query("members")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const workspaceIds = members.map((m) => m.workspaceId);
    const workspaces = [];

    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);
      if (workspace) workspaces.push(workspace);
    }

    return workspaces;
  },
});

export const getOwned = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new ConvexError(workspacesErrors.userNotAuthenticated);

    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    return workspaces.length;
  },
});

export const getById = query({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const member = await populateMember(ctx, userId, args.id);
    if (!member) return null;

    return await ctx.db.get(args.id);
  },
});

export const getByIdPublic = query({
  args: {
    id: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(workspacesErrors.unauthorized);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "editWorkspace",
      workspaceId: args.id,
    });
    if (!hasPermission) throw new ConvexError(workspacesErrors.unauthorized);

    const workspace = await ctx.db.get(args.id);
    if (!workspace) throw new ConvexError(workspacesErrors.workspaceNotFound);

    await ctx.db.patch(args.id, { name: args.name, active: args.active });

    const currentUser = await ctx.db.get(userId);
    const userName = currentUser?.name || "Usuario desconocido";

    const activeChanged = args.active !== workspace.active;

    let description = `Espacio actualizado: ${args.name}`;
    if (activeChanged) {
      const newActiveState = args.active ? "activado" : "desactivado";
      description = `Espacio ${newActiveState}: ${args.name}`;
    }

    await ctx.runMutation(api.logs.create, {
      description,
      userName,
      type: "update",
      workspaceId: args.id,
      affectedEntityType: "workspace",
      affectedEntityId: args.id,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(workspacesErrors.unauthorized);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      workspaceId: args.id,
    });
    if (!hasPermission) throw new ConvexError(workspacesErrors.unauthorized);

    const workspace = await ctx.db.get(args.id);
    if (!workspace) throw new ConvexError(workspacesErrors.workspaceNotFound);

    const [members] = await Promise.all([
      ctx.db
        .query("members")
        .withIndex("workspaceId", (q) => q.eq("workspaceId", args.id))
        .collect(),
    ]);

    for (const m of members) {
      await ctx.db.delete(m._id);
    }

    await ctx.db.delete(args.id);

    const currentUser = await ctx.db.get(userId);
    const userName = currentUser?.name || "Usuario desconocido";
    await ctx.runMutation(api.logs.create, {
      description: `Espacio eliminado: ${workspace.name}`,
      userName,
      type: "delete",
      affectedEntityType: "workspace",
      affectedEntityId: args.id,
    });

    return args.id;
  },
});

export const getByUserId = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new ConvexError(workspacesErrors.userNotAuthenticated);

    const members = await ctx.db
      .query("members")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const workspaces = await Promise.all(
      members.map(async (member) => {
        const workspace = await ctx.db.get(member.workspaceId);
        if (!workspace) return null;
        return workspace;
      }),
    );

    return workspaces;
  },
});
