/**
 * One-shot migrations to clean up dev data that predates the
 * `workspaceId → companyId` rename.
 *
 * Run from the terminal:
 *   bunx convex run migrations:cleanupLegacyWorkspaceDocs
 *
 * Safe to delete after running.
 */
import { internalMutation } from "./_generated/server";
import type { TableNames } from "./_generated/dataModel";

const TABLES: TableNames[] = [
  "bonds",
  "clients",
  "clientTemplates",
  "insurers",
  "linesOfBusiness",
  "policies",
  "quotes",
  "quoteBonds",
  "roles",
  "invitations",
  "members",
  "logs",
];

export const cleanupLegacyWorkspaceDocs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const summary: Record<string, number> = {};
    for (const table of TABLES) {
      const rows = await ctx.db.query(table).collect();
      let deleted = 0;
      for (const row of rows) {
        const record = row as unknown as Record<string, unknown>;
        const hasCompanyId = typeof record.companyId === "string";
        const hasWorkspaceId = typeof record.workspaceId === "string";
        if (!hasCompanyId && hasWorkspaceId) {
          await ctx.db.delete(row._id);
          deleted++;
        }
      }
      summary[table] = deleted;
    }
    return summary;
  },
});
