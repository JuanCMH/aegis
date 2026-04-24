---
name: writing-plans
description: "Defines how implementation plans are written in the Aegis project. Use this skill whenever you need to produce a plan document for a feature, refactor, or multi-step change before implementation. Triggers on: 'write a plan', 'design doc', 'propose a refactor', 'break this down', or when a change is large enough to warrant a written plan before code."
---

# Writing Plans — Aegis

## Purpose

A **plan** is a short, concrete document that answers three questions before a single line of code is written:

1. **What** are we changing? (scope in one paragraph)
2. **Why** does it need to change? (the problem or goal)
3. **How** will we change it? (the smallest ordered set of steps that gets us there)

Plans live in `docs/plans/` and are named `YYYY-MM-DD-<slug>.md`.

## When to write a plan

Write a plan **only** when the change meets at least one of:

- Touches more than ~5 files across multiple packages.
- Introduces a new package, a new entity, or a new column in the Convex schema.
- Changes a widely-used convention (e.g., a hook signature, a component API).
- Requires ordered steps where getting the order wrong would break the app.
- Will be executed across more than one session / by more than one contributor.

**Do NOT write a plan for:**

- Single-file edits.
- Visual tweaks that follow the `aegis-interface` skill directly.
- Bug fixes with an obvious location.
- Adding one field to an existing form.

If in doubt: **skip the plan and write the code.** Plans are overhead; only pay the overhead when the change actually benefits.

## Plan structure

Every plan has this exact structure. No more sections, no fewer.

```markdown
# <Title> — Plan

## Context
One paragraph: what exists today, what's wrong or what we want to add.

## Goal
One paragraph: the end state, written as if it already exists.

## Non-goals
Bullet list of things explicitly NOT in scope. This is the most important section —
it prevents scope creep later.

## Approach
2–4 paragraphs describing the strategy. Mention the key files/packages touched
and any tradeoffs considered. Not step-by-step yet.

## Steps
Ordered list. Each step is atomic, testable if possible, and safe to commit alone.
Number them. If a step depends on another, say so.

1. ...
2. ...
3. ...

## Open questions
Bullet list of things the plan author doesn't know and wants confirmed BEFORE
execution. If this section is empty, delete it.

## Done when
Short checklist of observable outcomes that prove the plan worked.
```

## Step granularity

A good step:
- Is phrased as an imperative ("Add", "Rename", "Extract", "Wire up").
- Touches a coherent set of files (one package, one layer).
- Can be reverted independently if it causes regressions.
- Doesn't hide major decisions inside "update everywhere else" vagueness.

A bad step:
- Says "refactor X" without naming the before/after shape.
- Bundles schema + API + UI in one bullet.
- Uses the word "etc." or "and related changes".

## Non-goals: why they matter

The **Non-goals** section is where plans earn their keep. It says:

> "I am aware this adjacent thing exists and could also be improved, and I am explicitly choosing not to do it in this plan."

Without this, every plan turns into "and while I'm in there…" and nothing ships.

## Open questions

Use this section sparingly. Items here should be things that **block the plan** if unanswered. If the answer is "probably yes but let's see", that's not an open question — just make the decision and write it down.

Examples of good open questions:

- "Should the `commission` field live on `policies` or on a new `commissions` table? Affects step 3."
- "Do we keep `workspaceId` as a soft alias during the rename, or hard-cut to `companyId`? Affects steps 4–7."

Examples of bad open questions:

- "What icon should the button use?" → just pick one from the Icon Registry.
- "What color should the badge be?" → `aegis-interface` skill answers that.

## Relationship with other skills

- **`aegis-interface`** governs HOW UI looks. When a plan involves UI, the plan does NOT re-specify interface rules — it just cites the skill and describes the feature-specific bits.
- **`SKILLS-POLICY`** governs when to re-read skills. Plans that touch UI assume the executor will re-read `aegis-interface` before implementing.

## Example (good)

```markdown
# Rename workspaces → companies — Plan

## Context
Aegis was originally built with `workspaces` as the multi-tenant root, mirroring
Harmony. Aegis's domain is insurance agencies, where the correct term is
"company". The mismatch leaks into hooks (`useWorkspaceId`), routes
(`/workspaces/[id]`), and the Convex schema.

## Goal
Every reference to "workspace" in the Aegis app, schema, and docs is renamed to
"company", with URL, hook, and type names aligned. The migration is transparent
to end users (they see the same UI, just under `/companies/...`).

## Non-goals
- Do not change the permissions model in this PR (separate plan).
- Do not change the join-code UX.
- Do not merge `members` and `roles` tables.

## Approach
We do a mechanical rename in a single PR so the diff is reviewable as a pure
rename. We rename in three layers in order: (1) Convex (schema + queries +
indexes), (2) packages (folder + `api.ts` + hooks), (3) app routes. The old
`workspaces` route is 301-redirected to `/companies` for bookmark preservation.

## Steps
1. Rename `convex/workspaces.ts` → `convex/companies.ts` and update every export.
2. Rename the `workspaces` table in `schema.ts` → `companies`; update all indexes.
3. Run `convex dev` to regenerate `_generated/api`; fix any type errors revealed.
4. Rename `packages/workspaces/` → `packages/companies/`. Update imports repo-wide.
5. Rename `app/(app)/workspaces/` → `app/(app)/companies/`. Add redirect rule.
6. Rename hooks (`useWorkspaceId` → `useCompanyId`) and atoms.
7. Update `docs/architecture/*.md` and `docs/BRAND.md`.

## Done when
- `grep -ri workspace` in src returns no unexpected hits.
- App compiles, `pnpm lint` passes.
- Navigating to `/workspaces/...` redirects to `/companies/...`.
- Convex dashboard shows `companies` table with all migrated rows.
```

## Example (bad — do not imitate)

```markdown
# Improve the app — Plan

## Context
The app has some issues.

## Goal
Make it better.

## Steps
1. Refactor workspaces.
2. Improve permissions and related things.
3. Fix UI inconsistencies.
4. etc.
```

Why it fails: no scope, no non-goals, steps are not atomic, "etc." hides the actual work.

## Conventions

- **Filename**: `docs/plans/YYYY-MM-DD-<slug>.md`.
- **Slug**: kebab-case, short, domain-first (`rename-workspaces-to-companies`, not `juan-refactor-1`).
- **Language**: Spanish for user-facing language, English for technical steps when it reads more naturally. Pick one and be consistent within a plan.
- **Max length**: aim for under 2 screens. If a plan is longer, it is probably two plans.
- **After execution**: append a short `## Outcome` section at the bottom describing what actually happened vs the plan. This is the single best source of truth for future refactors.
