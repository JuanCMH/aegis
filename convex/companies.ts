import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkPermission, populateMember } from "./roles";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { companyErrors } from "./errors/company";

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
    if (userId === null) throw new ConvexError(companyErrors.unauthorized);

    const company = await ctx.db
      .query("companies")
      .withIndex("joinCode", (q) => q.eq("joinCode", args.joinCode))
      .unique();
    if (!company) throw new ConvexError(companyErrors.joinCodeInvalid);

    const member = await populateMember(ctx, userId, company._id);
    if (member) throw new ConvexError(companyErrors.alreadyMember);

    await ctx.db.insert("members", {
      userId,
      companyId: company._id,
      role: "member",
    });

    return company._id;
  },
});

export const newJoinCode = mutation({
  args: {
    id: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(companyErrors.unauthorized);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "members_invite",
      companyId: args.id,
    });
    if (!hasPermission) throw new ConvexError(companyErrors.permissionDenied);

    const company = await ctx.db.get(args.id);
    if (!company) throw new ConvexError(companyErrors.notFound);

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
    if (userId === null) throw new ConvexError(companyErrors.unauthorized);

    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError(companyErrors.userNotFound);

    const ownedCompanies = await ctx.db
      .query("companies")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const maxCompanies = 2;
    if (ownedCompanies.length >= maxCompanies) {
      throw new ConvexError(companyErrors.limitReached);
    }
    const joinCode = generateCode();
    const companyId = await ctx.db.insert("companies", {
      name: args.name,
      userId,
      active: true,
      joinCode,
    });

    await ctx.db.insert("members", {
      userId,
      companyId,
      role: "admin",
    });

    return companyId;
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

    const companyIds = members.map((m) => m.companyId);
    const companies = [];

    for (const companyId of companyIds) {
      const company = await ctx.db.get(companyId);
      if (company) companies.push(company);
    }

    return companies;
  },
});

export const getOwned = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return 0;

    const companies = await ctx.db
      .query("companies")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    return companies.length;
  },
});

export const getById = query({
  args: {
    id: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const member = await populateMember(ctx, userId, args.id);
    if (!member) return null;

    const company = await ctx.db.get(args.id);
    if (!company) return null;

    const logoUrl = company.logo
      ? await ctx.storage.getUrl(company.logo)
      : null;

    return { ...company, logoUrl };
  },
});

export const getByIdPublic = query({
  args: {
    id: v.optional(v.id("companies")),
  },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    const company = await ctx.db.get(args.id);
    if (!company) return null;
    const logoUrl = company.logo
      ? await ctx.storage.getUrl(company.logo)
      : null;
    return { ...company, logoUrl };
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    active: v.optional(v.boolean()),
    legalName: v.optional(v.string()),
    taxIdType: v.optional(
      v.union(
        v.literal("nit"),
        v.literal("cc"),
        v.literal("ce"),
        v.literal("passport"),
      ),
    ),
    taxIdNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    website: v.optional(v.string()),
    country: v.optional(v.string()),
    department: v.optional(v.string()),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(companyErrors.unauthorized);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "company_edit",
      companyId: args.id,
    });
    if (!hasPermission) throw new ConvexError(companyErrors.permissionDenied);

    const company = await ctx.db.get(args.id);
    if (!company) throw new ConvexError(companyErrors.notFound);

    const { id, ...rest } = args;
    const patch = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => v !== undefined),
    );

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }

    return id;
  },
});

export const setLogo = mutation({
  args: {
    id: v.id("companies"),
    logo: v.union(v.id("_storage"), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(companyErrors.unauthorized);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      permission: "company_edit",
      companyId: args.id,
    });
    if (!hasPermission) throw new ConvexError(companyErrors.permissionDenied);

    const company = await ctx.db.get(args.id);
    if (!company) throw new ConvexError(companyErrors.notFound);

    // Borra el logo previo del storage para no acumular basura.
    if (company.logo && company.logo !== args.logo) {
      try {
        await ctx.storage.delete(company.logo);
      } catch {
        /* archivo ya borrado o no existe; ignorar. */
      }
    }

    await ctx.db.patch(args.id, {
      logo: args.logo === null ? undefined : args.logo,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(companyErrors.unauthorized);

    const hasPermission = await checkPermission({
      ctx,
      userId,
      companyId: args.id,
    });
    if (!hasPermission) throw new ConvexError(companyErrors.permissionDenied);

    const company = await ctx.db.get(args.id);
    if (!company) throw new ConvexError(companyErrors.notFound);

    const [members] = await Promise.all([
      ctx.db
        .query("members")
        .withIndex("companyId", (q) => q.eq("companyId", args.id))
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

    const companies = await Promise.all(
      members.map(async (member) => {
        const company = await ctx.db.get(member.companyId);
        if (!company) return null;
        return company;
      }),
    );

    return companies;
  },
});
