import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import quoteAgent from "./agents";
import { api } from "./_generated/api";
import { checkPermission, populateMember } from "./roles";
import { action } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import type {
  MutationCtx,
  QueryCtx,
  DatabaseReader,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { quoteErrors } from "./errors/quotes";
import { buildPolicyDataFromQuote } from "./lib/quoteToPolicy";

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

const quoteStatusLiteral = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("accepted"),
  v.literal("rejected"),
  v.literal("expired"),
  v.literal("converted"),
);

const quoteTypeLiteral = v.union(
  v.literal("bidBond"),
  v.literal("performanceBonds"),
);

const quoteBondInput = v.object({
  name: v.string(),
  startDate: v.number(),
  endDate: v.number(),
  expiryDate: v.optional(v.number()),
  percentage: v.number(),
  insuredValue: v.number(),
  rate: v.number(),
  bondId: v.optional(v.id("bonds")),
});

type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getStatus = (quote: Doc<"quotes">): QuoteStatus => quote.status ?? "draft";

const isBondReadyForSending = (
  bond: { percentage: number; insuredValue: number; rate: number },
): boolean =>
  bond.percentage > 0 && bond.insuredValue > 0 && bond.rate > 0;

const assertBondsReadyToSend = (
  bonds: ReadonlyArray<{
    percentage: number;
    insuredValue: number;
    rate: number;
  }>,
): void => {
  if (bonds.length === 0) {
    throw new ConvexError(quoteErrors.bondsRequiredToSend);
  }
  if (!bonds.every(isBondReadyForSending)) {
    throw new ConvexError(quoteErrors.bondsRequiredToSend);
  }
};

/**
 * Allowed status transitions. `converted` is terminal and only set via
 * `convertToPolicy`.
 */
const ALLOWED_TRANSITIONS: Record<QuoteStatus, ReadonlySet<QuoteStatus>> = {
  draft: new Set(["sent"]),
  sent: new Set(["draft", "accepted", "rejected", "expired"]),
  accepted: new Set(["sent"]),
  rejected: new Set(["draft"]),
  expired: new Set(["draft"]),
  converted: new Set(),
};

const isTransitionAllowed = (from: QuoteStatus, to: QuoteStatus): boolean =>
  ALLOWED_TRANSITIONS[from].has(to);

/**
 * Build per-status timestamp patch. Only sets the timestamp the first time the
 * quote enters that status; clearing happens elsewhere.
 */
const timestampPatchForStatus = (
  status: QuoteStatus,
  current: Doc<"quotes">,
): Partial<Doc<"quotes">> => {
  const now = Date.now();
  switch (status) {
    case "sent":
      return current.sentAt ? {} : { sentAt: now };
    case "accepted":
      return current.acceptedAt ? {} : { acceptedAt: now };
    case "rejected":
      return current.rejectedAt ? {} : { rejectedAt: now };
    default:
      return {};
  }
};

/**
 * Generate the next `quoteNumber` (`COT-YYYY-NNNN`) for a company.
 *
 * Strategy: count existing quotes for the company in the current year (via
 * `_creationTime`) and append `count + 1` zero-padded. Not strictly atomic but
 * good enough for an internal sequence; collisions are unlikely and caller can
 * still override `quoteNumber` manually.
 */
async function generateQuoteNumber(
  db: DatabaseReader,
  companyId: Id<"companies">,
): Promise<string> {
  const now = new Date();
  const year = now.getUTCFullYear();
  const yearStart = Date.UTC(year, 0, 1);
  const yearEnd = Date.UTC(year + 1, 0, 1);

  const quotesThisYear = await db
    .query("quotes")
    .withIndex("companyId", (q) => q.eq("companyId", companyId))
    .filter((q) =>
      q.and(
        q.gte(q.field("_creationTime"), yearStart),
        q.lt(q.field("_creationTime"), yearEnd),
      ),
    )
    .collect();

  const next = quotesThisYear.length + 1;
  return `COT-${year}-${String(next).padStart(4, "0")}`;
}

