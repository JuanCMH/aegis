import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { permissionsSchema } from "./lib/permissions";

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
    userId: v.id("users"),
    joinCode: v.string(),
    active: v.optional(v.boolean()),
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
});

export default schema;
