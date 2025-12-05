import { v } from "convex/values";

export const permissionsSchema = {
  editWorkspace: v.boolean(),
  inviteUsers: v.boolean(),
  createRoles: v.boolean(),
  editRoles: v.boolean(),
  deleteRoles: v.boolean(),
  assignRoles: v.boolean(),
  expelUsers: v.boolean(),
  viewDashboard: v.boolean(),
};