async function ensureMemberAndPermission(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  companyId: Id<"companies">,
  permission: Parameters<typeof checkPermission>[0]["permission"],
): Promise<void> {
  const member = await populateMember(ctx, userId, companyId);
  if (!member) throw new ConvexError(quoteErrors.permissionDenied);

  const allowed = await checkPermission({
    ctx,
    userId,
    companyId,
    permission,
  });
  if (!allowed) throw new ConvexError(quoteErrors.permissionDenied);
}

async function attachDocumentUrl<T extends Doc<"quotes">>(
  ctx: QueryCtx,
  quote: T,
): Promise<T & { documentUrl: string | null }> {
  const documentUrl = quote.documentId
    ? await ctx.storage.getUrl(quote.documentId)
    : null;
  return { ...quote, documentUrl };
}

// ---------------------------------------------------------------------------
// AI extraction action
// ---------------------------------------------------------------------------

export const getQuoteFromDoc = action({
  args: {
    companyId: v.id("companies"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(quoteErrors.unauthorized);

    const allowed = await ctx.runQuery(api.roles.hasPermission, {
      companyId: args.companyId,
      permission: "quotes_useAI",
    });
    if (!allowed) throw new ConvexError(quoteErrors.permissionDenied);

    const { thread } = await quoteAgent.createThread(ctx);
    const result = await thread.generateText({ prompt: args.prompt });

    return result.text;
  },
});

// ---------------------------------------------------------------------------
// Mutations: create / update / setStatus / remove / convertToPolicy
// ---------------------------------------------------------------------------

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    contractor: v.string(),
    contractorId: v.string(),
    contractee: v.string(),
    contracteeId: v.string(),
    contractType: v.string(),
    contractValue: v.number(),
    contractStart: v.number(),
    contractEnd: v.number(),
    expenses: v.number(),
    agreement: v.string(),
    calculateExpensesTaxes: v.boolean(),
    quoteType: quoteTypeLiteral,
    documentId: v.optional(v.id("_storage")),
    quoteBonds: v.array(quoteBondInput),
    status: v.optional(quoteStatusLiteral),
    clientId: v.optional(v.id("clients")),
    notes: v.optional(v.string()),
    quoteNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(quoteErrors.unauthorized);

    const company = await ctx.db.get(args.companyId);
    if (!company) throw new ConvexError(quoteErrors.companyNotFound);

    await ensureMemberAndPermission(
      ctx,
      userId,
      args.companyId,
      "quotes_create",
    );

    if (args.contractValue <= 0)
      throw new ConvexError(quoteErrors.invalidContractValue);
    if (args.contractStart >= args.contractEnd)
      throw new ConvexError(quoteErrors.invalidContractDates);

    const status: QuoteStatus = args.status ?? "draft";

    // Drafts may have no bonds yet; non-draft creates require ready bonds.
    if (status === "draft") {
      // No bond validation; allow empty array.
    } else {
      assertBondsReadyToSend(args.quoteBonds);
    }

    if (args.clientId) {
      const client = await ctx.db.get(args.clientId);
      if (!client || client.companyId !== args.companyId) {
        throw new ConvexError(quoteErrors.clientNotFound);
      }
    }

    const quoteNumber =
      args.quoteNumber ??
      (await generateQuoteNumber(ctx.db, args.companyId));

    const now = Date.now();
    const quoteId = await ctx.db.insert("quotes", {
      contractor: args.contractor,
      contractorId: args.contractorId,
      contractee: args.contractee,
      contracteeId: args.contracteeId,
      contractType: args.contractType,
      contractValue: args.contractValue,
      contractStart: args.contractStart,
      contractEnd: args.contractEnd,
      expenses: args.expenses,
      agreement: args.agreement,
      calculateExpensesTaxes: args.calculateExpensesTaxes,
      quoteType: args.quoteType,
      documentId: args.documentId,
      companyId: args.companyId,
      status,
      quoteNumber,
      clientId: args.clientId,
      notes: args.notes,
      sentAt: status === "sent" ? now : undefined,
    });

    for (const qb of args.quoteBonds) {
      await ctx.db.insert("quoteBonds", {
        name: qb.name,
        startDate: qb.startDate,
        endDate: qb.endDate,
        expiryDate: qb.expiryDate,
        percentage: qb.percentage,
        insuredValue: qb.insuredValue,
        rate: qb.rate,
        companyId: args.companyId,
        quoteId,
        bondId: qb.bondId,
      });
    }

    return quoteId;
  },
});

