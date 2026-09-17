# Pokedachi

**Pokedachi** is a Pokémon pet simulator and care app built on a lightweight todo-style base.

Coding conventions for this repo live in [`AGENTS.md`](./AGENTS.md).

## Stack

- [React 19](https://react.dev/) — UI library; `src/components/`
- [Next.js](https://nextjs.org/) — App Router; `src/app/page.tsx`, `src/app/layout.tsx`
- [Prisma](https://www.prisma.io/) — SQLite ORM; `prisma/schema.prisma`, `src/prisma/prismaClient.ts`
- [Storybook](https://storybook.js.org/) — UI in isolation; `.storybook/`, colocated `*.stories.tsx`
- [Atomic Design](https://atomicdesign.bradfrost.com/chapter-2/) — UI folder map; `src/components/{atoms,molecules,organisms,templates,pages}`
- [Tailwind CSS](https://tailwindcss.com/) — utility classes; `src/app/globals.css`
- [Vite](https://vite.dev/) — Storybook and Vitest toolchain, not the Next.js bundler; `.storybook/main.ts`, `vitest.config.ts`
- [Vitest](https://vitest.dev/) — component/story/action tests; colocated `*.test.tsx`, `tests/actions/`
- [Playwright](https://playwright.dev/) — e2e; `tests/e2e/`, `playwright.config.ts`
- SQLite — local DB used by Prisma; `prisma/dev.db` is gitignored and created on migrate; `prisma/schema.prisma`

## Setup

1. Install Node.js and npm. Clone this repo.
2. `npm install`
3. Copy `.env.example` to `.env` (do not commit `.env`)
4. `npm run prisma:generate`
5. `npm run prisma:migrate` (applies existing migrations; creates `prisma/dev.db`)
6. `npm run dev` → [http://localhost:3000/](http://localhost:3000/)

## Scripts

See `./package.json`
Execute using `npm run [name of script]`

- `dev` — Next.js app at http://localhost:3000/
- `storybook` — Storybook UI on port 6006
- `import:pokemon` — import Pokémon data from PokeAPI; accepts `--all`, `--id <id>`, or `--from <start> --to <end>`
- `test` — Vitest (storybook, components, and actions projects)
- `test:e2e` — Playwright e2e
- `prisma:migrate` — apply existing migrations; creates `prisma/dev.db`
- `prisma:generate` — generate the Prisma client

### Pokémon import commands

```bash
npm run import:pokemon -- --all
npm run import:pokemon -- --id 25
npm run import:pokemon -- --from 10 --to 12
```

These commands import the selected Pokémon and their forms/varieties from PokeAPI into the local SQLite database. The importer is a standalone data utility and is not part of the normal runtime app flow.

## File structure

```
.
├── src/
│   ├── app/                         # routes (`page.tsx` is `/`)
│   │   ├── page.tsx                 # `/` — loads todos, injects Server Actions
│   │   ├── layout.tsx               # root layout and document metadata
│   │   └── globals.css              # Tailwind entry
│   ├── components/                  # atomic UI
│   │   └── atoms/Button/Button.tsx  # canonical atom
│   ├── actions/                     # Server Actions
│   │   └── todo/createTodo/createTodo.ts
│   ├── prisma/prismaClient.ts       # Prisma client used by actions
│   └── generated/prisma/            # generated client; do not edit
├── prisma/                          # schema and migrations
├── .storybook/                      # Storybook config
├── tests/
│   ├── actions/                     # action tests (`prisma/test.db`)
│   └── e2e/                         # Playwright (`prisma/dev.db`)
├── specs/                           # SDD specs
├── vitest.config.ts                 # Vitest projects (storybook, components, actions)
├── playwright.config.ts             # Playwright e2e config
└── AGENTS.md                        # conventions for this repo
```

To explore the codebase, start with `src\app\page.tsx`.

Review Prisma Schema in `prisma\schema.prisma`

## Adding a feature (spec-driven development)

When adding a feature with an AI agent, follow the spec layout, invoke the skills explicitly, and use the process below.

### Spec layout

- `specs/spec_template.md` — starting headings for a new spec
- `specs/NNN-kebab-slug/` — one folder per spec
  - `spec.md` — what to build and constraints (Context, Goals, Requirements, Out of scope)
  - `plan.md` — how to build (files, APIs, order); written by **spec-plan**, not by hand during grill
  - `task.md` — checkable implementer work; written by **spec-plan**, executed by **spec-execute**
- `.agents/skills/spec-grill-me/`, `spec-plan/`, `spec-execute/` — the SDD skills

New folder names use the next unused 3-digit prefix, then a kebab-case slug (`NNN-kebab-slug`).

### Skills

Each skill must be invoked explicitly:

`/spec-grill-me @specs/NNN-slug/spec.md`

`/spec-plan @specs/NNN-slug/spec.md`

`/spec-execute @specs/NNN-slug/task.md`

- **spec-grill-me** — questions in rounds, then updates `spec.md` in place until Requirements and Out of scope are implementable. Does not implement. Does not create `plan.md` or `task.md`.
- **spec-plan** — reads an implementable `spec.md` and writes colocated `plan.md` and `task.md`. Does not implement. Does not edit the spec. If those files already exist, ask before overwriting.
- **spec-execute** — implements remaining unchecked items in `task.md` in order (including Verify) and marks them `[x]` as it goes. Does not rewrite spec, plan, or tasks (except checkboxes).

If `spec.md` is still too vague, **spec-plan** should stop and tell you to run **spec-grill-me** first. If `task.md` is missing or too vague, **spec-execute** should stop and tell you to run **spec-plan** first.

### Add-a-feature process

Always this order; do not skip **spec-grill-me**.

1. Copy `specs/spec_template.md` to `specs/NNN-kebab-slug/spec.md` and draft the headings (can be rough).
2. Run **spec-grill-me** on that spec until Requirements and Out of scope are specific enough to implement without guessing (or stop is prompted).
3. Run **spec-plan** on that spec → `plan.md` and `task.md`.
4. Run **spec-execute** on that spec’s `task.md` → implement remaining tasks, including Verify.
5. Encode only **durable** conventions in `AGENTS.md` (leave the Next.js block at the bottom unchanged). Do not dump the whole spec into `AGENTS.md`.

One skill at a time. Do not hand-write `plan.md` / `task.md` instead of **spec-plan**.
