# Permissions — Inventory & Model

> Exhaustive inventory of every action in the Aegis product, and the proposed granular permission model that maps to it.

## 1. Design principles

Before the inventory, the principles the model must satisfy:

1. **Two-axis clarity**: every permission is `<domain>_<action>`. The domain is a business entity; the action is a verb. `clients_create`, `policies_renew`, `members_invite`. (Storage uses underscores because Convex validators require identifier-safe keys; the conceptual separator is still "domain dot action".)
2. **Easy by default**: out of the box, two predefined roles — `Admin` and `Member` — cover 95% of agencies. Custom roles are an advanced feature, not a daily concern.
3. **Additive, never subtractive**: permissions grant. Missing a permission = no access. There is no "deny override" concept. This keeps the mental model linear.
4. **Visible, never hidden**: the UI respects permissions by hiding the action (no disabled buttons with cryptic tooltips). If a user can't do something, the button isn't there.
5. **Reflected in audit**: every permission-gated action that succeeds is written to `logs`.
6. **View ≠ read**: `<domain>_view` controls whether the module appears in the sidebar and whether the user can read any record in that domain. Without it, the domain is invisible.

## 2. Inventory of actions per domain

Every action below is something a user can do today or will be able to do in the near-term MVP. This is the **source of truth** the permission model must cover.

### 2.1 Company (the agency itself)

| # | Action | Who typically does it | Notes |
|---|---|---|---|
| 1 | View company dashboard | Everyone with access to the company | The dashboard is the "home" view. |
| 2 | Edit company details (name, colors, logo) | Admin | Branding page in settings. |
| 3 | Delete the company | Owner / Admin | Irreversible. Confirmation flow. |
| 4 | Leave the company | Any member | A member leaves; does not delete. |
| 5 | View audit log | Admin | The `logs` module. |

### 2.2 Members

| # | Action | Who typically does it |
|---|---|---|
| 6 | View member list | Admin |
| 7 | Invite a member (via email or join code) | Admin |
| 8 | Expel a member | Admin |
| 9 | Assign a role to a member | Admin |
| 10 | Change a member's own profile | Every member (on themselves) |

### 2.3 Roles

| # | Action | Who typically does it |
|---|---|---|
| 11 | View list of roles | Admin |
| 12 | Create a custom role | Admin |
| 13 | Edit a custom role | Admin |
| 14 | Delete a custom role | Admin |
| 15 | View effective permissions of a role | Admin |

### 2.4 Clients

| # | Action | Who typically does it |
|---|---|---|
| 16 | View clients list | Most roles |
| 17 | View a specific client's detail | Most roles |
| 18 | Create a client (person or business) | Advisor / Admin |
| 19 | Edit a client | Advisor / Admin |
| 20 | Delete a client | Admin (destructive; has attached policies) |
| 21 | Export clients to Excel | Advisor / Admin |
| 22 | Use the AI to extract client data from a document | Advisor / Admin |

### 2.5 Client templates

| # | Action | Who typically does it |
|---|---|---|
| 23 | View the current template | Admin |
| 24 | Edit the template (add/remove fields, reorder) | Admin |
| 25 | Reset the template to defaults | Admin |

### 2.6 Policies

| # | Action | Who typically does it |
|---|---|---|
| 26 | View policies list | Most roles |
| 27 | View a specific policy detail | Most roles |
| 28 | Create a policy manually | Advisor / Admin |
| 29 | Edit a policy | Advisor / Admin |
| 30 | Delete a policy | Admin |
| 31 | Renew a policy (creates a new linked policy) | Advisor / Admin |
| 32 | Cancel a policy | Advisor / Admin |
| 33 | View commissions on a policy | Advisor (own policies) / Admin (all) |
| 34 | Edit commission fields on a policy | Admin |
| 35 | Export policies to Excel | Advisor / Admin |
| 36 | Import policies from Excel (future) | Admin |

### 2.7 Quotes

| # | Action | Who typically does it |
|---|---|---|
| 37 | View quotes list | Most roles |
| 38 | View a specific quote detail | Most roles |
| 39 | Create a quote manually | Advisor / Admin |
| 40 | Upload a PDF for AI extraction → quote | Advisor / Admin |
| 41 | Edit a quote | Advisor / Admin |
| 42 | Delete a quote | Admin |
| 43 | Convert a quote into a policy | Advisor / Admin |
| 44 | Export a quote to PDF | Everyone with view access |
| 45 | Share a quote via link | Advisor / Admin |

### 2.8 Bonds (catalog)

| # | Action | Who typically does it |
|---|---|---|
| 46 | View bonds catalog | Most roles (bonds power quotes) |
| 47 | Create a bond | Admin |
| 48 | Edit a bond | Admin |
| 49 | Delete a bond | Admin |