export const update = mutation({
  args: {
    id: v.id("quotes"),
    contractor: v.string(),
    contractorId: v.string(),
    contractee: v.string(),
    contracteeId: v.string(),
    contractType: v.string(),
    contractValue: v.number(),
    contractStart: v.number(),
    contractEnd: v.number(),
    expenses: v.number(),
    agreement: v.string(),
    calculateExpensesTaxes: v.boolean(),
    quoteType: quoteTypeLiteral,
    documentId: v.optional(v.id("_storage")),
    quoteBonds: v.array(quoteBondInput),
    clientId: v.optional(v.id("clients")),
    notes: v.optional(v.string()),
    quoteNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(quoteErrors.unauthorized);

    if (args.contractValue <= 0)
      throw new ConvexError(quoteErrors.invalidContractValue);
    if (args.contractStart >= args.contractEnd)
      throw new ConvexError(quoteErrors.invalidContractDates);

    const quote = await ctx.db.get(args.id);
    if (!quote) throw new ConvexError(quoteErrors.notFound);

    if (getStatus(quote) === "converted")
      throw new ConvexError(quoteErrors.alreadyConverted);

    await ensureMemberAndPermission(
      ctx,
      userId,
      quote.companyId,
      "quotes_edit",
    );

    // For non-draft quotes, bonds must remain valid.
    if (getStatus(quote) !== "draft") {
      assertBondsReadyToSend(args.quoteBonds);
    }

    if (args.clientId) {
      const client = await ctx.db.get(args.clientId);
      if (!client || client.companyId !== quote.companyId) {
        throw new ConvexError(quoteErrors.clientNotFound);
      }
    }

    // Replace document file when explicitly changed.
    if (
      args.documentId !== undefined &&
      args.documentId !== quote.documentId &&
      quote.documentId
    ) {
      await ctx.storage.delete(quote.documentId);
    }

    await ctx.db.patch(args.id, {
      contractor: args.contractor,
      contractorId: args.contractorId,
      contractee: args.contractee,
      contracteeId: args.contracteeId,
      contractType: args.contractType,
      contractValue: args.contractValue,
      contractStart: args.contractStart,
      contractEnd: args.contractEnd,
      expenses: args.expenses,
      agreement: args.agreement,
      calculateExpensesTaxes: args.calculateExpensesTaxes,
      quoteType: args.quoteType,
      ...(args.documentId !== undefined ? { documentId: args.documentId } : {}),
      clientId: args.clientId,
      notes: args.notes,
      ...(args.quoteNumber !== undefined
        ? { quoteNumber: args.quoteNumber }
        : {}),
    });

    // Replace quoteBonds (delete + insert).
    const existing = await ctx.db
      .query("quoteBonds")
      .withIndex("quoteId", (q) => q.eq("quoteId", args.id))
      .collect();
    for (const eb of existing) {
      await ctx.db.delete(eb._id);
    }
    for (const qb of args.quoteBonds) {
      await ctx.db.insert("quoteBonds", {
        name: qb.name,
        startDate: qb.startDate,
        endDate: qb.endDate,
        expiryDate: qb.expiryDate,
        percentage: qb.percentage,
        insuredValue: qb.insuredValue,
        rate: qb.rate,
        companyId: quote.companyId,
        quoteId: args.id,
        bondId: qb.bondId,
      });
    }

    return args.id;
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("quotes"),
    status: quoteStatusLiteral,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(quoteErrors.unauthorized);

    const quote = await ctx.db.get(args.id);
    if (!quote) throw new ConvexError(quoteErrors.notFound);

    await ensureMemberAndPermission(
      ctx,
      userId,
      quote.companyId,
      "quotes_edit",
    );

    const from = getStatus(quote);
    if (from === args.status) return args.id;

    if (!isTransitionAllowed(from, args.status)) {
      throw new ConvexError(quoteErrors.invalidStatusTransition);
    }

    if (args.status === "sent") {
      const bonds = await ctx.db
        .query("quoteBonds")
        .withIndex("quoteId", (q) => q.eq("quoteId", args.id))
        .collect();
      assertBondsReadyToSend(bonds);
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      ...timestampPatchForStatus(args.status, quote),
    });

    return args.id;
  },
});

