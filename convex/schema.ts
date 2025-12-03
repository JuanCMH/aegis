import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
	workspaces: defineTable({
		name: v.string(),
		userId: v.id("users"),
		joinCode: v.string(),
		active: v.optional(v.boolean()),
	})
		.index("userId", ["userId"])
		.index("joinCode", ["joinCode"]),
});

export default schema;
