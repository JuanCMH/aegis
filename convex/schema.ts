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
    companies: v.optional(v.number()),
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
    companyId: v.optional(v.id("companies")),
    affectedEntityType: v.optional(
      v.union(v.literal("company"), v.literal("member"), v.literal("role")),
    ),
    affectedEntityId: v.optional(v.string()),
  })
    .index("companyId", ["companyId"])
    .index("userId", ["userId"]),
  companies: defineTable({
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
    companyId: v.id("companies"),
    role: v.union(v.literal("admin"), v.literal("member")),
    customRoleId: v.optional(v.id("roles")),
  })
    .index("userId", ["userId"])
    .index("customRoleId", ["customRoleId"])
    .index("companyId", ["companyId"])
    .index("companyId_userId", ["companyId", "userId"]),
  roles: defineTable({
    name: v.string(),
    companyId: v.id("companies"),
    ...permissionsSchema,
  }).index("companyId", ["companyId"]),
  invitations: defineTable({
    companyId: v.id("companies"),
    email: v.string(),
    roleType: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("custom"),
    ),
    customRoleId: v.optional(v.id("roles")),
    token: v.string(),
    invitedBy: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("revoked"),
      v.literal("expired"),
    ),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    acceptedBy: v.optional(v.id("users")),
  })
    .index("token", ["token"])
    .index("companyId", ["companyId"])
    .index("companyId_email", ["companyId", "email"])
    .index("companyId_status", ["companyId", "status"]),
  clientTemplates: defineTable({
    companyId: v.id("companies"),
    sections: v.array(templateSection),
  }).index("companyId", ["companyId"]),
  clients: defineTable({
    name: v.string(),
    identificationNumber: v.string(),
    templateId: v.optional(v.id("clientTemplates")),
    data: v.optional(v.any()),
    companyId: v.id("companies"),
  })
    .index("companyId", ["companyId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["companyId"],
    })
    .searchIndex("search_identificationNumber", {
      searchField: "identificationNumber",
      filterFields: ["companyId"],
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
    companyId: v.id("companies"),
  }).index("clientId", ["clientId"]),
  bonds: defineTable({
    name: v.string(),
    description: v.string(),
    companyId: v.id("companies"),
  }).index("companyId", ["companyId"]),
  insurers: defineTable({
    name: v.string(),
    taxId: v.optional(v.string()),
    website: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    companyId: v.id("companies"),
  })
    .index("companyId", ["companyId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["companyId"],
    }),
  linesOfBusiness: defineTable({
    name: v.string(),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    /** Default commission percentage applied to new policies in this line. */
    defaultCommission: v.optional(v.number()),
    isActive: v.boolean(),
    companyId: v.id("companies"),
  })
    .index("companyId", ["companyId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["companyId"],
    }),
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
    companyId: v.id("companies"),
  }).index("companyId", ["companyId"]),
  quoteBonds: defineTable({
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    expiryDate: v.optional(v.number()),
    percentage: v.number(),
    insuredValue: v.number(),
    rate: v.number(),
    companyId: v.id("companies"),
    quoteId: v.id("quotes"),
    bondId: v.optional(v.id("bonds")),
  }).index("quoteId", ["quoteId"]),
});

export default schema;
