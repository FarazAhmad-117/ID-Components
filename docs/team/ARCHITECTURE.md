# ID-Components — Architecture

> **Status:** Living document — update when structure changes materially.  
> **Owner:** Core team  
> **Last reviewed:** 2026-05

---

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [Architecture Pattern](#2-architecture-pattern)
3. [Repository Structure](#3-repository-structure)
4. [Distribution Model — shadcn Registry](#4-distribution-model--shadcn-registry)
5. [Package Design](#5-package-design)
6. [Component Category System](#6-component-category-system)
7. [Motion System Design](#7-motion-system-design)
8. [Token System](#8-token-system)
9. [Build Pipeline](#9-build-pipeline)
10. [Migration: Current → Target Architecture](#10-migration-current--target-architecture)
11. [Adding a New Component — End-to-End Workflow](#11-adding-a-new-component--end-to-end-workflow)
12. [Quality Standards](#12-quality-standards)
13. [What Is NOT Allowed](#13-what-is-not-allowed)

---

## 1. What This Project Is

**ID-Components** is a **shadcn-compatible code registry** — a curated collection of
accessible, animated, and performance-first React components that developers install
into their own projects via the shadcn CLI.

Key differentiators:

- **Not an npm package library.** Users copy source code, not compiled dist.
- **Animation-first.** Every animated component has a `playful` and a `professional` motion personality.
- **Multi-engine motion.** Components can use GSAP, Framer Motion, or Three.js — consumers only install what their chosen components actually need.
- **Accessible by default.** Built on Radix UI primitives where non-trivial a11y is required.
- **Performance-conscious.** Lazy loading, tree-shaking, minimal runtime overhead, no style leaks.

User experience (external):

```bash
# One-line install of any component
npx shadcn@latest add https://id-components.dev/r/magnetic-button.json

# Or via namespace (after adding to components.json)
npx shadcn@latest add @id-components/magnetic-button
```

---

## 2. Architecture Pattern

This project does not follow MVC, DDD, or feature-based architecture in the application
sense — it is a **registry-based component distribution system**. The relevant patterns are:

### Registry Pattern
Each component is a self-describing unit with a JSON manifest (`registry-item.json`).
The registry is the source of truth for what can be installed, what files ship, and
what dependencies are needed. This is the same pattern used by shadcn/ui itself.

### Adapter Pattern (Motion)
Animation engines (GSAP, Framer Motion, Three.js) are never imported directly in
component code. All animation goes through `@id-components/motion`, which acts as
an adapter layer. Components call hooks; hooks call the engine. This means the
underlying engine can be changed or extended without touching component code.

### Headless + Styled Composition
Components split concerns into three layers:
1. **Structure/behavior** — Radix UI primitive (or native HTML for simple elements)
2. **Styling** — `cva()` variants composed via `cn()` using Tailwind v4
3. **Motion** — a hook from `@id-components/motion`

### Monorepo (pnpm + Turborepo)
All packages and apps live in one repo, share tooling, and have a clear build
dependency graph. The registry source is the monorepo; the public registry is the
built + deployed output.

---

## 3. Repository Structure

```
id-components/                        ← monorepo root
│
├── docs/                             ← team documentation (you are here)
│   └── team/
│       ├── ARCHITECTURE.md           ← this file
│       └── DECISIONS.md              ← all architectural decisions + reasoning
│
├── apps/
│   ├── docs/                         ← public documentation website (Next.js 15 + Fumadocs)
│   │   ├── app/                      ← Next.js App Router pages
│   │   ├── content/docs/             ← MDX component docs
│   │   │   └── components/           ← one .mdx per component
│   │   ├── components/               ← docs UI (not the library components)
│   │   ├── public/
│   │   │   └── r/                    ← ← ← BUILT REGISTRY JSON FILES (served here)
│   │   ├── globals.css               ← Tailwind + tokens
│   │   └── next.config.ts            ← registry content negotiation rewrites
│   │
│   └── storybook/                    ← team dev sandbox (never shipped to users)
│       ├── .storybook/
│       └── stories/                  ← one .stories.tsx per component
│
├── packages/
│   ├── core/                         ← @id-components/core
│   │   └── src/
│   │       ├── components/
│   │       │   ├── base/             ← Tailwind-only (no animation deps)
│   │       │   ├── gsap/             ← GSAP-animated components
│   │       │   ├── framer/           ← Framer Motion components  [Phase 2]
│   │       │   └── three/            ← Three.js / R3F 3D components  [Phase 3]
│   │       └── index.ts              ← barrel export for Storybook/docs consumption
│   │
│   ├── motion/                       ← @id-components/motion
│   │   └── src/
│   │       ├── context/              ← MotionProvider, MotionIntent, useMotion
│   │       ├── hooks/
│   │       │   ├── gsap/             ← useButtonMotion, useTimeline, useScrollReveal…
│   │       │   ├── framer/           ← [Phase 2]
│   │       │   └── three/            ← [Phase 3]
│   │       └── index.ts
│   │
│   ├── tokens/                       ← @id-components/tokens
│   │   └── src/
│   │       ├── tokens.ts             ← SINGLE SOURCE OF TRUTH for all design tokens
│   │       ├── build.ts              ← generates tokens.css + index.ts from tokens.ts
│   │       ├── tokens.css            ← [generated] Tailwind v4 @theme block
│   │       └── index.ts              ← [generated] typed JS object exports
│   │
│   └── utils/                        ← @id-components/utils
│       └── src/
│           └── index.ts              ← cn() and shared helpers
│
├── registry/                         ← shadcn registry source (component manifests)
│   └── idc/                          ← our registry style name
│       ├── button/
│       │   └── registry-item.json    ← per-component manifest
│       ├── magnetic-button/
│       │   └── registry-item.json
│       └── …
│
├── examples/                         ← runnable framework integration examples
│   ├── nextjs/                       ← [Phase 2]
│   └── vite/                         ← [Phase 2]
│
├── registry.json                     ← master registry index (auto-generated by shadcn build)
├── turbo.json                        ← Turborepo task pipeline
├── biome.json                        ← lint + format config
├── tsconfig.base.json                ← shared TypeScript baseline
└── pnpm-workspace.yaml
```

### Why this structure?

- `apps/docs` doubles as the **registry host** — it serves `public/r/*.json` files over HTTP.
  The docs site and registry are the same deployed URL.
- `packages/core` is the **authoring source** — components are written here and referenced
  by `registry/idc/*/registry-item.json` manifests.
- `registry/` holds only JSON manifests, never component source. The manifests point back to
  `packages/core/src/` for the actual files.
- `docs/team/` keeps internal documentation separate from the public `apps/docs/` site.

---

## 4. Distribution Model — shadcn Registry

### How It Works

```
Developer's project                    Our registry (id-components.dev)
─────────────────                      ─────────────────────────────────
components.json                        registry.json  (index)
  └─ registries:                       public/r/
       @id-components →                  magnetic-button.json
       https://id-components.dev/r/      button.json
       {name}.json                        …

npx shadcn@latest add @id-components/magnetic-button
  │
  ├─ Fetches: id-components.dev/r/magnetic-button.json
  ├─ Reads: files[], dependencies[], registryDependencies[]
  ├─ Copies: MagneticButton.tsx → src/components/ui/magnetic-button.tsx
  └─ Installs: gsap, @gsap/react (only what this component needs)
```

### Registry Item Schema (per component)

Each `registry/idc/<name>/registry-item.json` follows the official shadcn schema:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "magnetic-button",
  "type": "registry:component",
  "title": "Magnetic Button",
  "description": "A button with a cursor-tracking magnetic hover effect using GSAP.",
  "author": "ID Components <https://id-components.dev>",
  "dependencies": ["gsap", "@gsap/react"],
  "registryDependencies": [],
  "files": [
    {
      "path": "registry/idc/magnetic-button/magnetic-button.tsx",
      "type": "registry:component",
      "target": "components/ui/magnetic-button.tsx"
    }
  ],
  "tags": ["button", "gsap", "animation", "magnetic"]
}
```

### User Installation Command

```bash
# Direct URL (always works)
npx shadcn@latest add https://id-components.dev/r/magnetic-button.json

# Namespace (after one-time setup in components.json)
npx shadcn@latest add @id-components/magnetic-button
```

### Setting Up the Namespace (User's components.json)

```json
{
  "$schema": "https://ui.shadcn.com/schema/components.json",
  "registries": {
    "@id-components": "https://id-components.dev/r/{name}.json"
  }
}
```

### Do We Write Components From Scratch or Use shadcn as a Base?

**We write our own components from scratch.** We are not wrapping shadcn/ui components.

We share the **same distribution mechanism** (the shadcn CLI + registry system) but our
component implementations are fully our own. The CLI is a tool, not a dependency.

Reasoning: Our components have animation as a first-class feature. Wrapping shadcn Button
and adding GSAP on top creates fragile coupling and restricts our API design. Writing
from scratch (on Radix UI primitives) gives full control.

---

## 5. Package Design

### `@id-components/core`

The authoring source for all components. Also compiled (via tsup) for Storybook and
docs to render live demos without file-copying.

**Key rules:**
- All animation deps are `optionalPeerDependencies`
- No `gsap`, `motion`, or `three` imports in component files — hooks only
- `sideEffects: ["**/*.css"]` to protect CSS from tree-shaking

```json
{
  "peerDependencies": {
    "react": ">=19.0.0",
    "gsap": ">=3.0.0",
    "motion": ">=11.0.0",
    "three": ">=0.170.0"
  },
  "peerDependenciesMeta": {
    "gsap":   { "optional": true },
    "motion": { "optional": true },
    "three":  { "optional": true }
  }
}
```

### `@id-components/motion`

Adapter layer. All animation logic lives here. Components in `core` call hooks from
this package — they never import animation libraries directly.

**Build dependency order:**
```
tokens → utils → motion → core → apps
```

### `@id-components/tokens`

Single source of truth for all design tokens. A build script generates both CSS and TS
outputs. **Never manually edit** `tokens.css` or `index.ts` — edit `tokens.ts` only.

### `@id-components/utils`

Shared utility functions. Currently: `cn()` (clsx + tailwind-merge). Kept separate so
it can be `registryDependency` of any component without pulling in motion or tokens.

---

## 6. Component Category System

Every component belongs to exactly one category, determined by its animation engine:

| Category | Folder | Animation engine | Extra peer deps |
|---|---|---|---|
| **Base** | `src/components/base/` | CSS Tailwind only | none |
| **GSAP** | `src/components/gsap/` | GSAP | `gsap`, `@gsap/react` |
| **Framer** | `src/components/framer/` | Framer Motion | `motion` |
| **Three** | `src/components/three/` | Three.js + R3F | `three`, `@react-three/fiber`, `@react-three/drei` |

The category determines:
1. Which peer deps the registry item declares in `dependencies[]`
2. Which motion hooks are imported
3. Whether SSR guards (`ssr: false`, dynamic imports) are needed (Three.js: always)

### Compound Component Convention

Components with multiple sub-parts use the dot-notation pattern:

```tsx
// Usage
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Open</Button>
  </Dialog.Trigger>
  <Dialog.Content>...</Dialog.Content>
</Dialog.Root>

// Export shape
export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
};
```

### Per-Component Folder Anatomy

```
packages/core/src/components/gsap/MagneticButton/
  MagneticButton.tsx        ← component (forwardRef, cva, cn, Radix if needed)
  MagneticButton.test.tsx   ← Vitest + Testing Library + vitest-axe
  index.ts                  ← barrel: export { MagneticButton } from './MagneticButton'

registry/idc/magnetic-button/
  registry-item.json        ← shadcn registry manifest for this component

apps/storybook/stories/
  MagneticButton.stories.tsx

apps/docs/content/docs/components/
  magnetic-button.mdx
```

---

## 7. Motion System Design

### MotionProvider

Wrap the app once. Components inherit intent from context:

```tsx
// User's app root
<MotionProvider intent="playful">
  <App />
</MotionProvider>

// Override per component
<Button intent="professional">Save changes</Button>
```

Two intents:
- **`playful`** — elastic easings, springy feel, magnetic effects
- **`professional`** — power easings, tight and efficient

### Reduced Motion

`MotionProvider` subscribes to `prefers-reduced-motion` as a reactive state:

```tsx
useEffect(() => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}, []);
```

When `reducedMotion` is `true`, all motion hooks return empty handlers. Components
never need to check this themselves.

### The Adapter Rule

```
✅ CORRECT:  Component → hook from @id-components/motion → gsap.to(el, {...})
❌ WRONG:    Component → import gsap from 'gsap' → gsap.to(el, {...})
```

This rule allows motion engine upgrades, alternative implementations, or SSR mocks
without touching any component.

### Hook Naming Convention

```
use<ComponentName>Motion    ← per-component interaction hooks
useTimeline                 ← for sequential/complex animations
useScrollReveal             ← scroll-triggered entrance
```

---

## 8. Token System

All design tokens are defined once in `packages/tokens/src/tokens.ts`.
A build step generates the two consuming formats:

```
tokens.ts (source)
  │
  ├── tokens.css   → @theme { --color-accent-600: #2563eb; … }  (Tailwind v4 CSS-first)
  └── index.ts     → export const colors = { accent: { 600: '#2563eb' } }  (typed JS)
```

### Consuming Tokens

In component CSS classes:
```tsx
className="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)]"
```

In Tailwind utilities (tokens registered in `@theme` are available as Tailwind classes):
```tsx
className="bg-accent-600 hover:bg-accent-700"
```

In GSAP animations (via TS token object):
```ts
import { colors } from '@id-components/tokens';
gsap.to(el, { backgroundColor: colors.accent[600] });
```

---

## 9. Build Pipeline

### Turbo Task DAG

```
tokens:build
  └── utils:build
        └── motion:build
              └── core:build
                    ├── storybook (dev/build)
                    └── docs:build
                          └── registry:build  ← generates public/r/*.json
```

### Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Watch mode for all packages + dev server for apps |
| `pnpm build` | Production build all packages and apps |
| `pnpm test` | Vitest across all packages |
| `pnpm typecheck` | tsc --noEmit workspace-wide |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format --write |
| `pnpm storybook` | Storybook dev server |
| `pnpm docs:dev` | Documentation site dev server |
| `pnpm registry:build` | Build registry JSON from registry.json manifests |

### Registry Build

The `apps/docs` package includes a `registry:build` script that runs `shadcn build`.
This reads `registry.json` at the repo root and generates `apps/docs/public/r/*.json`.
When deployed to Vercel, those files are served at `https://id-components.dev/r/*.json`.

---

## 10. Migration: Current → Target Architecture

This section tracks the exact steps to move from the current state to the target
architecture. Each step is ordered — do not skip ahead.

### Phase 0 — Foundation Fixes (do these first, before any new components)

**Step 0.1 — Fix `reducedMotion` reactivity**
- File: `packages/motion/src/context/motion-context.tsx`
- Change: Replace `window.matchMedia(...).matches` with `useState` + `useEffect` subscriber

**Step 0.2 — Fix Storybook CSS (tokens not loaded)**
- File: `apps/storybook/globals.css`
- Change: Add `@import "@id-components/tokens/tokens.css"` and `@source` directives

**Step 0.3 — Fix `sideEffects` in core package.json**
- File: `packages/core/package.json`
- Change: `"sideEffects": false` → `"sideEffects": ["**/*.css"]`

**Step 0.4 — Reorganize motion package into context/ + hooks/gsap/**
- Move: `motion-context.tsx` → `context/motion-context.tsx`
- Move: `useButtonMotion.ts` → `hooks/gsap/useButtonMotion.ts`
- Move: `index.tsx` → `index.ts` (update all imports)

**Step 0.5 — Reorganize core components into category sub-folders**
- Move: `components/Button/` → `components/base/Button/`
- Update: `packages/core/src/index.ts` import path

### Phase 1 — Registry Infrastructure

**Step 1.1 — Add `registry/` folder + shadcn build tooling**
- Create: `registry/idc/` directory
- Create: `registry.json` at repo root (shadcn schema)
- Add: `pnpm add shadcn@latest` to `apps/docs` devDependencies
- Add: `"registry:build": "shadcn build"` script to `apps/docs/package.json`
- Add: `registry:build` task to `turbo.json`

**Step 1.2 — Create registry manifest for existing Button**
- Create: `registry/idc/button/registry-item.json`
- Test: `pnpm registry:build` → verify `apps/docs/public/r/button.json` is generated

**Step 1.3 — Configure content negotiation in docs**
- File: `apps/docs/next.config.ts`
- Add: HTTP rewrite rules so CLI requests to root get JSON, browsers get HTML

**Step 1.4 — Add token build script**
- Create: `packages/tokens/src/build.ts`
- Update: `packages/tokens/package.json` build script
- Delete: hand-maintained `tokens.css` and `index.ts` (they become generated outputs)
- Add: `registry:build` after `tokens:build` in Turbo DAG

**Step 1.5 — Add `@id-components` namespace docs**
- Document: user-facing "Getting Started" guide in `apps/docs/content/docs/getting-started.mdx`
- Include: how to add namespace to `components.json`, first install command

### Phase 2 — Scale & Examples

**Step 2.1 — Component scaffolding script**
- Create: `scripts/scaffold-component.ts` (generates all 5 files per new component)
- Add: `"scaffold": "tsx scripts/scaffold-component.ts"` root script

**Step 2.2 — Framework examples**
- Create: `examples/nextjs/` — minimal Next.js 15 app using @id-components
- Create: `examples/vite/` — minimal Vite + React app using @id-components

**Step 2.3 — Framer Motion adapter (when first Framer component is needed)**
- Create: `packages/motion/src/hooks/framer/` adapter hooks
- Create: `packages/core/src/components/framer/` category folder

**Step 2.4 — Three.js adapter (when first 3D component is needed)**
- Create: `packages/motion/src/hooks/three/` adapter hooks
- Create: `packages/core/src/components/three/` category folder
- Ensure all Three.js components use `dynamic(() => import(...), { ssr: false })`

---

## 11. Adding a New Component — End-to-End Workflow

Follow this sequence for every new component without exception:

```
Step 1 — Determine category
         Does it need GSAP?          → gsap/
         Does it need Framer Motion? → framer/
         Does it need Three.js?      → three/
         No animation deps?          → base/

Step 2 — Create component folder
         packages/core/src/components/<category>/<Name>/
           <Name>.tsx
           <Name>.test.tsx
           index.ts

Step 3 — Write the component
         ✅ React.forwardRef
         ✅ displayName = '<Name>'
         ✅ Accept className prop
         ✅ cva() for all variants (no inline ternary class strings)
         ✅ cn() from @id-components/utils
         ✅ Radix primitive if a11y is non-trivial
         ✅ Hook from @id-components/motion for animation (never direct engine import)
         ✅ data-idc-<component> attribute for styling/testing targeting

Step 4 — Write the motion hook (if animated)
         packages/motion/src/hooks/<engine>/use<Name>Motion.ts

Step 5 — Write tests
         packages/core/src/components/<category>/<Name>/<Name>.test.tsx
         Tests must cover: render, props, user interaction, a11y (vitest-axe)

Step 6 — Write Storybook story
         apps/storybook/stories/<Name>.stories.tsx
         Stories must show: playful intent, professional intent, all variants, disabled

Step 7 — Write the registry manifest
         registry/idc/<kebab-name>/registry-item.json
         Declare: name, type, title, description, files[], dependencies[], registryDependencies[]

Step 8 — Write the docs MDX page
         apps/docs/content/docs/components/<kebab-name>.mdx
         Include: description, live demo, copy-paste install command, props table, variants

Step 9 — Export from core barrel
         packages/core/src/index.ts → add export

Step 10 — Run full verification
          pnpm build && pnpm test && pnpm typecheck && pnpm lint && pnpm registry:build
          Verify generated JSON at: apps/docs/public/r/<name>.json
```

---

## 12. Quality Standards

### TypeScript

- Strict mode is non-negotiable (`strict: true`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`)
- No `any` without an inline comment explaining why it's unavoidable
- All public APIs must be fully typed and exported

### Accessibility

- Keyboard navigation: every interactive element reachable and operable via keyboard
- ARIA: correct roles, labels, descriptions — use Radix for anything non-trivial
- Focus management: dialogs trap focus; menus return focus on close
- Color contrast: WCAG AA minimum (4.5:1 text, 3:1 large text)
- Reduced motion: `MotionProvider` handles this centrally — no per-component checks needed

### Performance

- No animation library imported unless that component is used
- Three.js components: always lazy-loaded, always `ssr: false`
- CSS transitions for micro-states (hover background, border color) — GSAP only for complex sequences
- Zero layout shift from animations (use `transform` and `opacity` only — never `top/left/width/height`)

### Component API Conventions

- `className` always accepted and merged via `cn()`
- `asChild` pattern via Radix `Slot` for polymorphic elements
- `intent` prop to override `MotionProvider` intent locally
- `data-idc-[component]` attribute for external targeting
- Event handlers composed (internal + external), never overridden

---

## 13. What Is NOT Allowed

| Rule | Reason |
|---|---|
| No `tailwind.config.js` anywhere | Tailwind v4 is CSS-first; config file defeats the purpose |
| No direct `gsap` / `motion` / `three` imports in `packages/core` | Breaks the adapter pattern; use hooks from `@id-components/motion` |
| No CSS-in-JS (styled-components, Emotion, vanilla-extract) | Style leaks, SSR issues, conflicts with consumer apps |
| No `any` in TypeScript without a comment | Defeats strict typing |
| No inline conditional class strings `cn(x ? 'a' : 'b')` | Use `cva()` variants instead |
| No manual edits to generated `tokens.css` or `index.ts` | They are generated; edits will be overwritten |
| No Husky, commitlint, or semantic-release | Tooling bloat; not needed at this stage |
| No component that imports from another component's internal folder | Use barrel `index.ts` only |
