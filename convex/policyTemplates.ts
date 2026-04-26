import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkPermission, populateMember } from "./roles";
import { policyErrors } from "./errors/policies";

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

/** Canonical fixed fields every policy template must contain. */
export const POLICY_FIXED_FIELD_IDS = [
  "field_policyNumber",
  "field_status",
  "field_startDate",
  "field_endDate",
] as const;

export const getByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) return null;

    const canViewTemplate = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "policyTemplates_view",
    });
    const canViewPolicies = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "policies_view",
    });
    if (!canViewTemplate && !canViewPolicies) return null;

    return await ctx.db
      .query("policyTemplates")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .unique();
  },
});

export const save = mutation({
  args: {
    companyId: v.id("companies"),
    sections: v.array(sectionValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(policyErrors.unauthorized);

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) throw new ConvexError(policyErrors.permissionDenied);

    const canEdit = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "policyTemplates_edit",
    });
    if (!canEdit) throw new ConvexError(policyErrors.permissionDenied);

    // Validate that all four canonical fixed fields exist in the template.
    const allFields = args.sections.flatMap((s) => s.fields);
    const missing = POLICY_FIXED_FIELD_IDS.filter(
      (id) => !allFields.some((f) => f.isFixed && f.id === id),
    );
    if (missing.length > 0) {
      throw new ConvexError(policyErrors.fixedFieldsMissing);
    }

    const existing = await ctx.db
      .query("policyTemplates")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { sections: args.sections });
      return existing._id;
    }

    return await ctx.db.insert("policyTemplates", {
      companyId: args.companyId,
      sections: args.sections,
    });
  },
});
