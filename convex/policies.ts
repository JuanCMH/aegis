import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkPermission, populateMember } from "./roles";
import { policyErrors } from "./errors/policies";

const FIXED_POLICY_NUMBER_FIELD_ID = "field_policyNumber";
const FIXED_STATUS_FIELD_ID = "field_status";
const FIXED_START_DATE_FIELD_ID = "field_startDate";
const FIXED_END_DATE_FIELD_ID = "field_endDate";
const ALLOWED_STATUSES = new Set(["active", "expired", "canceled", "pending"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const URL_RE = /^https?:\/\/.+/;

type PolicyTemplateField = {
  id: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "currency"
    | "date"
    | "select"
    | "phone"
    | "email"
    | "file"
    | "image"
    | "switch"
    | "url";
  label: string;
  required: boolean;
  config: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    options?: Array<{ label: string; value: string }>;
  };
};

type PolicyTemplate = {
  _id: unknown;
  companyId: unknown;
  sections: Array<{ fields: PolicyTemplateField[] }>;
};

function getDataRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function isEmptyValue(value: unknown) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

function parseDateMs(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : ms;
  }
  return null;
}

function validateFieldValue(field: PolicyTemplateField, value: unknown) {
  if (isEmptyValue(value)) return;
  const stringValue = typeof value === "string" ? value.trim() : "";

  if (field.type === "text" || field.type === "textarea") {
    if (typeof value !== "string")
      throw new ConvexError(policyErrors.invalidFieldData);
    if (field.config.minLength && stringValue.length < field.config.minLength)
      throw new ConvexError(policyErrors.invalidFieldData);
    if (field.config.maxLength && stringValue.length > field.config.maxLength)
      throw new ConvexError(policyErrors.invalidFieldData);
    return;
  }

  if (field.type === "number" || field.type === "currency") {
    const numericValue =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value)
          : Number.NaN;
    if (Number.isNaN(numericValue))
      throw new ConvexError(policyErrors.invalidFieldData);
    if (field.config.minValue != null && numericValue < field.config.minValue)
      throw new ConvexError(policyErrors.invalidFieldData);
    if (field.config.maxValue != null && numericValue > field.config.maxValue)
      throw new ConvexError(policyErrors.invalidFieldData);
    return;
  }

  if (field.type === "email") {
    if (typeof value !== "string" || !EMAIL_RE.test(stringValue))
      throw new ConvexError(policyErrors.invalidFieldData);
    return;
  }

  if (field.type === "phone") {
    if (typeof value !== "string" || !PHONE_RE.test(stringValue))
      throw new ConvexError(policyErrors.invalidFieldData);
    return;
  }

  if (field.type === "url") {
    if (typeof value !== "string" || !URL_RE.test(stringValue))
      throw new ConvexError(policyErrors.invalidFieldData);
    return;
  }

  if (field.type === "date") {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value)))
      throw new ConvexError(policyErrors.invalidFieldData);
    return;
  }

  if (field.type === "select") {
    if (typeof value !== "string")
      throw new ConvexError(policyErrors.invalidFieldData);
    const options = field.config.options ?? [];
    if (options.length > 0 && !options.some((option) => option.value === value))
      throw new ConvexError(policyErrors.invalidFieldData);
    return;
  }

  if (field.type === "switch") {
    if (typeof value !== "boolean")
      throw new ConvexError(policyErrors.invalidFieldData);
    return;
  }

  if (field.type === "file" || field.type === "image") {
    if (typeof value !== "string")
      throw new ConvexError(policyErrors.invalidFieldData);
  }
}

/**
 * Validates the dynamic `data` payload against the active template and
 * verifies that the four fixed-field mirrors match the canonical
 * top-level values passed as mutation arguments.
 */
