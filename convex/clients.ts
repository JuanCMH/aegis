import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkPermission, populateMember } from "./roles";
import { clientErrors } from "./errors/clients";

const FIXED_NAME_FIELD_ID = "field_name";
const FIXED_IDENTIFICATION_FIELD_ID = "field_identificationNumber";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const URL_RE = /^https?:\/\/.+/;

type ClientTemplateField = {
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

type ClientTemplate = {
  _id: unknown;
  companyId: unknown;
  sections: Array<{ fields: ClientTemplateField[] }>;
};

function getDataRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function isEmptyValue(value: unknown) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

function validateFieldValue(field: ClientTemplateField, value: unknown) {
  if (isEmptyValue(value)) {
    return;
  }

  const stringValue = typeof value === "string" ? value.trim() : "";

  if (field.type === "text" || field.type === "textarea") {
    if (typeof value !== "string") {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    if (field.config.minLength && stringValue.length < field.config.minLength) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    if (field.config.maxLength && stringValue.length > field.config.maxLength) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    return;
  }

  if (field.type === "number" || field.type === "currency") {
    const numericValue =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value)
          : Number.NaN;

    if (Number.isNaN(numericValue)) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    if (field.config.minValue != null && numericValue < field.config.minValue) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    if (field.config.maxValue != null && numericValue > field.config.maxValue) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    return;
  }

  if (field.type === "email") {
    if (typeof value !== "string" || !EMAIL_RE.test(stringValue)) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    return;
  }

  if (field.type === "phone") {
    if (typeof value !== "string" || !PHONE_RE.test(stringValue)) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    return;
  }

  if (field.type === "url") {
    if (typeof value !== "string" || !URL_RE.test(stringValue)) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    return;
  }

  if (field.type === "date") {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    return;
  }

  if (field.type === "select") {
    if (typeof value !== "string") {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    const options = field.config.options ?? [];
    if (
      options.length > 0 &&
      !options.some((option) => option.value === value)
    ) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    return;
  }

  if (field.type === "switch") {
    if (typeof value !== "boolean") {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    return;
  }

  if (field.type === "file" || field.type === "image") {
    if (typeof value !== "string") {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
  }
}

function validateTemplateData(
  template: ClientTemplate | null,
  data: unknown,
  name: string,
  identificationNumber: string,
) {
  if (!template) {
    if (data == null) {
      return undefined;
    }

    const record = getDataRecord(data);
    if (!record || Object.keys(record).length > 0) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }

    return undefined;
  }

  const record = getDataRecord(data);
  if (!record) {
    throw new ConvexError(clientErrors.invalidFieldData);
  }

  const allFields = template.sections.flatMap((section) => section.fields);
  const allowedFieldIds = new Set(allFields.map((field) => field.id));

  for (const key of Object.keys(record)) {
    if (!allowedFieldIds.has(key)) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
  }

  for (const field of allFields) {
    const rawValue = record[field.id];
    if (field.required && isEmptyValue(rawValue)) {
      throw new ConvexError(clientErrors.invalidFieldData);
    }
    validateFieldValue(field, rawValue);
  }

  const templateName = record[FIXED_NAME_FIELD_ID];
  const templateIdentification = record[FIXED_IDENTIFICATION_FIELD_ID];
  if (
    typeof templateName !== "string" ||
    templateName.trim() !== name.trim() ||
    typeof templateIdentification !== "string" ||
    templateIdentification.trim() !== identificationNumber.trim()
  ) {
    throw new ConvexError(clientErrors.invalidFieldData);
  }

  return record;
}

export const create = mutation({
  args: {
    name: v.string(),
    identificationNumber: v.string(),
    templateId: v.optional(v.id("clientTemplates")),
    data: v.optional(v.any()),
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    const canCreate = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "clients_create",
    });
    if (!canCreate) throw new ConvexError(clientErrors.permissionDenied);

    if (!args.name.trim()) throw new ConvexError(clientErrors.nameRequired);
    if (!args.identificationNumber.trim())
      throw new ConvexError(clientErrors.identificationRequired);

    const template = args.templateId ? await ctx.db.get(args.templateId) : null;
    if (
      args.templateId &&
      (!template || template.companyId !== args.companyId)
    ) {
      throw new ConvexError(clientErrors.templateNotFound);
    }

    const validatedData = validateTemplateData(
      template,
      args.data,
      args.name,
      args.identificationNumber,
    );

    return await ctx.db.insert("clients", {
      name: args.name,
      identificationNumber: args.identificationNumber,
      templateId: args.templateId,
      data: validatedData,
      companyId: args.companyId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.string(),
    identificationNumber: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const client = await ctx.db.get(args.id);
    if (!client) throw new ConvexError(clientErrors.notFound);

    const member = await populateMember(ctx, userId, client.companyId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    const canEdit = await checkPermission({
      ctx,
      userId,
      companyId: client.companyId,
      permission: "clients_edit",
    });
    if (!canEdit) throw new ConvexError(clientErrors.permissionDenied);

    if (!args.name.trim()) throw new ConvexError(clientErrors.nameRequired);
    if (!args.identificationNumber.trim())
      throw new ConvexError(clientErrors.identificationRequired);

    const template = client.templateId
      ? await ctx.db.get(client.templateId)
      : null;
    if (
      client.templateId &&
      (!template || template.companyId !== client.companyId)
    ) {
      throw new ConvexError(clientErrors.templateNotFound);
    }

    const validatedData = validateTemplateData(
      template,
      args.data,
      args.name,
      args.identificationNumber,
    );

    await ctx.db.patch(args.id, {
      name: args.name,
      identificationNumber: args.identificationNumber,
      data: validatedData,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const client = await ctx.db.get(args.id);
    if (!client) throw new ConvexError(clientErrors.notFound);

    const member = await populateMember(ctx, userId, client.companyId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    const canDelete = await checkPermission({
      ctx,
      userId,
      companyId: client.companyId,
      permission: "clients_delete",
    });
    if (!canDelete) throw new ConvexError(clientErrors.permissionDenied);

    // Clean up file/image fields stored in Convex storage
    const template = client.templateId
      ? await ctx.db.get(client.templateId)
      : null;
    if (template && client.data && typeof client.data === "object") {
      const fileFieldIds = template.sections
        .flatMap((s) => s.fields)
        .filter((f) => f.type === "file" || f.type === "image")
        .map((f) => f.id);
      for (const fieldId of fileFieldIds) {
        const storageId = client.data[fieldId];
        if (storageId) {
          try {
            await ctx.storage.delete(storageId);
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

export const getByCompany = query({
  args: {
    companyId: v.id("companies"),
    search: v.optional(v.string()),
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
      permission: "clients_view",
    });
    if (!canView) return { page: [], isDone: true, continueCursor: "" };

    // If search term provided, use search indexes
    if (args.search && args.search.trim()) {
      const byName = await ctx.db
        .query("clients")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.search!).eq("companyId", args.companyId),
        )
        .take(25);

      const byIdNumber = await ctx.db
        .query("clients")
        .withSearchIndex("search_identificationNumber", (q) =>
          q
            .search("identificationNumber", args.search!)
            .eq("companyId", args.companyId),
        )
        .take(25);

      // Merge and deduplicate
      const seen = new Set(byName.map((r) => r._id));
      const merged = [...byName];
      for (const client of byIdNumber) {
        if (!seen.has(client._id)) {
          merged.push(client);
          seen.add(client._id);
        }
      }

      return { page: merged.slice(0, 25), isDone: true, continueCursor: "" };
    }

    // No search: paginated list
    return await ctx.db
      .query("clients")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const client = await ctx.db.get(args.id);
    if (!client) return null;

    const member = await populateMember(ctx, userId, client.companyId);
    if (!member) return null;

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: client.companyId,
      permission: "clients_view",
    });
    if (!canView) return null;

    // Resolve file/image URLs from storage
    const template = client.templateId
      ? await ctx.db.get(client.templateId)
      : null;
    if (!template) {
      return { ...client, resolvedFiles: {}, templateSections: undefined };
    }

    const fileFields = template.sections
      .flatMap((s) => s.fields)
      .filter((f) => f.type === "file" || f.type === "image");

    const resolvedFiles: Record<string, string | null> = {};
    for (const field of fileFields) {
      const storageId = client.data?.[field.id];
      if (storageId) {
        resolvedFiles[field.id] = await ctx.storage.getUrl(storageId);
      }
    }

    return { ...client, resolvedFiles, templateSections: template.sections };
  },
});
