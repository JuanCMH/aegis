// import { getAuthUserId } from "@convex-dev/auth/server";
// import { ConvexError, v } from "convex/values";
// import { Id } from "./_generated/dataModel";
// import { mutation, query } from "./_generated/server";
// import { logsErrors } from "./lib/error_messages";

// export const create = mutation({
//   args: {
//     description: v.string(),
//     userName: v.string(),
//     type: v.union(
//       v.literal("create"),
//       v.literal("update"),
//       v.literal("delete"),
//       v.literal("info"),
//     ),
//     organizationId: v.optional(v.id("organizations")),
//     companyId: v.optional(v.id("companies")),
//     customerId: v.optional(v.id("customers")),
//     affectedEntityType: v.optional(
//       v.union(v.literal("company"), v.literal("member"), v.literal("role")),
//     ),
//     affectedEntityId: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const authUserId = await getAuthUserId(ctx);
//     if (authUserId === null)
//       throw new ConvexError(logsErrors.userNotAuthenticated);

//     const logId = await ctx.db.insert("logs", {
//       description: args.description,
//       userName: args.userName,
//       userId: authUserId,
//       type: args.type,
//       companyId: args.companyId,
//       affectedEntityType: args.affectedEntityType,
//       affectedEntityId: args.affectedEntityId,
//     });
//     return logId;
//   },
// });

// export const getByCompany = query({
//   args: {
//     companyId: v.id("companies"),
//     date: v.optional(v.string()),
//     filterType: v.optional(v.union(v.literal("day"), v.literal("month"))),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (userId === null) throw new ConvexError(logsErrors.userNotAuthenticated);

//     const company = await ctx.db.get(args.companyId);
//     if (!company) throw new ConvexError(logsErrors.companyNotFound);

//     const logs = await ctx.db
//       .query("logs")
//       .withIndex("companyId", (q) => q.eq("companyId", args.companyId))
//       .collect();

//     if (args.date) {
//       logs = logs.filter((log) => {
//         if (!log._creationTime) return false;
//         const logDate = new Date(log._creationTime);
//         const targetDate = new Date(args.date!);
//         if (args.filterType === "month") {
//           return (
//             logDate.getFullYear() === targetDate.getFullYear() &&
//             logDate.getMonth() === targetDate.getMonth()
//           );
//         } else {
//           return (
//             logDate.getFullYear() === targetDate.getFullYear() &&
//             logDate.getMonth() === targetDate.getMonth() &&
//             logDate.getDate() === targetDate.getDate()
//           );
//         }
//       });
//     }

//     return logs;
//   },
// });

// export const getByUser = query({
//   args: {
//     userId: v.id("users"),
//     date: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (userId === null) throw new ConvexError(logsErrors.userNotAuthenticated);

//     const user = await ctx.db.get(args.userId);
//     if (!user) throw new ConvexError(logsErrors.userNotFound);

//     const query = ctx.db
//       .query("logs")
//       .withIndex("userId", (q) => q.eq("userId", args.userId));

//     const logs = await query.collect();

//     if (args.date) {
//       return logs.filter((log) => {
//         if (!log._creationTime) return false;
//         const logDate = new Date(log._creationTime);
//         const targetDate = new Date(args.date!);
//         return (
//           logDate.getFullYear() === targetDate.getFullYear() &&
//           logDate.getMonth() === targetDate.getMonth() &&
//           logDate.getDate() === targetDate.getDate()
//         );
//       });
//     }

//     return logs;
//   },
// });
