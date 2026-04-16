import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { populateMember } from "./roles";
import { clientErrors } from "./errors/clients";

export const create = mutation({
  args: {
    name: v.string(),
    identificationNumber: v.string(),
    templateId: v.id("clientTemplates"),
    data: v.any(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(clientErrors.unauthorized);

    const member = await populateMember(ctx, userId, args.workspaceId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    if (!args.name.trim()) throw new ConvexError(clientErrors.nameRequired);
    if (!args.identificationNumber.trim())
      throw new ConvexError(clientErrors.identificationRequired);

    return await ctx.db.insert("clients", {
      name: args.name,
      identificationNumber: args.identificationNumber,
      templateId: args.templateId,
      data: args.data,
      workspaceId: args.workspaceId,
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

    const member = await populateMember(ctx, userId, client.workspaceId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    if (!args.name.trim()) throw new ConvexError(clientErrors.nameRequired);
    if (!args.identificationNumber.trim())
      throw new ConvexError(clientErrors.identificationRequired);

    await ctx.db.patch(args.id, {
      name: args.name,
      identificationNumber: args.identificationNumber,
      data: args.data,
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

    const member = await populateMember(ctx, userId, client.workspaceId);
    if (!member) throw new ConvexError(clientErrors.permissionDenied);

    // Clean up file/image fields stored in Convex storage
    const template = await ctx.db.get(client.templateId);
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

export const getByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null)
      return { page: [], isDone: true, continueCursor: "" };

    const member = await populateMember(ctx, userId, args.workspaceId);
    if (!member) return { page: [], isDone: true, continueCursor: "" };

    // If search term provided, use search indexes
    if (args.search && args.search.trim()) {
      const byName = await ctx.db
        .query("clients")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.search!).eq("workspaceId", args.workspaceId),
        )
        .take(25);

      const byIdNumber = await ctx.db
        .query("clients")
        .withSearchIndex("search_identificationNumber", (q) =>
          q
            .search("identificationNumber", args.search!)
            .eq("workspaceId", args.workspaceId),
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
      .withIndex("workspaceId", (q) => q.eq("workspaceId", args.workspaceId))
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

    const member = await populateMember(ctx, userId, client.workspaceId);
    if (!member) return null;

    // Resolve file/image URLs from storage
    const template = await ctx.db.get(client.templateId);
    if (!template) return { ...client, resolvedFiles: {} };

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

    return { ...client, resolvedFiles };
  },
});