### 2.9 Insurers (catalog)

| # | Action | Who typically does it |
|---|---|---|
| 50 | View insurers catalog | Most roles |
| 51 | Create an insurer | Admin |
| 52 | Edit an insurer | Admin |
| 53 | Delete an insurer | Admin |

### 2.10 Lines of Business (catalog)

| # | Action | Who typically does it |
|---|---|---|
| 54 | View lines of business catalog | Most roles |
| 55 | Create a line of business | Admin |
| 56 | Edit a line of business | Admin |
| 57 | Delete a line of business | Admin |

### 2.11 Dashboard / reports

| # | Action | Who typically does it |
|---|---|---|
| 58 | View the operational dashboard (KPIs, renewals, pending) | Most roles |
| 59 | View the financial dashboard (commissions, totals, breakdowns) | Admin |
| 60 | Export a dashboard report (Excel / PDF) | Admin |

### 2.12 Logs / Audit

| # | Action | Who typically does it |
|---|---|---|
| 61 | View audit log | Admin |
| 62 | Filter audit log by user / entity / date | Admin |

### 2.13 AI-powered actions (cross-cutting)

These are the AI-gated actions scattered across the inventory above. They deserve their own pseudo-domain because each has a **cost** (token usage) and some agencies will want to restrict it:

| # | Action | Primary domain |
|---|---|---|
| 22 | Extract client data from document | clients |
| 40 | Extract quote data from contract | quotes |
| — | (Future: draft email to client) | communications |
| — | (Future: suggest coverage for a client) | policies |

## 3. Proposed permission model