function validateTemplateData(
  template: PolicyTemplate | null,
  data: unknown,
  policyNumber: string,
  status: "active" | "expired" | "canceled" | "pending",
  startDateMs: number,
  endDateMs: number,
) {
  if (!template) {
    if (data == null) return undefined;
    const record = getDataRecord(data);
    if (!record || Object.keys(record).length > 0)
      throw new ConvexError(policyErrors.invalidFieldData);
    return undefined;
  }

  const record = getDataRecord(data);
  if (!record) throw new ConvexError(policyErrors.invalidFieldData);

  const allFields = template.sections.flatMap((section) => section.fields);
  const allowedFieldIds = new Set(allFields.map((field) => field.id));

  for (const key of Object.keys(record)) {
    if (!allowedFieldIds.has(key))
      throw new ConvexError(policyErrors.invalidFieldData);
  }

  for (const field of allFields) {
    const rawValue = record[field.id];
    if (field.required && isEmptyValue(rawValue))
      throw new ConvexError(policyErrors.invalidFieldData);
    validateFieldValue(field, rawValue);
  }

  // Fixed-field mirror checks
  const tplPolicyNumber = record[FIXED_POLICY_NUMBER_FIELD_ID];
  const tplStatus = record[FIXED_STATUS_FIELD_ID];
  const tplStart = parseDateMs(record[FIXED_START_DATE_FIELD_ID]);
  const tplEnd = parseDateMs(record[FIXED_END_DATE_FIELD_ID]);

  if (
    typeof tplPolicyNumber !== "string" ||
    tplPolicyNumber.trim() !== policyNumber.trim() ||
    tplStatus !== status ||
    tplStart === null ||
    tplStart !== startDateMs ||
    tplEnd === null ||
    tplEnd !== endDateMs
  ) {
    throw new ConvexError(policyErrors.invalidFieldData);
  }

  return record;
}

const statusLiteral = v.union(
  v.literal("active"),
  v.literal("expired"),
  v.literal("canceled"),
  v.literal("pending"),
);

