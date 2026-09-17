# Agent conventions

This repo is a Next.js App Router app. Today `/` is a single-user pokemon pet simulator (`Pokedachi`).

Stack that differs from older training data: Next 16, React 19, Prisma 7 (SQLite; generated client in `src/generated/prisma`), Tailwind 4, Storybook 10, Vitest browser + Playwright.

Specs live under `specs/`. Implement the spec, then encode only **durable** conventions here. Leave the Next.js block at the bottom unchanged.

Do not add npm packages (CVA, clsx, Testing Library, extra Storybook addons, etc.) unless a spec says so.

# Shared UI components

Canonical example: `src/components/atoms/Button/Button.tsx`.

## Atomic folder map

Shared UI lives under `src/components/{atoms,molecules,organisms,templates,pages}`.

## Per-component file checklist

- One folder per component, named after the component.
- Main file is PascalCase and matches the folder: `ComponentName/ComponentName.tsx`.
- Colocate `ComponentName.tsx`, `ComponentName.stories.tsx`, and `ComponentName.test.tsx` in that folder. No `index.ts`, no CSS modules, no extra type files.

## Exports and imports

- Each component uses both a named export and a default export of the same component.
- No barrel files at any level.
- Import the file: `@/components/atoms/Button/Button`.

## Client vs server

Server Components by default. Add `"use client"` only when the component needs client features (handlers, state, browser APIs). Presentational components without those stay as Server Components.

## Variants

Plain class maps / conditionals inside the component. Do not add CVA, clsx, tailwind-merge, or `cn`. Concatenate caller `className` last with simple string joining.

## Accessibility

Rely on native element semantics and keyboard behavior. Loading uses native `disabled` plus `aria-disabled`.

## Prisma in UI

Row types come from `@/generated/prisma/browser`. Do not import `@/prisma/prismaClient` or the generated server client in UI. Do not edit `src/generated/prisma`.

# Stories

Canonical example: `src/components/atoms/Button/Button.stories.tsx`.

## File location & format

- Colocate stories as `src/components/{layer}/{ComponentName}/{ComponentName}.stories.tsx`.
- Required for every new shared component under `src/components`.
- Always `.tsx`, even when the file is args-only.
- CSF3: `Meta` / `StoryObj` from `@storybook/nextjs-vite`; default-export `meta`.
- Named import from `./ComponentName` (e.g. `import { Button } from "./Button"`). Do not use `@/` in story files.

## Sidebar grouping

- Set an explicit `title`: `{Layer}/{ComponentName}`.
- Layer is PascalCase: `Atoms`, `Molecules`, `Organisms`, `Templates`, `Pages`.
- Button: `Atoms/Button`.
- PageTemplate: `Templates/PageTemplate`.
- TodoPage: `Pages/TodoPage`.

## Story content

- One named story export: `Default`. Coverage via controls and Autodocs, not extra named stories for variants, sizes, or states.
- Every shared-component `Default` story must include a `play` function that exercises a basic interaction.
- `fn()` spies and Storybook test utilities (`expect`, `userEvent`, etc.) are allowed.

## Autodocs & controls

- Every story file sets `tags: ["autodocs"]` on `meta`.
- Atoms, molecules, and organisms use `layout: "centered"` unless a spec says otherwise.
- Templates and pages use `layout: "fullscreen"`.
- Curate the Controls and Autodocs table with `parameters.controls.include`. This does not change the component API or what app code can pass; it only hides Storybook UI noise.
- Show the component's own props, plus native HTML props that are part of its documented usage. Hide every other native HTML prop (`className`, event handlers, and the rest of `ComponentProps<"button">` etc.).
- Button include list: `variant`, `size`, `loading`, `fullWidth`, `disabled`, `children`, `type`.

# Testing

Canonical examples: `src/components/atoms/Button/Button.test.tsx` and `src/components/atoms/Button/Button.stories.tsx`.

- Colocate component tests as `src/components/{layer}/{ComponentName}/{ComponentName}.test.tsx`. Required for every new shared component under `src/components`.
- Named import from `./ComponentName` (e.g. `import { Button } from "./Button"`). Do not use `@/` in test files.
- Vitest **browser** (Playwright Chromium, headless) + `vitest-browser-react`. `render` from `vitest-browser-react`, then query with Vitest locators (`getByRole`). No Testing Library, no jsdom.
- Playwright e2e in `tests/e2e/`; config at repo root; Chromium only. E2e uses `prisma/dev.db`.
- Action tests use `prisma/test.db` only. Never point them at `dev.db`.
- Scripts: `test` (Vitest run, all projects: `storybook`, `components`, `actions`), `test:e2e` (Playwright).
- `@storybook/addon-vitest` runs stories including `play` from the Storybook test UI.

# Backend

Canonical example: `src/actions/todo/createTodo/createTodo.ts`.

## Server Actions

- Live under `src/actions/{resource}/{actionName}/{actionName}.ts`. One folder per action, named after the exported function. The action file matches the folder.
- Each action file starts with `"use server"`. One async named export only. No default export.
- No barrel files at any actions level. Import the file: `@/actions/todo/createTodo/createTodo`.
- Thin Prisma: call `@/prisma/prismaClient` directly. Do not add a service or repository layer.
- Shared helpers live in `src/actions/{resource}/helpers.ts`. That file is not a Server Action (no `"use server"`). Trim and normalize there; throw before write if required fields are empty.
- Do not add Route Handlers for this app's backend.

Todo helper example (`src/actions/todo/helpers.ts`): trim `title` and throw if empty; `description` `null` stays `null`; a string description is trimmed and empty becomes `null` (not `""`).

## Action tests

- Vitest **node** tests under `tests/actions/{resource}/{actionName}/{actionName}.test.ts` against `prisma/test.db`.
- Import the named action with `@/` (e.g. `import { createTodo } from "@/actions/todo/createTodo/createTodo"`). Do not colocate action tests under `src/`.

# App wiring

Canonical example: `src/app/page.tsx` and `src/components/pages/TodoPage/TodoPage.tsx`.

## Route and injection

- App routes are async Server Components. Load with a list action; pass mutation actions as props. Import each action by file path. No barrels. No Route Handlers.
- The client page component calls those props. It does not import `@/actions/...` or Prisma.
- Molecules and organisms stay presentational: they receive callbacks, never call actions or Prisma.
- Keep `export const dynamic = "force-dynamic"` on `/`. Do not add `revalidatePath`, `router.refresh`, or optimistic/fake rows.

Todo: `page.tsx` calls `listTodos` and renders `TodoPage` with `initialTodos`, `createTodo`, `updateTodo`, and `deleteTodo`.

## Client state

- Apply the returned row locally. Do not refetch the list after mutations.
- Coerce serialized `Date` fields to `Date` on initial data and every action result before putting them in state.

Todo: prepend on create; coerce `createdAt`.

## Errors and pending

- On mutation failure: do not change list state. Set an inline `role="alert"` with generic copy (`Something went wrong. Try again.`). Do not show `error.message`. Rethrow so children can keep local UI.
- Clear the alert on the next successful mutation.
- Molecules await the callback and only reset local UI on success (clear form, exit edit).
- While the callback is pending, disable the control that fired it with native `disabled`. Do not use Button `loading`. Cancel stays enabled.

## Tests

- Component tests/stories mock action props on the page component only (`fn()` / `vi.fn()`). Lower layers use sync spies; do not add persistence mocks there.
- Playwright e2e uses `prisma/dev.db`. Isolate with unique data (e.g. timestamped titles). Do not assume an empty list and do not wipe the DB.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
