import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkPermission, populateMember } from "./roles";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { workspaceErrors } from "./errors/workspace";

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
    if (userId === null) throw new ConvexError(workspaceErrors.unauthorized);

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("joinCode", (q) => q.eq("joinCode", args.joinCode))
      .unique();
    if (!workspace) throw new ConvexError(workspaceErrors.joinCodeInvalid);

    const member = await populateMember(ctx, userId, workspace._id);
    if (member) throw new ConvexError(workspaceErrors.alreadyMember);

    await ctx.db.insert("members", {
      userId,
      workspaceId: workspace._id,
      role: "member",
    });

    return workspace._id;
  },
});

export const newJoinCode = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(workspaceErrors.unauthorized);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "inviteUsers",
      workspaceId: args.id,
    });
    if (!hasPermission) throw new ConvexError(workspaceErrors.permissionDenied);

    const workspace = await ctx.db.get(args.id);
    if (!workspace) throw new ConvexError(workspaceErrors.notFound);

    const joinCode = generateCode();
    await ctx.db.patch(args.id, { joinCode });

    return args.id;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    primaryColor: v.string(),
    secondaryColor: v.string(),
    logo: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(workspaceErrors.unauthorized);

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError(workspaceErrors.userNotFound);

    const ownedWorkspaces = await ctx.db
      .query("workspaces")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const maxWorkspaces = 2;
    if (ownedWorkspaces.length >= maxWorkspaces) {
      throw new ConvexError(workspaceErrors.limitReached);
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

    return workspaceId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

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
    if (userId === null) return 0;

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
    if (userId === null) throw new ConvexError(workspaceErrors.unauthorized);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "editWorkspace",
      workspaceId: args.id,
    });
    if (!hasPermission) throw new ConvexError(workspaceErrors.permissionDenied);

    const workspace = await ctx.db.get(args.id);
    if (!workspace) throw new ConvexError(workspaceErrors.notFound);

    await ctx.db.patch(args.id, { name: args.name, active: args.active });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(workspaceErrors.unauthorized);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      workspaceId: args.id,
    });
    if (!hasPermission) throw new ConvexError(workspaceErrors.permissionDenied);

    const workspace = await ctx.db.get(args.id);
    if (!workspace) throw new ConvexError(workspaceErrors.notFound);

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

    return args.id;
  },
});

export const getByUserId = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

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
