import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { insurerErrors } from "./errors/insurers";
import { checkPermission, populateMember } from "./roles";

const normaliseName = (name: string) => name.trim();

const findDuplicateName = async (
  ctx: Parameters<typeof checkPermission>[0]["ctx"],
  companyId: Parameters<typeof checkPermission>[0]["companyId"],
  name: string,
  excludeId?: string,
) => {
  const normalised = normaliseName(name).toLowerCase();
  const existing = await ctx.db
    .query("insurers")
    .withIndex("companyId", (q) => q.eq("companyId", companyId))
    .collect();
  return existing.find(
    (ins) =>
      ins.name.trim().toLowerCase() === normalised && ins._id !== excludeId,
  );
};

export const getByCompany = query({
  args: {
    companyId: v.id("companies"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) return [];

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "insurers_view",
    });
    if (!canView) return [];

    const rows = await ctx.db
      .query("insurers")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .collect();

    const filtered = args.includeInactive
      ? rows
      : rows.filter((ins) => ins.isActive);

    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "es"));
  },
});

export const getById = query({
  args: {
    id: v.id("insurers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const insurer = await ctx.db.get(args.id);
    if (!insurer) return null;

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: insurer.companyId,
      permission: "insurers_view",
    });
    if (!canView) return null;

    return insurer;
  },
});

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    taxId: v.optional(v.string()),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(insurerErrors.unauthorized);

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) throw new ConvexError(insurerErrors.companyNotFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "insurers_manage",
    });
    if (!canManage) throw new ConvexError(insurerErrors.permissionDenied);

    const name = normaliseName(args.name);
    if (!name) throw new ConvexError(insurerErrors.nameRequired);

    const duplicate = await findDuplicateName(ctx, args.companyId, name);
    if (duplicate) throw new ConvexError(insurerErrors.duplicateName);

    return await ctx.db.insert("insurers", {
      companyId: args.companyId,
      name,
      taxId: args.taxId?.trim() || undefined,
      website: args.website?.trim() || undefined,
      email: args.email?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("insurers"),
    name: v.string(),
    taxId: v.optional(v.string()),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(insurerErrors.unauthorized);

    const insurer = await ctx.db.get(args.id);
    if (!insurer) throw new ConvexError(insurerErrors.notFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: insurer.companyId,
      permission: "insurers_manage",
    });
    if (!canManage) throw new ConvexError(insurerErrors.permissionDenied);

    const name = normaliseName(args.name);
    if (!name) throw new ConvexError(insurerErrors.nameRequired);

    const duplicate = await findDuplicateName(
      ctx,
      insurer.companyId,
      name,
      args.id,
    );
    if (duplicate) throw new ConvexError(insurerErrors.duplicateName);

    await ctx.db.patch(args.id, {
      name,
      taxId: args.taxId?.trim() || undefined,
      website: args.website?.trim() || undefined,
      email: args.email?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
    });

    return args.id;
  },
});

export const setActive = mutation({
  args: {
    id: v.id("insurers"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(insurerErrors.unauthorized);

    const insurer = await ctx.db.get(args.id);
    if (!insurer) throw new ConvexError(insurerErrors.notFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: insurer.companyId,
      permission: "insurers_manage",
    });
    if (!canManage) throw new ConvexError(insurerErrors.permissionDenied);

    await ctx.db.patch(args.id, { isActive: args.isActive });
    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("insurers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(insurerErrors.unauthorized);

    const insurer = await ctx.db.get(args.id);
    if (!insurer) throw new ConvexError(insurerErrors.notFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: insurer.companyId,
      permission: "insurers_manage",
    });
    if (!canManage) throw new ConvexError(insurerErrors.permissionDenied);

    await ctx.db.delete(args.id);
    return args.id;
  },
});
