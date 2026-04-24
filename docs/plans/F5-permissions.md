# F5 — Granular permissions

## Context
Today the `roles` table uses an 8-boolean `permissionsSchema` (`editCompany`, `inviteUsers`, `createRoles`, `editRoles`, `deleteRoles`, `assignRoles`, `expelUsers`, `viewDashboard`). `docs/PERMISSIONS.md` defines a 47-key `<domain>.<action>` model plus two system roles (Admin, Member) and a `<RoleGate>` UI component contract. There are only 5 server-side call sites using the old keys (3 in `convex/roles.ts`, 2 in `convex/companies.ts`) and zero UI usage — the client-side surface is greenfield.

## Goal
Replace the 8-key model with the 47-key granular model from `PERMISSIONS.md §3`, wire Member defaults server-side, and ship the `packages/roles/` package with a `<RoleGate>` component per `§5.1`.

## Non-goals
- Data migration (pre-MVP, no prod data).
- Per-record scopes (e.g. "advisor sees own policies only") — deferred to post-MVP.
- UI role editor screens — that's F6/F7.
- System-role seed rows. `checkPermission` will short-circuit for literal `"admin"` and apply `memberPermissionDefaults` for literal `"member"`. Custom roles remain table-backed.

## Approach
1. Rewrite `convex/lib/permissions.ts` with the 47 keys (dot-notation keys = quoted object literals) and export `memberPermissionDefaults` per `§4.2`.
2. Extend `convex/roles.ts` `checkPermission`: if `member.role === "member"` and no `customRoleId`, read from `memberPermissionDefaults`.
3. Update the 5 call sites with keys from `§5.3` migration table.
4. Add `api.roles.hasPermission` query so the client can resolve a permission without fetching the whole role.
5. Create `packages/roles/` with: `api.ts` (hooks), `types.ts` (`PermissionKey`), `components/role-gate.tsx`.
6. `npx convex codegen` + `tsc --noEmit`. Tolerate the 3 known pre-existing errors.

## Done when
- `grep -r "editCompany\|inviteUsers\|createRoles\|editRoles\|deleteRoles\|assignRoles\|expelUsers\|viewDashboard" convex/ app/ components/ packages/` returns zero hits outside `PERMISSIONS.md`.
- `permissionsSchema` exports exactly 47 keys matching the doc.
- `<RoleGate permission="clients_create">` compiles and `permission` is typed to `PermissionKey`.
- `tsc --noEmit` clean aside from the 3 pre-existing errors.

## Open questions
None.
