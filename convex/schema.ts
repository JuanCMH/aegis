import { v } from "convex/values";
import { customColors } from "./lib/colors";
import { authTables } from "@convex-dev/auth/server";
import { permissionsSchema } from "./lib/permissions";
import { defineSchema, defineTable } from "convex/server";

// --- Client Template Field Validators ---
const fieldType = v.union(
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
);

const fieldSize = v.union(
  v.literal("small"),
  v.literal("medium"),
  v.literal("large"),
  v.literal("full"),
);

const templateField = v.object({
  id: v.string(),
  type: fieldType,
  label: v.string(),
  placeholder: v.optional(v.string()),
  required: v.boolean(),
  size: fieldSize,
  sizeOverride: v.optional(
    v.object({
      sm: v.optional(v.number()),
      md: v.optional(v.number()),
      lg: v.optional(v.number()),
    }),
  ),
  showInTable: v.boolean(),
  isFixed: v.boolean(),
  config: v.object({
    minLength: v.optional(v.number()),
    maxLength: v.optional(v.number()),
    minValue: v.optional(v.number()),
    maxValue: v.optional(v.number()),
    options: v.optional(
      v.array(v.object({ label: v.string(), value: v.string() })),
    ),
    acceptedFormats: v.optional(v.array(v.string())),
    maxFileSize: v.optional(v.number()),
  }),
});

const templateSection = v.object({
  id: v.string(),
  label: v.string(),
  order: v.number(),
  fields: v.array(templateField),
});

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    mainImage: v.optional(v.id("_storage")),
    email: v.optional(v.string()),
    workspaces: v.optional(v.number()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),
  logs: defineTable({
    description: v.string(),
    userName: v.string(),
    userId: v.optional(v.id("users")),
    type: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("info"),
    ),
    workspaceId: v.optional(v.id("workspaces")),
    affectedEntityType: v.optional(
      v.union(v.literal("workspace"), v.literal("member"), v.literal("role")),
    ),
    affectedEntityId: v.optional(v.string()),
  })
    .index("workspaceId", ["workspaceId"])
    .index("userId", ["userId"]),
  workspaces: defineTable({
    name: v.string(),
    joinCode: v.string(),
    userId: v.id("users"),
    active: v.optional(v.boolean()),
    logo: v.optional(v.id("_storage")),
    primaryColor: v.optional(v.union(...customColors)),
    secondaryColor: v.optional(v.union(...customColors)),
  })
    .index("userId", ["userId"])
    .index("joinCode", ["joinCode"]),
  members: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    role: v.union(v.literal("admin"), v.literal("member")),
    customRoleId: v.optional(v.id("roles")),
  })
    .index("userId", ["userId"])
    .index("customRoleId", ["customRoleId"])
    .index("workspaceId", ["workspaceId"])
    .index("workspaceId_userId", ["workspaceId", "userId"]),
  roles: defineTable({
    name: v.string(),
    workspaceId: v.id("workspaces"),
    ...permissionsSchema,
  }).index("workspaceId", ["workspaceId"]),
  clientTemplates: defineTable({
    workspaceId: v.id("workspaces"),
    sections: v.array(templateSection),
  }).index("workspaceId", ["workspaceId"]),
  clients: defineTable({
    name: v.string(),
    identificationNumber: v.string(),
    templateId: v.id("clientTemplates"),
    data: v.any(),
    workspaceId: v.id("workspaces"),
  })
    .index("workspaceId", ["workspaceId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["workspaceId"],
    })
    .searchIndex("search_identificationNumber", {
      searchField: "identificationNumber",
      filterFields: ["workspaceId"],
    }),
  policies: defineTable({
    insuredName: v.string(),
    insuredIdNumber: v.string(),
    beneficiaryName: v.string(),
    beneficiaryIdNumber: v.string(),
    policyHolderName: v.string(),
    policyHolderIdNumber: v.string(),
    policyNumber: v.string(),
    policyType: v.string(),
    riskDescription: v.string(),
    issueDate: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    premiumAmount: v.number(),
    issuanceExpenses: v.number(),
    taxes: v.number(),
    totalAmount: v.number(),
    observations: v.string(),
    agentName: v.string(),
    clientId: v.id("clients"),
    insurer: v.string(),
    lineOfBusiness: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("canceled"),
      v.literal("pending"),
    ),
    isRenewal: v.boolean(),
    isRenewable: v.boolean(),
    commissionPercentage: v.number(),
    participation: v.number(),
    totalCommission: v.number(),

    // not necesary for now
    isParentPolicy: v.boolean(),
    parentPolicyId: v.optional(v.id("policies")),
    workspaceId: v.id("workspaces"),
  }).index("clientId", ["clientId"]),
  bonds: defineTable({
    name: v.string(),
    description: v.string(),
    workspaceId: v.id("workspaces"),
  }).index("workspaceId", ["workspaceId"]),
  quotes: defineTable({
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
    quoteType: v.union(v.literal("bidBond"), v.literal("performanceBonds")),
    documentId: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
  }).index("workspaceId", ["workspaceId"]),
  quoteBonds: defineTable({
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    expiryDate: v.optional(v.number()),
    percentage: v.number(),
    insuredValue: v.number(),
    rate: v.number(),
    workspaceId: v.id("workspaces"),
    quoteId: v.id("quotes"),
    bondId: v.optional(v.id("bonds")),
  }).index("quoteId", ["quoteId"]),
});

export default schema;
