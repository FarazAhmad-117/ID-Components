# ID-Components — Project overview for AI / contributors

This file is a **high-level map** of the repository. Authoritative conventions live in [AGENTS.md](./AGENTS.md). Use this document to orient quickly; do not treat it as a substitute for `AGENTS.md` or package-level `README`s.

## What this repo is

**ID-Components** is an open-source **React 19** UI kit with **GSAP**-driven motion, shipped as versioned packages in a **pnpm + Turborepo** monorepo. Components are **Radix**-based for accessibility, styled with **Tailwind CSS v4** (CSS-first, no `tailwind.config.*`), and animated only through **`@id-components/motion`** (not raw `gsap` in `packages/core`).

Two motion “intents”:

- **`playful`** (default) — expressive, springy micro-interactions  
- **`professional`** — tighter motion via `intent="professional"`

## Stack (short)

| Area | Choice |
|------|--------|
| Monorepo | pnpm workspaces + Turborepo |
| UI | React 19, Radix, CVA, `cn()` from `@id-components/utils` |
| Styling | Tailwind v4; tokens in `@id-components/tokens` (`@theme` + CSS variables) |
| Motion | GSAP + `@gsap/react` behind `MotionProvider` (`@id-components/motion`) |
| Library build | tsup → ESM `dist/` per package |
| Tests | Vitest + Testing Library (per package) |
| Lint / format | Biome only |
| Docs | Next.js 15 App Router + Fumadocs (`apps/docs`) |
| Playground | Storybook 8 (`apps/storybook`) |

## Repository layout

Omitted on purpose: `node_modules/`, `.next/`, `dist/` (unless noted), `.turbo/`, lockfile internals.

```
ID-Components/
├── AGENTS.md                 # Single source of truth for agent + human conventions
├── CLAUDE.md                 # Claude-specific workflow hints (references AGENTS.md)
├── biome.json                # Lint + format
├── LICENSE
├── package.json              # Root scripts; devDependencies turbo, biome, typescript
├── pnpm-workspace.yaml       # workspaces: apps/*, packages/*, examples/*
├── tsconfig.base.json        # Shared TS baseline
├── turbo.json                # Pipeline: build, dev, test, lint, typecheck, storybook, docs:dev
│
├── apps/
│   ├── docs/                 # @id-components/docs — documentation site (Next.js + Fumadocs)
│   │   ├── app/
│   │   │   ├── layout.tsx               # Root layout; RootProvider (fumadocs-ui)
│   │   │   ├── page.tsx                 # Landing → /docs
│   │   │   └── docs/
│   │   │       ├── layout.tsx           # Docs shell (sidebar, nav)
│   │   │       └── [[...slug]]/
│   │   │           └── page.tsx         # Dynamic doc pages from content
│   │   ├── content/docs/               # MDX content + meta.json
│   │   ├── lib/source.ts               # Fumadocs loader + baseUrl /docs
│   │   ├── source.config.ts            # MDX/content pipeline config
│   │   ├── globals.css                  # Tailwind + tokens imports
│   │   ├── next.config.ts               # createMDX() wrapper from fumadocs-mdx
│   │   ├── instrumentation.ts         # Startup hook (see troubleshooting below)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── storybook/            # SB 8; stories consume @id-components/core
│       ├── .storybook/
│       ├── stories/
│       ├── globals.css
│       └── package.json
│
├── packages/
│   ├── core/                 # @id-components/core — public components API
│   │   └── src/
│   │       ├── components/   # e.g. Button/
│   │       └── index.ts
│   ├── motion/               # @id-components/motion — MotionProvider + hooks/presets
│   ├── tokens/               # @id-components/tokens — CSS tokens + TS exports (built tokens.css)
│   └── utils/                # @id-components/utils — `cn()`, shared helpers
│
├── examples/
│   └── .gitkeep               # Runnable examples placeholder
│
├── .cursor/
│   └── rules/                 # Editor rules (e.g. Tailwind v4, AGENTS pointer)
└── .github/                   # CI / GitHub automation (if present)
```

## Published package names

| Path | npm name |
|------|----------|
| `packages/core` | `@id-components/core` |
| `packages/motion` | `@id-components/motion` |
| `packages/tokens` | `@id-components/tokens` |
| `packages/utils` | `@id-components/utils` |

Workspace protocol: internal deps use `workspace:*` in `package.json`.

## Root scripts (from `package.json`)

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Turbo `dev` (package dev tasks) |
| `pnpm build` | Build all packages/apps that define `build` |
| `pnpm typecheck` | Typecheck across workspace |
| `pnpm lint` / `pnpm format` | Biome |
| `pnpm test` | Tests via Turbo |
| `pnpm storybook` | Storybook |
| `pnpm docs:dev` | Docs dev server (`apps/docs`) |

## Definition of done (component work)

When adding or changing a component in `packages/core`, expect (per [AGENTS.md](./AGENTS.md)):

- Exported types from `@id-components/core`
- Storybook stories for `playful` and `professional` intent
- Vitest test (render, interaction, a11y)
- MDX page under `apps/docs/content/docs/components/`
- Keyboard + screen reader pass; both intents visible in Storybook

## Docs app: content and routing

- **Content**: `apps/docs/content/docs/**/*.mdx` plus `meta.json` for nav.
- **Source**: `apps/docs/lib/source.ts` uses generated `@/.source` (Fumadocs) and `baseUrl: '/docs'`.
- **Framework**: Next.js App Router; MDX via `fumadocs-mdx/next`.

## Troubleshooting: `localStorage.getItem is not a function` (docs / Next)

**Symptom**: Next dev or prerender throws `TypeError: localStorage.getItem is not a function`, often with a Node warning that `--localstorage-file` was provided without a valid path.

**Cause**: Node’s experimental Web Storage can expose a **broken** `globalThis.localStorage` when flags are malformed. **`fumadocs-ui`** uses **`next-themes`**, which reads `localStorage` during SSR in some setups; a non-compliant object triggers that error.

**What we do in-repo**: `apps/docs/instrumentation.ts` runs at server startup and **removes** `localStorage` from `globalThis` (and from a shimmed `globalThis.window`) when `getItem` is not a function.

**What you should still check locally**: Inspect **`NODE_OPTIONS`** (and IDE / terminal tooling) for stray `--experimental-webstorage`, `--localstorage-file`, or incomplete values; fix or remove them so Node is not injecting invalid storage globals.

---

*Last synced with repo layout conventions in [AGENTS.md](./AGENTS.md). Regenerate structural details here if folders move materially.*
