# Aegis Skills Policy

> How skills work in this project, when to use them, and — critically — **when not to slow the user down**.

## 1. What skills exist and what they govern

| Skill | Governs | When to read it |
|---|---|---|
| `aegis-interface` | Everything visible — colors, spacing, components, layouts, icons, modals vs sheets, forms, anti-patterns | **Any task that touches the UI.** No exceptions. |
| `writing-plans` | Format and discipline of plan documents in `docs/plans/` | Before writing a plan. Not before every code change. |
| `brainstorming` | Exploratory conversations with the user | Optional. Use when the user explicitly asks to brainstorm. |
| `vercel-react-best-practices` | React / Next.js patterns (RSC, data fetching, caching) | Touch Next.js configuration, RSC boundaries, or data-fetching patterns. |
| `convex` | Convex-specific patterns (queries, mutations, actions, schema) | Touch `convex/` files. |

Other docs that are **not** skills but are part of the canon:

- `docs/BRAND.md` — identity, typography, palette, icon registry (source of truth).
- `docs/architecture/*.md` — where things live (app, components, packages, hooks, lib).
- `docs/PERMISSIONS.md` — permission inventory and model.

## 2. The re-read rule (the one non-negotiable)

**Before any task that modifies the interface, the executor re-reads `aegis-interface/SKILL.md`.**

"Interface-modifying" means:
- Creating or editing any file under `components/`, `packages/<*>/components/`, or `app/**/page.tsx` / `layout.tsx`.
- Adding, removing, or restyling a modal, sheet, card, form, sidebar item, icon, or button.
- Changing spacing, borders, colors, typography, or depth.

**"Re-read" means skim it in full.** The skill is intentionally long because the visual consistency of Aegis depends on following it. Getting one modal wrong creates a week of drift.

For non-UI tasks (pure logic, schema changes, Convex queries, utility refactors), re-reading `aegis-interface` is **not required**.

## 3. The "no dumb questions" rule (the one the user cares most about)

Skills and process must **never** generate ceremonial questions. Every question to the user must earn its place.

### A question is allowed only if:

1. The answer **changes the work** in a way the executor cannot recover from later without waste, AND
2. The answer is **not discoverable** from the codebase, BRAND.md, skills, or the user's own request, AND
3. A reasonable default **does not exist** or all defaults are equally wrong.

### A question is NOT allowed if:

- The user already answered it implicitly in their request.
- The answer is in `docs/BRAND.md` or `aegis-interface/SKILL.md`.
- It is a visual micro-decision (icon choice from the Registry, spacing, color of a badge whose meaning is already defined).
- It is asked to "confirm understanding" of an obvious request.
- A reasonable default exists and mentioning the default in the response is enough ("I'll use `aegis-sapphire` as the accent; tell me if you prefer another").
- The answer can be reversed cheaply after implementation.

### The default is to **decide, state the decision, and proceed.**

Bad pattern:
> "Before I start, I need to confirm:
>  1. Should the modal open on click or on hover?
>  2. What icon should the button use?
>  3. Do you want the cancel button on the left or the right?
>  4. Should we show a toast on success?
>  5. …"

Good pattern:
> "I'll use `AegisModal` (click to open), `Plus` icon for the create button, cancel on the left via `DialogClose`, and a success toast via `toast.success('Cliente creado')`. All of these follow the `aegis-interface` skill. If any is wrong, tell me after the implementation."

### Calibration heuristics

Before writing a question, ask yourself:

- **"Is this answer in the skill or the brand?"** → If yes, no question. Look it up.
- **"Is this reversible in under 30 seconds if wrong?"** → If yes, no question. Pick a default.
- **"Does this answer change more than 1 file?"** → If no, no question. Pick a default.
- **"Would a senior engineer on this project know the answer without asking?"** → If yes, no question.

Only questions that survive all four filters go to the user.

### When you genuinely need to ask

Batch questions. Ask them **once**, at the start, with proposed defaults. Example:

> "Two decisions I need before coding:
>  1. `commission` as a column on `policies`, or as its own table? **Default: column on `policies`** (simpler for now, migratable later).
>  2. Rename the existing `companies` rows in-place, or copy into `companies`? **Default: rename in-place** (keeps IDs stable).
>
> Replying 'defaults' is fine."

## 4. How to use a skill during a task

### 4.1 Interface task (any UI change)

```
1. Re-read aegis-interface/SKILL.md in full.
2. Identify which section(s) of the skill apply to this task.
3. Check the Icon Registry for the correct icon for each entity involved.
4. Write the code following the specs exactly (classes, spacing, structure).
5. Before presenting to the user, run the Pre-delivery checklist (section 7 of the skill).
6. If any item in the checklist fails, fix it before presenting.
```

### 4.2 Plan-writing task

```
1. Re-read writing-plans/SKILL.md.
2. Confirm the change deserves a plan (see "When to write a plan" in that skill).
3. Write the plan using the exact structure defined.
4. Limit "Open questions" to items that actually block execution.
5. Present the plan. Do not start executing until the user confirms (or asks for changes).
```

### 4.3 Schema / Convex task

```
1. Re-read convex/SKILL.md (if available) and docs/architecture/packages-structure.md (specifically the api.ts contract).
2. Make the schema/query/mutation changes.
3. Ensure every new endpoint is exposed through a package's api.ts.
4. Never import from convex/_generated/api inside a component.
```

### 4.4 Small edit task (bug fix, one-file tweak)

```
1. Do the edit.
2. If it's UI, still re-read aegis-interface (non-negotiable).
3. Don't write a plan. Don't ask for confirmation.
```

## 5. Skill updates

Skills are **versioned living documents**. When a pattern is added, deprecated, or changed:

1. Open the corresponding `SKILL.md`.
2. Edit the section that covers it.
3. If removing a pattern, add it to the "Anti-patterns" section of `aegis-interface` (section 6) so the old pattern becomes explicitly wrong.
4. Commit the skill change **in the same PR** as the code change that motivated it.

A skill that doesn't match the codebase is worse than no skill. Either the skill is authoritative, or it's noise.

## 6. Order of authority

When two sources of truth conflict, resolve in this order:

1. **The skill** (`aegis-interface`, `writing-plans`, etc.).
2. **`docs/BRAND.md`** (identity, palette, icon registry).
3. **`docs/architecture/*.md`** (where things live).
4. **The existing codebase** (the most consistent pattern wins).
5. **The user's current request** (always wins over all of the above if explicit — but if it contradicts a skill, flag it).

If the user's request contradicts a skill, do not silently comply. Say: "This contradicts `aegis-interface §X`. Confirm you want me to diverge, or should I follow the skill?"

## 7. Checklist for every session (mental)

Before starting work:

```
□ Did I read the user's request carefully and fully?
□ Does this task touch the UI? → Re-read aegis-interface.
□ Does this task need a plan (see writing-plans §2)? → If yes, plan first.
□ Do I have all the context I need? → If missing, look it up before asking.
□ Am I about to ask a question? → Run it through the 4 filters in §3.
□ Am I about to invent a pattern? → Find the documented pattern instead.
□ After implementation: did I run the aegis-interface pre-delivery checklist?
```

## 8. The spirit of all this

Skills exist to **speed up correct work**, not to slow down any work.

A skill that creates friction for no value is a broken skill. Flag it; edit it.

The user's time is the scarcest resource in the project. Every question, every ceremonial confirmation, every "can I start now?" burns that resource. Spend it only when the answer genuinely unblocks the next hour of work.

When you do the work right, the user never has to explain the same thing twice. That is the whole point.
