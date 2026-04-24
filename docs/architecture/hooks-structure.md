# Hooks Structure

> App-wide React hooks. Packages depend on these; these depend on nothing domain-specific.

## Location

All app-wide hooks live in `components/hooks/`. Package-specific hooks live in `packages/<feature>/store/` or `packages/<feature>/lib/`.

## Fundamental hooks

### `use-fetch.ts`

Wraps Convex `useQuery` with loading/error handling. **The only way packages read data from Convex.**

```ts
const { data, isLoading } = useFetch(api.clients.getById, { id: clientId });
```

- Returns `{ data, isLoading, error }`.
- Handles `undefined` vs `null` semantics consistently: `undefined` = loading, `null` = not found.

### `use-mutate.ts`

Wraps Convex `useMutation` with pending state and error-to-toast handling.

```ts
const { mutate, isPending } = useMutate(api.clients.create);

await mutate({ name, identificationNumber, companyId });
```

- `mutate()` returns a promise.
- Errors are caught and forwarded to `toast.error()` via `handleConvexError`.
- Exposes `isPending` for button disabling.

### `use-execute.ts`

Wraps Convex `useAction` for long-running actions (AI extraction, external API calls, emails).

```ts
const { execute, isPending } = useExecute(api.quote.getQuoteFromDoc);
const result = await execute({ documentId });
```

### `use-confirm.tsx`

Returns a `[Component, confirm]` tuple for confirmation dialogs before destructive actions.

```ts
const [ConfirmDialog, confirm] = useConfirm({
  title: "Eliminar cliente",
  message: "Esta acción no se puede deshacer.",
  type: "critical",
});

// In handler:
const ok = await confirm();
if (!ok) return;
await removeClient({ id });

// In JSX:
<ConfirmDialog />
```

### `use-generate-upload-url.ts`

Returns the Convex upload URL generator. Used when uploading files (logos, PDFs for AI extraction).

### `use-mobile.ts`

Returns `true` when the viewport is below the mobile breakpoint (`md`, 768px). Used to toggle between modal/sheet variants or mobile-specific behavior.

## Package-local hooks

Hooks that only one package cares about live in that package's `store/` folder:

- **ID hooks**: `use-company-id.ts`, `use-client-id.ts`, `use-policy-id.ts`. Read `useParams()` and return the typed ID.
- **Modal atoms**: `use-create-client-modal.ts`, etc. Tiny Jotai atoms.
- **Managers**: `use-policy-wizard.ts`, `use-client-search.ts`. Complex state for a single view.

## Conventions

- **File naming**: kebab-case (`use-my-hook.ts`).
- **One hook per file.**
- **Export a single named hook** per file. No default exports.
- **App-wide hooks** live in `components/hooks/`.
- **Package-local hooks** live in `packages/<name>/store/` (state) or `packages/<name>/lib/` (pure helpers).
- **Never use `useQuery` / `useMutation` / `useAction` directly in components.** Always go through `use-fetch` / `use-mutate` / `use-execute`, and expose them from the package's `api.ts`.
