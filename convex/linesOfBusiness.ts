import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { lineOfBusinessErrors } from "./errors/linesOfBusiness";
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
    .query("linesOfBusiness")
    .withIndex("companyId", (q) => q.eq("companyId", companyId))
    .collect();

  for (const row of all) {
    if (row._id === excludeId) continue;
    if (row.name.trim().toLowerCase() === nameLc)
      return { kind: "name" as const };
    if (
      codeLc &&
      row.code &&
      row.code.trim().toLowerCase() === codeLc
    )
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
      permission: "linesOfBusiness_view",
    });
    if (!canView) return [];

    const rows = await ctx.db
      .query("linesOfBusiness")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .collect();

    const filtered = args.includeInactive
      ? rows
      : rows.filter((r) => r.isActive);

    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "es"));
  },
});

export const getById = query({
  args: { id: v.id("linesOfBusiness") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const row = await ctx.db.get(args.id);
    if (!row) return null;

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: row.companyId,
      permission: "linesOfBusiness_view",
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
    defaultCommission: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new ConvexError(lineOfBusinessErrors.unauthorized);

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member)
      throw new ConvexError(lineOfBusinessErrors.companyNotFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "linesOfBusiness_manage",
    });
    if (!canManage)
      throw new ConvexError(lineOfBusinessErrors.permissionDenied);

    const name = normalise(args.name);
    if (!name) throw new ConvexError(lineOfBusinessErrors.nameRequired);

    if (
      args.defaultCommission !== undefined &&
      (args.defaultCommission < 0 || args.defaultCommission > 100)
    )
      throw new ConvexError(lineOfBusinessErrors.invalidCommission);

    const dup = await findDuplicate(
      ctx,
      args.companyId,
      name,
      args.code,
    );
    if (dup?.kind === "name")
      throw new ConvexError(lineOfBusinessErrors.duplicateName);
    if (dup?.kind === "code")
      throw new ConvexError(lineOfBusinessErrors.duplicateCode);

    return await ctx.db.insert("linesOfBusiness", {
      companyId: args.companyId,
      name,
      code: args.code?.trim() || undefined,
      description: args.description?.trim() || undefined,
      defaultCommission: args.defaultCommission,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("linesOfBusiness"),
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultCommission: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new ConvexError(lineOfBusinessErrors.unauthorized);

    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError(lineOfBusinessErrors.notFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: row.companyId,
      permission: "linesOfBusiness_manage",
    });
    if (!canManage)
      throw new ConvexError(lineOfBusinessErrors.permissionDenied);

    const name = normalise(args.name);
    if (!name) throw new ConvexError(lineOfBusinessErrors.nameRequired);

    if (
      args.defaultCommission !== undefined &&
      (args.defaultCommission < 0 || args.defaultCommission > 100)
    )
      throw new ConvexError(lineOfBusinessErrors.invalidCommission);

    const dup = await findDuplicate(
      ctx,
      row.companyId,
      name,
      args.code,
      args.id,
    );
    if (dup?.kind === "name")
      throw new ConvexError(lineOfBusinessErrors.duplicateName);
    if (dup?.kind === "code")
      throw new ConvexError(lineOfBusinessErrors.duplicateCode);

    await ctx.db.patch(args.id, {
      name,
      code: args.code?.trim() || undefined,
      description: args.description?.trim() || undefined,
      defaultCommission: args.defaultCommission,
    });
    return args.id;
  },
});

export const setActive = mutation({
  args: {
    id: v.id("linesOfBusiness"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new ConvexError(lineOfBusinessErrors.unauthorized);

    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError(lineOfBusinessErrors.notFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: row.companyId,
      permission: "linesOfBusiness_manage",
    });
    if (!canManage)
      throw new ConvexError(lineOfBusinessErrors.permissionDenied);

    await ctx.db.patch(args.id, { isActive: args.isActive });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("linesOfBusiness") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      throw new ConvexError(lineOfBusinessErrors.unauthorized);

    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError(lineOfBusinessErrors.notFound);

    const canManage = await checkPermission({
      ctx,
      userId,
      companyId: row.companyId,
      permission: "linesOfBusiness_manage",
    });
    if (!canManage)
      throw new ConvexError(lineOfBusinessErrors.permissionDenied);

    await ctx.db.delete(args.id);
    return args.id;
  },
});