export const convertToPolicy = mutation({
  args: {
    quoteId: v.id("quotes"),
    policyNumber: v.string(),
    templateId: v.optional(v.id("policyTemplates")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(quoteErrors.unauthorized);

    const quote = await ctx.db.get(args.quoteId);
    if (!quote) throw new ConvexError(quoteErrors.notFound);

    // Both edit on quote AND create on policies are required.
    await ensureMemberAndPermission(
      ctx,
      userId,
      quote.companyId,
      "quotes_convertToPolicy",
    );
    await ensureMemberAndPermission(
      ctx,
      userId,
      quote.companyId,
      "policies_create",
    );

    if (getStatus(quote) !== "accepted") {
      throw new ConvexError(quoteErrors.invalidStatusTransition);
    }
    if (quote.policyId) {
      throw new ConvexError(quoteErrors.alreadyConverted);
    }

    // Resolve template (provided id or company's first template).
    const template = args.templateId
      ? await ctx.db.get(args.templateId)
      : (
          await ctx.db
            .query("policyTemplates")
            .withIndex("companyId", (q) => q.eq("companyId", quote.companyId))
            .first()
        );

    if (!template || template.companyId !== quote.companyId) {
      throw new ConvexError(quoteErrors.policyTemplateMissing);
    }

    if (!args.policyNumber.trim()) {
      throw new ConvexError(quoteErrors.invalidStatusTransition);
    }

    const data = buildPolicyDataFromQuote(quote, template.sections);

    const policyId = await ctx.db.insert("policies", {
      policyNumber: args.policyNumber.trim(),
      status: "active",
      startDate: quote.contractStart,
      endDate: quote.contractEnd,
      companyId: quote.companyId,
      templateId: template._id,
      data,
      clientId: quote.clientId,
    });

    const now = Date.now();
    await ctx.db.patch(args.quoteId, {
      policyId,
      status: "converted",
      convertedAt: now,
    });

    return policyId;
  },
});

export const remove = mutation({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(quoteErrors.unauthorized);

    const quote = await ctx.db.get(args.id);
    if (!quote) throw new ConvexError(quoteErrors.notFound);

    await ensureMemberAndPermission(
      ctx,
      userId,
      quote.companyId,
      "quotes_delete",
    );

    const bonds = await ctx.db
      .query("quoteBonds")
      .withIndex("quoteId", (q) => q.eq("quoteId", args.id))
      .collect();
    for (const b of bonds) {
      await ctx.db.delete(b._id);
    }

    if (quote.documentId) {
      await ctx.storage.delete(quote.documentId);
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});

// ---------------------------------------------------------------------------
// Queries: searchByCompany / getByClient / getById / getCompanyStats
// ---------------------------------------------------------------------------

const EMPTY_PAGE = { page: [], isDone: true, continueCursor: "" } as const;

export const searchByCompany = query({
  args: {
    companyId: v.id("companies"),
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
    searchField: v.optional(
      v.union(v.literal("contractor"), v.literal("contractee")),
    ),
    status: v.optional(quoteStatusLiteral),
    clientId: v.optional(v.id("clients")),
    quoteType: v.optional(quoteTypeLiteral),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return EMPTY_PAGE;

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) return EMPTY_PAGE;

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "quotes_view",
    });
    if (!canView) return EMPTY_PAGE;

    const term = args.searchTerm?.trim();

    let result;

    if (term) {
      const field = args.searchField ?? "contractor";
      const indexName =
        field === "contractee" ? "search_contractee" : "search_contractor";

      result = await ctx.db
        .query("quotes")
        .withSearchIndex(indexName, (q) => {
          let qq = q.search(field, term).eq("companyId", args.companyId);
          if (args.status) qq = qq.eq("status", args.status);
          return qq;
        })
        .paginate(args.paginationOpts);
    } else if (args.clientId) {
      result = await ctx.db
        .query("quotes")
        .withIndex("clientId", (q) => q.eq("clientId", args.clientId))
        .filter((q) => q.eq(q.field("companyId"), args.companyId))
        .order("desc")
        .paginate(args.paginationOpts);
    } else if (args.status) {
      result = await ctx.db
        .query("quotes")
        .withIndex("companyId_status", (q) =>
          q.eq("companyId", args.companyId).eq("status", args.status),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db
        .query("quotes")
        .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // Post-filter (in-memory on the page) by quoteType / dateFrom / dateTo.
    const filtered = result.page.filter((q) => {
      if (args.quoteType && q.quoteType !== args.quoteType) return false;
      if (args.dateFrom !== undefined && q._creationTime < args.dateFrom)
        return false;
      if (args.dateTo !== undefined && q._creationTime >= args.dateTo)
        return false;
      return true;
    });

    const page = await Promise.all(
      filtered.map((q) => attachDocumentUrl(ctx, q)),
    );

    return {
      page,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const getByClient = query({
  args: {
    clientId: v.id("clients"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return EMPTY_PAGE;

    const client = await ctx.db.get(args.clientId);
    if (!client) return EMPTY_PAGE;

    const member = await populateMember(ctx, userId, client.companyId);
    if (!member) return EMPTY_PAGE;

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: client.companyId,
      permission: "quotes_view",
    });
    if (!canView) return EMPTY_PAGE;

    const result = await ctx.db
      .query("quotes")
      .withIndex("clientId", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      result.page.map((q) => attachDocumentUrl(ctx, q)),
    );

    return {
      page,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const getById = query({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const quote = await ctx.db.get(args.id);
    if (!quote) return null;

    const member = await populateMember(ctx, userId, quote.companyId);
    if (!member) return null;

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: quote.companyId,
      permission: "quotes_view",
    });
    if (!canView) return null;

    const quoteBonds = await ctx.db
      .query("quoteBonds")
      .withIndex("quoteId", (q) => q.eq("quoteId", args.id))
      .collect();

    const documentUrl = quote.documentId
      ? await ctx.storage.getUrl(quote.documentId)
      : null;

    const client = quote.clientId ? await ctx.db.get(quote.clientId) : null;
    const policy = quote.policyId ? await ctx.db.get(quote.policyId) : null;

    return { ...quote, quoteBonds, documentUrl, client, policy };
  },
});

/**
 * @deprecated Temporary shim retained during Phase 1 so the existing list page
 * keeps working. Phase 4 replaces the page with `searchByCompany` and removes
 * this query.
 */
export const getByCompany = query({
  args: {
    companyId: v.id("companies"),
    month: v.string(),
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
      permission: "quotes_view",
    });
    if (!canView) return [];

    const [yearStr, monthStr] = args.month.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const start = Date.UTC(year, month - 1, 1);
    const end = Date.UTC(year, month, 1);

    const all = await ctx.db
      .query("quotes")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .collect();

    const inMonth = all.filter(
      (q) => q._creationTime >= start && q._creationTime < end,
    );

    return Promise.all(inMonth.map((q) => attachDocumentUrl(ctx, q)));
  },
});

export const getCompanyStats = query({
  args: {
    companyId: v.id("companies"),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const member = await populateMember(ctx, userId, args.companyId);
    if (!member) return null;

    const canView = await checkPermission({
      ctx,
      userId,
      companyId: args.companyId,
      permission: "quotes_view",
    });
    if (!canView) return null;

    const all = await ctx.db
      .query("quotes")
      .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
      .collect();

    const inRange = all.filter((q) => {
      if (args.dateFrom !== undefined && q._creationTime < args.dateFrom)
        return false;
      if (args.dateTo !== undefined && q._creationTime >= args.dateTo)
        return false;
      return true;
    });

    const byStatus: Record<QuoteStatus, number> = {
      draft: 0,
      sent: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
      converted: 0,
    };

    let totalContractValue = 0;
    for (const q of inRange) {
      byStatus[getStatus(q)] += 1;
      totalContractValue += q.contractValue ?? 0;
    }

    const total = inRange.length;
    const convertedCount = byStatus.converted;
    const conversionRate = total > 0 ? convertedCount / total : 0;

    return {
      total,
      totalContractValue,
      byStatus,
      convertedCount,
      conversionRate,
    };
  },
});
