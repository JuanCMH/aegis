import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkPermission, populateMember } from "./roles";
import { memberErrors } from "./errors/members";

/**
 * List all members of a company with user & (optional) custom role info.
 * Returns `[]` if caller is not a member or lacks `members_view`.
 */
export const getByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const allowed = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "members_view",
    });
    if (!allowed) return [];

    const company = await ctx.db.get(args.companyId);
    if (!company) return [];

    const members = await ctx.db
      .query("members")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .collect();

    const populated = await Promise.all(
      members.map(async (m) => {
        const [user, customRole] = await Promise.all([
          ctx.db.get(m.userId),
          m.customRoleId ? ctx.db.get(m.customRoleId) : Promise.resolve(null),
        ]);
        return {
          ...m,
          isOwner: company.userId === m.userId,
          user: user
            ? {
                _id: user._id,
                name: user.name ?? null,
                email: user.email ?? null,
                image: user.image ?? null,
              }
            : null,
          customRole: customRole
            ? { _id: customRole._id, name: customRole.name }
            : null,
        };
      }),
    );

    // Owner first, then admins, then members; alphabetical inside each group.
    return populated.sort((a, b) => {
      if (a.isOwner !== b.isOwner) return a.isOwner ? -1 : 1;
      if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
      const nameA = (a.user?.name ?? a.user?.email ?? "").toLowerCase();
      const nameB = (b.user?.name ?? b.user?.email ?? "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  },
});

/** Current user's membership in the given company. */
export const getCurrent = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) return null;
    const company = await ctx.db.get(args.companyId);
    return {
      ...member,
      isOwner: company?.userId === userId,
    };
  },
});

/**
 * Change a member's role. Admins can elevate/demote; cannot target the owner
 * or themselves. Assigning a customRoleId implicitly sets role to "member".
 */
export const changeRole = mutation({
  args: {
    id: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
    customRoleId: v.optional(v.id("roles")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(memberErrors.unauthorized);

    const target = await ctx.db.get(args.id);
    if (!target) throw new ConvexError(memberErrors.notFound);

    const allowed = await checkPermission({
      ctx,
      userId,
      companyId: target.companyId,
      permission: "members_assignRole",
    });
    if (!allowed) throw new ConvexError(memberErrors.permissionDenied);

    const company = await ctx.db.get(target.companyId);
    if (!company) throw new ConvexError(memberErrors.companyNotFound);

    if (company.userId === target.userId)
      throw new ConvexError(memberErrors.cannotAssignRoleToOwner);
    if (target.userId === userId)
      throw new ConvexError(memberErrors.cannotChangeOwnRole);

    if (args.customRoleId) {
      const customRole = await ctx.db.get(args.customRoleId);
      if (!customRole)
        throw new ConvexError(memberErrors.customRoleNotFound);
      if (customRole.companyId !== target.companyId)
        throw new ConvexError(memberErrors.customRoleMismatch);
    }

    await ctx.db.patch(args.id, {
      role: args.customRoleId ? "member" : args.role,
      customRoleId: args.customRoleId,
    });

    return args.id;
  },
});

/** Admin removes another member. Guards owner / self / last admin. */
export const remove = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(memberErrors.unauthorized);

    const target = await ctx.db.get(args.id);
    if (!target) throw new ConvexError(memberErrors.notFound);

    const allowed = await checkPermission({
      ctx,
      userId,
      companyId: target.companyId,
      permission: "members_expel",
    });
    if (!allowed) throw new ConvexError(memberErrors.permissionDenied);

    const company = await ctx.db.get(target.companyId);
    if (!company) throw new ConvexError(memberErrors.companyNotFound);

    if (company.userId === target.userId)
      throw new ConvexError(memberErrors.cannotRemoveOwner);
    if (target.userId === userId)
      throw new ConvexError(memberErrors.cannotRemoveSelf);

    if (target.role === "admin") {
      const admins = await ctx.db
        .query("members")
        .withIndex("companyId", (q) =>
          q.eq("companyId", target.companyId),
        )
        .collect();
      const adminCount = admins.filter((m) => m.role === "admin").length;
      if (adminCount <= 1)
        throw new ConvexError(memberErrors.cannotRemoveLastAdmin);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Current user leaves a company. Owner cannot leave; last admin cannot leave.
 */
export const leave = mutation({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(memberErrors.unauthorized);

    const company = await ctx.db.get(args.companyId);
    if (!company) throw new ConvexError(memberErrors.companyNotFound);

    if (company.userId === userId)
      throw new ConvexError(memberErrors.ownerCannotLeave);

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) throw new ConvexError(memberErrors.notFound);

    if (member.role === "admin") {
      const members = await ctx.db
        .query("members")
        .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
        .collect();
      const adminCount = members.filter((m) => m.role === "admin").length;
      if (adminCount <= 1)
        throw new ConvexError(memberErrors.onlyAdminCannotLeave);
    }

    await ctx.db.delete(member._id);
    return args.companyId;
  },
});