export const create = mutation({
  args: {
    policyNumber: v.string(),
    status: statusLiteral,
    startDate: v.number(),
    endDate: v.number(),
    companyId: v.id("companies"),
    clientId: v.optional(v.id("clients")),
    templateId: v.optional(v.id("policyTemplates")),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(policyErrors.unauthorized);

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) throw new ConvexError(policyErrors.permissionDenied);

    const canCreate = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "policies_create",
    });
    if (!canCreate) throw new ConvexError(policyErrors.permissionDenied);

    if (!args.policyNumber.trim())
      throw new ConvexError(policyErrors.policyNumberRequired);
    if (!ALLOWED_STATUSES.has(args.status))
      throw new ConvexError(policyErrors.statusRequired);
    if (!Number.isFinite(args.startDate))
      throw new ConvexError(policyErrors.startDateRequired);
    if (!Number.isFinite(args.endDate))
      throw new ConvexError(policyErrors.endDateRequired);
    if (args.endDate <= args.startDate)
      throw new ConvexError(policyErrors.invalidDateRange);

    if (args.clientId) {
      const client = await ctx.db.get(args.clientId);
      if (!client || client.companyId !== args.companyId)
        throw new ConvexError(policyErrors.clientNotFound);
    }

    const template = args.templateId ? await ctx.db.get(args.templateId) : null;
    if (args.templateId && (!template || template.companyId !== args.companyId))
      throw new ConvexError(policyErrors.templateNotFound);

    const validatedData = validateTemplateData(
      template,
      args.data,
      args.policyNumber,
      args.status,
      args.startDate,
      args.endDate,
    );

    return await ctx.db.insert("policies", {
      policyNumber: args.policyNumber,
      status: args.status,
      startDate: args.startDate,
      endDate: args.endDate,
      companyId: args.companyId,
      clientId: args.clientId,
      templateId: args.templateId,
      data: validatedData,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("policies"),
    policyNumber: v.string(),
    status: statusLiteral,
    startDate: v.number(),
    endDate: v.number(),
    clientId: v.optional(v.id("clients")),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(policyErrors.unauthorized);

    const policy = await ctx.db.get(args.id);
    if (!policy) throw new ConvexError(policyErrors.notFound);

    const member = await populateMember(ctx, userId, policy.companyId);
    if (!member) throw new ConvexError(policyErrors.permissionDenied);

    const canEdit = await checkPermission({
      ctx,
      userId,
      companyId: policy.companyId,
      permission: "policies_edit",
    });
    if (!canEdit) throw new ConvexError(policyErrors.permissionDenied);

    if (!args.policyNumber.trim())
      throw new ConvexError(policyErrors.policyNumberRequired);
    if (!ALLOWED_STATUSES.has(args.status))
      throw new ConvexError(policyErrors.statusRequired);
    if (!Number.isFinite(args.startDate))
      throw new ConvexError(policyErrors.startDateRequired);
    if (!Number.isFinite(args.endDate))
      throw new ConvexError(policyErrors.endDateRequired);
    if (args.endDate <= args.startDate)
      throw new ConvexError(policyErrors.invalidDateRange);

    if (args.clientId) {
      const client = await ctx.db.get(args.clientId);
      if (!client || client.companyId !== policy.companyId)
        throw new ConvexError(policyErrors.clientNotFound);
    }

    const template = policy.templateId
      ? await ctx.db.get(policy.templateId)
      : null;
    if (
      policy.templateId &&
      (!template || template.companyId !== policy.companyId)
    )
      throw new ConvexError(policyErrors.templateNotFound);

    const validatedData = validateTemplateData(
      template,
      args.data,
      args.policyNumber,
      args.status,
      args.startDate,
      args.endDate,
    );

    await ctx.db.patch(args.id, {
      policyNumber: args.policyNumber,
      status: args.status,
      startDate: args.startDate,
      endDate: args.endDate,
      clientId: args.clientId,
      data: validatedData,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(policyErrors.unauthorized);

    const policy = await ctx.db.get(args.id);
    if (!policy) throw new ConvexError(policyErrors.notFound);

    const member = await populateMember(ctx, userId, policy.companyId);
    if (!member) throw new ConvexError(policyErrors.permissionDenied);

    const canDelete = await checkPermission({
      ctx,
      userId,
      companyId: policy.companyId,
      permission: "policies_delete",
    });
    if (!canDelete) throw new ConvexError(policyErrors.permissionDenied);

    // Clean up file/image fields stored in Convex storage
    const template = policy.templateId
      ? await ctx.db.get(policy.templateId)
      : null;
    if (template && policy.data && typeof policy.data === "object") {
      const fileFieldIds = template.sections
        .flatMap((s) => s.fields)
        .filter((f) => f.type === "file" || f.type === "image")
        .map((f) => f.id);
      for (const fieldId of fileFieldIds) {
        const storageId = (policy.data as Record<string, unknown>)[fieldId];
        if (storageId) {
          try {
            await ctx.storage.delete(storageId as string);
          } catch {
            // File may not exist in storage — ignore
          }
        }
      }
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Cancels a policy. Sets status to "canceled" and mirrors into `data`.
 */
export const cancel = mutation({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(policyErrors.unauthorized);

    const policy = await ctx.db.get(args.id);
    if (!policy) throw new ConvexError(policyErrors.notFound);

    const member = await populateMember(ctx, userId, policy.companyId);
    if (!member) throw new ConvexError(policyErrors.permissionDenied);

    const canCancel = await checkPermission({
      ctx,
      userId,
      companyId: policy.companyId,
      permission: "policies_cancel",
    });
    if (!canCancel) throw new ConvexError(policyErrors.permissionDenied);

    if (policy.status === "expired")
      throw new ConvexError(policyErrors.cannotCancelExpired);

    const nextData =
      policy.data && typeof policy.data === "object"
        ? {
            ...(policy.data as Record<string, unknown>),
            [FIXED_STATUS_FIELD_ID]: "canceled",
          }
        : policy.data;

    await ctx.db.patch(args.id, {
      status: "canceled",
      data: nextData,
    });

    return args.id;
  },
});

/**
 * Renews a policy. Creates a new policy linked to the original via
 * `parentPolicyId`. The new policy's start/end dates are provided by the
 * caller (typically prefilled to old endDate → endDate + previous duration).
 * The original policy is marked `isParentPolicy: true`.
 */
export const renew = mutation({
  args: {
    id: v.id("policies"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(policyErrors.unauthorized);

    const policy = await ctx.db.get(args.id);
    if (!policy) throw new ConvexError(policyErrors.notFound);

    const member = await populateMember(ctx, userId, policy.companyId);
    if (!member) throw new ConvexError(policyErrors.permissionDenied);

    const canRenew = await checkPermission({
      ctx,
      userId,
      companyId: policy.companyId,
      permission: "policies_renew",
    });
    if (!canRenew) throw new ConvexError(policyErrors.permissionDenied);

    if (policy.status === "canceled")
      throw new ConvexError(policyErrors.cannotRenewCanceled);
    if (!Number.isFinite(args.startDate))
      throw new ConvexError(policyErrors.startDateRequired);
    if (!Number.isFinite(args.endDate))
      throw new ConvexError(policyErrors.endDateRequired);
    if (args.endDate <= args.startDate)
      throw new ConvexError(policyErrors.invalidDateRange);

    const baseData =
      policy.data && typeof policy.data === "object"
        ? { ...(policy.data as Record<string, unknown>) }
        : {};

    // Mirror the renewed dates and reset status to "active" inside data.
    baseData[FIXED_START_DATE_FIELD_ID] = new Date(
      args.startDate,
    ).toISOString();
    baseData[FIXED_END_DATE_FIELD_ID] = new Date(args.endDate).toISOString();
    baseData[FIXED_STATUS_FIELD_ID] = "active";

    const newId = await ctx.db.insert("policies", {
      policyNumber: policy.policyNumber,
      status: "active",
      startDate: args.startDate,
      endDate: args.endDate,
      companyId: policy.companyId,
      clientId: policy.clientId,
      templateId: policy.templateId,
      data: baseData,
      parentPolicyId: policy._id,
      isParentPolicy: false,
    });

    if (!policy.isParentPolicy) {
      await ctx.db.patch(policy._id, { isParentPolicy: true });
    }

    return newId;
  },
});

export const getByCompany = query({
  args: {
    companyId: v.id("companies"),
    search: v.optional(v.string()),
    status: v.optional(statusLiteral),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { page: [], isDone: true, continueCursor: "" };

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) return { page: [], isDone: true, continueCursor: "" };

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "policies_view",
    });
    if (!canView) return { page: [], isDone: true, continueCursor: "" };

    if (args.search && args.search.trim()) {
      const result = await ctx.db
        .query("policies")
        .withSearchIndex("search_policyNumber", (q) =>
          q
            .search("policyNumber", args.search!)
            .eq("companyId", args.companyId),
        )
        .take(25);
      return { page: result, isDone: true, continueCursor: "" };
    }

    if (args.status) {
      return await ctx.db
        .query("policies")
        .withIndex("companyId_status", (q) =>
          q.eq("companyId", args.companyId).eq("status", args.status!),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("policies")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const policy = await ctx.db.get(args.id);
    if (!policy) return null;

    const member = await populateMember(ctx, userId, policy.companyId);
    if (!member) return null;

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: policy.companyId,
      permission: "policies_view",
    });
    if (!canView) return null;

    const template = policy.templateId
      ? await ctx.db.get(policy.templateId)
      : null;

    if (!template) {
      return { ...policy, resolvedFiles: {}, templateSections: undefined };
    }

    const fileFields = template.sections
      .flatMap((s) => s.fields)
      .filter((f) => f.type === "file" || f.type === "image");

    const resolvedFiles: Record<string, string | null> = {};
    const data = policy.data as Record<string, unknown> | undefined;
    for (const field of fileFields) {
      const storageId = data?.[field.id];
      if (storageId && typeof storageId === "string") {
        resolvedFiles[field.id] = await ctx.storage.getUrl(
          storageId as import("./_generated/dataModel").Id<"_storage">,
        );
      }
    }

    return { ...policy, resolvedFiles, templateSections: template.sections };
  },
});

/**
 * Returns policies whose `endDate` is within `windowDays` from now.
 * Used by the dashboard renewal alerts widget.
 */
export const getDueSoon = query({
  args: {
    companyId: v.id("companies"),
    windowDays: v.optional(v.number()),
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
      permission: "policies_view",
    });
    if (!canView) return [];

    const now = Date.now();
    const windowMs = (args.windowDays ?? 30) * 24 * 60 * 60 * 1000;
    const cutoff = now + windowMs;

    return await ctx.db
      .query("policies")
      .withIndex("companyId_endDate", (q) =>
        q
          .eq("companyId", args.companyId)
          .gte("endDate", now)
          .lte("endDate", cutoff),
      )
      .collect();
  },
});
