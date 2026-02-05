import { v } from "convex/values";
import { customColors } from "./lib/colors";
import { authTables } from "@convex-dev/auth/server";
import { permissionsSchema } from "./lib/permissions";
import { defineSchema, defineTable } from "convex/server";

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
  clients: defineTable({
    name: v.string(),
    lastName: v.string(),
    identificationType: v.union(
      v.literal("NIT"),
      v.literal("CC"),
      v.literal("CE"),
      v.literal("TI"),
    ),
    identificationNumber: v.string(),
    maritalStatus: v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("divorced"),
      v.literal("widowed"),
    ),
    birthDate: v.number(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    city: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    profession: v.string(),
    workspaceId: v.id("workspaces"),
  }).index("workspaceId", ["workspaceId"]),
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
