import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { bondErrors } from "./errors/bonds";
import { checkPermission, populateMember } from "./roles";

const normalise = (s: string) => s.trim();

const findDuplicate = async (
  ctx: QueryCtx,
  companyId: Id<"companies">,
  name: string,
  code: string | undefined,
  excludeId?: string,
) => {
  const nameLc = normalise(name).toLowerCase();
  const codeLc = code ? normalise(code).toLowerCase() : null;
  const all = await ctx.db
    .query("bonds")
    .withIndex("companyId", (q) => q.eq("companyId", companyId))
    .collect();

  for (const row of all) {
    if (row._id === excludeId) continue;
    if (row.name.trim().toLowerCase() === nameLc)
      return { kind: "name" as const };
    if (codeLc && row.code && row.code.trim().toLowerCase() === codeLc)
      return { kind: "code" as const };
  }
  return null;
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
      permission: "bonds_view",
    });
    if (!canView) return [];

    const rows = await ctx.db
      .query("bonds")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .collect();

    const filtered = args.includeInactive
      ? rows
      : rows.filter((r) => r.isActive);
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "es"));
  },
});

export const getById = query({
  args: { id: v.id("bonds") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const row = await ctx.db.get(args.id);
    if (!row) return null;

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: row.companyId,
      permission: "bonds_view",
    });
    if (!canView) return null;

    return row;
  },
});

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(bondErrors.unauthorized);

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) throw new ConvexError(bondErrors.companyNotFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "bonds_manage",
    });
    if (!canManage) throw new ConvexError(bondErrors.permissionDenied);

    const name = normalise(args.name);
    if (!name) throw new ConvexError(bondErrors.nameRequired);

    if (
      args.defaultRate !== undefined &&
      (args.defaultRate < 0 || args.defaultRate > 100)
    )
      throw new ConvexError(bondErrors.invalidRate);

    const dup = await findDuplicate(ctx, args.companyId, name, args.code);
    if (dup?.kind === "name") throw new ConvexError(bondErrors.duplicateName);
    if (dup?.kind === "code") throw new ConvexError(bondErrors.duplicateCode);

    return await ctx.db.insert("bonds", {
      companyId: args.companyId,
      name,
      code: args.code?.trim() || undefined,
      description: args.description?.trim() || undefined,
      defaultRate: args.defaultRate,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("bonds"),
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(bondErrors.unauthorized);

    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError(bondErrors.notFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: row.companyId,
      permission: "bonds_manage",
    });
    if (!canManage) throw new ConvexError(bondErrors.permissionDenied);

    const name = normalise(args.name);
    if (!name) throw new ConvexError(bondErrors.nameRequired);

    if (
      args.defaultRate !== undefined &&
      (args.defaultRate < 0 || args.defaultRate > 100)
    )
      throw new ConvexError(bondErrors.invalidRate);

    const dup = await findDuplicate(
      ctx,
      row.companyId,
      name,
      args.code,
      args.id,
    );
    if (dup?.kind === "name") throw new ConvexError(bondErrors.duplicateName);
    if (dup?.kind === "code") throw new ConvexError(bondErrors.duplicateCode);

    await ctx.db.patch(args.id, {
      name,
      code: args.code?.trim() || undefined,
      description: args.description?.trim() || undefined,
      defaultRate: args.defaultRate,
    });
    return args.id;
  },
});

export const setActive = mutation({
  args: { id: v.id("bonds"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(bondErrors.unauthorized);

    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError(bondErrors.notFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: row.companyId,
      permission: "bonds_manage",
    });
    if (!canManage) throw new ConvexError(bondErrors.permissionDenied);

    await ctx.db.patch(args.id, { isActive: args.isActive });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("bonds") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(bondErrors.unauthorized);

    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError(bondErrors.notFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: row.companyId,
      permission: "bonds_manage",
    });
    if (!canManage) throw new ConvexError(bondErrors.permissionDenied);

    await ctx.db.delete(args.id);
    return args.id;
  },
});
