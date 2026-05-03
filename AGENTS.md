# ID-Components — Agent Instructions

> Framework-agnostic. Claude, Cursor, Copilot, and other AI agents should follow these conventions.

## Project Overview

ID-Components is an open-source React UI component library powered by GSAP animations.
It ships with two motion personalities:

- **`playful`** (default) — springy, expressive micro-interactions with elastic easings
- **`professional`** (opt-in via `intent="professional"`) — tight, efficient motion with power easings

Components are headless-a11y-first (Radix UI), typed strictly (TypeScript), and styled with
Tailwind v4 utilities. All motion goes through a central `MotionProvider` — never `gsap` directly.

Tagline: *"GSAP-native React components with motion personality."*

## Stack

| Tool | Version | Purpose |
|---|---|---|
| pnpm | 9.x | Package manager |
| Turborepo | 2.x | Monorepo task runner |
| TypeScript | 5.x (strict) | Type system |
| React | 19 | UI library |
| GSAP | 3.x | Animation engine |
| @gsap/react | 2.x | GSAP React hooks |
| Tailwind CSS | v4 | Utility styling (CSS-first) |
| Radix UI | latest | Headless a11y primitives |
| class-variance-authority | 0.7.x | Variant management |
| clsx + tailwind-merge | latest | Class utilities |
| tsup | 8.x | Package bundler |
| Vitest | 2.x | Unit tests |
| Storybook | 8.x | Component dev |
| Fumadocs | 14.x | Docs site |
| Biome | 1.x | Lint + format |

## Repository Layout

```
apps/docs         — Fumadocs documentation site (Next.js 15, App Router)
apps/storybook    — Storybook 8 playground
packages/core     — @id-components/core: production components
packages/motion   — @id-components/motion: MotionProvider, hooks, presets
packages/tokens   — @id-components/tokens: design tokens (CSS vars + TS)
packages/utils    — @id-components/utils: cn() and shared helpers
examples/         — runnable examples (empty initially)
```

## Conventions

### Styling

- Tailwind v4 utilities **only**. No `tailwind.config.js` anywhere — ever.
- Theme tokens live in `packages/tokens/src/tokens.css` via `@theme {}`.
- Consume tokens through CSS variables: `var(--color-accent-500)`, `var(--radius-md)`.
- Global CSS entry: `@import 'tailwindcss';` then import the tokens CSS.

### Components

- Every component: `React.forwardRef`, set `displayName`, accept `className` prop.
- Variants only via `cva()`. No inline conditional class strings (`cn(variant ? 'a' : 'b')`).
- Always use `cn()` from `@id-components/utils` for merging classes.
- TypeScript strict — no `any`, no type assertions unless unavoidable with a comment.
- Build on Radix UI primitives where a11y-critical (buttons, dialogs, tooltips, etc.).

### Motion

- **Never import `gsap` directly** in `packages/core` components.
- Always consume via `useTimeline()` + motion presets from `@id-components/motion`.
- `prefers-reduced-motion` is handled centrally in `MotionProvider` — the `reducedMotion` flag
  is available via `useMotion()`. When `true`, skip all GSAP calls.
- Default intent is `'playful'`. `intent="professional"` is the explicit opt-out.
- Motion presets define durations and easings only — components own the `gsap.to()` calls.

### Accessibility

- Keyboard navigation and ARIA are non-negotiable.
- All interactive components must be fully keyboard-operable.
- Run Storybook a11y addon for every new component story.
- Focus management must be explicit on dialogs, menus, and overlays.

## Definition of Done (per component)

- [ ] TypeScript types exported from `packages/core`
- [ ] Storybook story showing both `playful` and `professional` intent
- [ ] Vitest unit test (render, interaction, a11y check with `@testing-library`)
- [ ] Docs MDX page under `apps/docs/content/docs/components/`
- [ ] a11y audit passed (keyboard nav + screen reader)
- [ ] Both intents visually demonstrated

## What NOT To Do

- Do not add Husky, lint-staged, changesets, commitlint, or semantic-release.
- Do not introduce CSS-in-JS (styled-components, Emotion, vanilla-extract).
- Do not import `gsap` directly in `packages/core` — always go through `@id-components/motion`.
- Do not add a `tailwind.config.js` or `tailwind.config.ts` anywhere.
- Do not use `any` in TypeScript without an explanatory comment.
- Do not bypass `MotionProvider` for animations.
- Do not add new tooling to the stack without raising it in the PR description first.
