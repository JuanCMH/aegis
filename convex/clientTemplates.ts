import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { populateMember } from "./roles";
import { clientErrors } from "./errors/clients";

const fieldConfigValidator = v.object({
  minLength: v.optional(v.number()),
  maxLength: v.optional(v.number()),
  minValue: v.optional(v.number()),
  maxValue: v.optional(v.number()),
  options: v.optional(
    v.array(v.object({ label: v.string(), value: v.string() })),
  ),
  acceptedFormats: v.optional(v.array(v.string())),
  maxFileSize: v.optional(v.number()),
});

const fieldValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("textarea"),
    v.literal("number"),
    v.literal("currency"),
    v.literal("date"),
    v.literal("select"),
    v.literal("phone"),
    v.literal("email"),
    v.literal("file"),
    v.literal("image"),
    v.literal("switch"),
    v.literal("url"),
  ),
  label: v.string(),
  placeholder: v.optional(v.string()),
  required: v.boolean(),
  size: v.union(
    v.literal("small"),
    v.literal("medium"),
    v.literal("large"),
    v.literal("full"),
  ),
  sizeOverride: v.optional(
    v.object({
      sm: v.optional(v.number()),
      md: v.optional(v.number()),
      lg: v.optional(v.number()),
    }),
  ),
  showInTable: v.boolean(),
  isFixed: v.boolean(),
  config: fieldConfigValidator,
});

const sectionValidator = v.object({
  id: v.string(),
  label: v.string(),
  order: v.number(),
  fields: v.array(fieldValidator),
});

export const getByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const member = await populateMember(ctx, userId, args.workspaceId);
    if (!member) return null;

    return await ctx.db
      .query("clientTemplates")
      .withIndex("workspaceId", (q) => q.eq("workspaceId", args.workspaceId))
      .unique();
  },
});

export const save = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    sections: v.array(sectionValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const member = await populateMember(ctx, userId, args.workspaceId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    // Validate that canonical fixed fields exist in the template.
    const allFields = args.sections.flatMap((s) => s.fields);
    const hasName = allFields.some((f) => f.isFixed && f.id === "field_name");
    const hasIdentification = allFields.some(
      (f) => f.isFixed && f.id === "field_identificationNumber",
    );
    if (!hasName || !hasIdentification) {
      throw new ConvexError(clientErrors.fixedFieldsMissing);
    }

    const existing = await ctx.db
      .query("clientTemplates")
      .withIndex("workspaceId", (q) => q.eq("workspaceId", args.workspaceId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { sections: args.sections });
      return existing._id;
    }

    return await ctx.db.insert("clientTemplates", {
      workspaceId: args.workspaceId,
      sections: args.sections,
    });
  },
});