Permissions are stored as a flat object on the `roles` table (same style as today's `permissionsSchema`, but richer). Keys are `<domain>_<action>` — underscores rather than dots because Convex validator identifiers must match `[A-Za-z0-9_]+`. The canonical source is `convex/lib/permissions.ts`:

```ts
// convex/lib/permissions.ts

export const permissionsSchema = {
  // Company
  "company_view":            v.boolean(), // implicit: if false, the role cannot access the company at all
  "company_edit":            v.boolean(),
  "company_delete":          v.boolean(),
  "company_viewAudit":       v.boolean(),

  // Members
  "members_view":            v.boolean(),
  "members_invite":          v.boolean(),
  "members_expel":           v.boolean(),
  "members_assignRole":      v.boolean(),

  // Roles
  "roles_view":              v.boolean(),
  "roles_create":            v.boolean(),
  "roles_edit":              v.boolean(),
  "roles_delete":            v.boolean(),

  // Clients
  "clients_view":            v.boolean(),
  "clients_create":          v.boolean(),
  "clients_edit":            v.boolean(),
  "clients_delete":          v.boolean(),
  "clients_export":          v.boolean(),
  "clients_useAI":           v.boolean(),

  // Client templates
  "clientTemplates_view":    v.boolean(),
  "clientTemplates_edit":    v.boolean(),

  // Policies
  "policies_view":           v.boolean(),
  "policies_create":         v.boolean(),
  "policies_edit":           v.boolean(),
  "policies_delete":         v.boolean(),
  "policies_renew":          v.boolean(),
  "policies_cancel":         v.boolean(),
  "policies_viewCommissions":v.boolean(),
  "policies_editCommissions":v.boolean(),
  "policies_export":         v.boolean(),

  // Quotes
  "quotes_view":             v.boolean(),
  "quotes_create":           v.boolean(),
  "quotes_edit":             v.boolean(),
  "quotes_delete":           v.boolean(),
  "quotes_convertToPolicy":  v.boolean(),
  "quotes_share":            v.boolean(),
  "quotes_useAI":            v.boolean(),

  // Bonds
  "bonds_view":              v.boolean(),
  "bonds_manage":            v.boolean(), // create + edit + delete, bundled

  // Insurers
  "insurers_view":           v.boolean(),
  "insurers_manage":         v.boolean(),

  // Lines of Business
  "linesOfBusiness_view":    v.boolean(),
  "linesOfBusiness_manage":  v.boolean(),

  // Dashboard
  "dashboard_viewOperational":v.boolean(),
  "dashboard_viewFinancial":  v.boolean(),
  "dashboard_export":         v.boolean(),

  // Logs
  "logs_view":               v.boolean(),
};
```

### Note on "manage" bundles

For **catalog entities with low granularity** (bonds, insurers, lines of business), a single `manage` permission replaces `create + edit + delete`. This reduces UI noise in the role editor without losing meaningful control — in practice, anyone who can create an insurer should be able to edit and delete it too.

For **core entities with high granularity** (policies, quotes, clients), we keep separate permissions because the business cases are real: an advisor may edit a quote but not delete it; an Admin may edit a policy's commissions but a junior advisor may not.

### Note on `viewAudit` at the company level

`company_viewAudit` controls access to the logs module. It's nested under `company` (not `logs`) because conceptually it's an admin-level read of the company itself. The `logs_view` permission exists as its own key so the sidebar can decide whether to render the Logs item, but the audit module requires both.

## 4. Predefined roles

Every company starts with two system roles that cannot be edited or deleted. Users can create additional custom roles.

### 4.1 Admin

**All permissions true.** No exceptions. Inviting user is the implicit first Admin (company owner).

### 4.2 Member (default role for new invitees)

```ts
{
  "company_view":             true,
  "company_edit":             false,
  "company_delete":           false,
  "company_viewAudit":        false,

  "members_view":             false,
  "members_invite":           false,
  "members_expel":            false,
  "members_assignRole":       false,

  "roles_view":               false,
  "roles_create":             false,
  "roles_edit":               false,
  "roles_delete":             false,

  "clients_view":             true,
  "clients_create":           true,
  "clients_edit":             true,
  "clients_delete":           false,
  "clients_export":           true,
  "clients_useAI":            true,

  "clientTemplates_view":     true,
  "clientTemplates_edit":     false,

  "policies_view":            true,
  "policies_create":          true,
  "policies_edit":            true,
  "policies_delete":          false,
  "policies_renew":           true,
  "policies_cancel":          false,
  "policies_viewCommissions": true,   // own
  "policies_editCommissions": false,
  "policies_export":          true,

  "quotes_view":              true,
  "quotes_create":            true,
  "quotes_edit":              true,
  "quotes_delete":            false,
  "quotes_convertToPolicy":   true,
  "quotes_share":             true,
  "quotes_useAI":             true,

  "bonds_view":               true,
  "bonds_manage":             false,

  "insurers_view":            true,
  "insurers_manage":          false,

  "linesOfBusiness_view":     true,
  "linesOfBusiness_manage":   false,

  "dashboard_viewOperational":true,
  "dashboard_viewFinancial":  false,
  "dashboard_export":         false,

  "logs_view":                false,
}
```

## 5. Implementation notes

### 5.1 Where to gate

Permissions are enforced in **two layers**:

- **Server (Convex)**: every mutation/query checks the member's role. This is the source of truth. Tampering with the client doesn't bypass it.
- **Client (UI)**: `<RoleGate permission="clients_create">...</RoleGate>` hides or disables UI. Never a replacement for server enforcement — purely UX.

A `role-gate.tsx` component lives in `packages/roles/components/role-gate.tsx`. Its API:

```tsx
<RoleGate permission="policies_delete" fallback={null}>
  <Button>Delete</Button>
</RoleGate>
```

For multiple permissions (OR semantics):

```tsx
<RoleGate permissions={["clients_edit", "clients_delete"]} mode="any">
  ...
</RoleGate>
```

### 5.2 Role assignment rules

- A member always has exactly one role.
- System roles (`Admin`, `Member`) cannot be edited or deleted.
- A company must always have at least one Admin. Last Admin cannot leave without transferring.
- Custom roles are scoped to their `companyId`.

### 5.3 Migration from the current 8-permission model

Today's permissions (`editCompany`, `inviteUsers`, `createRoles`, etc.) map to the new model as follows:

| Old | New |
|---|---|
| `editCompany` | `company_edit` |
| `inviteUsers` | `members_invite` |
| `createRoles` | `roles_create` |
| `editRoles` | `roles_edit` |
| `deleteRoles` | `roles_delete` |
| `assignRoles` | `members_assignRole` |
| `expelUsers` | `members_expel` |
| `viewDashboard` | `dashboard_viewOperational` |

All other new permissions default to the **Member** role's value during migration. Admin gets true for everything.

## 6. Open questions

- Should `policies_viewCommissions` be scoped to "own policies only" vs "all policies" as a separate flag, or is the distinction always "Admin sees all, Member sees own"? Current proposal: implicit — if `viewCommissions` is true on a non-Admin, they see their own. Admins see all by virtue of being Admin.
- Do we need `policies_assignAdvisor` (reassigning who owns a policy)? Probably yes, eventually. Not in MVP.
- Do we need per-client access restrictions (a role that can only see clients X, Y, Z)? Out of scope for v1. Revisit when an agency asks.

## 7. What this means for the UI

Once this model is implemented, **every** button, menu item, and sidebar entry answers one question:

> "Do I render this to the current user?"

That question becomes `<RoleGate permission="...">`. The result is a UI that **silently tailors itself** to each user's role, with no disabled buttons and no cryptic tooltips.

This is the concrete mechanism by which the BRAND.md principle "**un camino, no ocho**" is realized in code.
