# ID-Components — Decision Log

> Every significant architectural decision made in this project, with full context.
> When you're confused about WHY something is the way it is, read this file.
> When you make a significant new decision, add it here.

**Format per entry:**
- **Status:** Decided ✅ | Deferred ⏸ | Superseded ❌
- **Context:** What situation prompted this decision
- **Decision:** What was chosen
- **Reasoning:** Why this was chosen over alternatives
- **Consequences:** What this implies for the codebase going forward

---

## Index

| # | Topic | Status |
|---|---|---|
| [ADR-001](#adr-001--distribution-model-shadcn-registry-over-npm) | Distribution model: shadcn registry over npm | ✅ Decided |
| [ADR-002](#adr-002--we-write-components-from-scratch-not-wrapping-shadcn) | Components from scratch, not wrapping shadcn | ✅ Decided |
| [ADR-003](#adr-003--single-core-package-with-category-sub-folders) | Single `core` package with category sub-folders | ✅ Decided |
| [ADR-004](#adr-004--motion-adapter-pattern-in-idcomponentsmotion) | Motion adapter pattern | ✅ Decided |
| [ADR-005](#adr-005--multi-engine-animation-gsap--framer-motion--threejs) | Multi-engine animation strategy | ✅ Decided |
| [ADR-006](#adr-006--token-build-pipeline-single-source-of-truth) | Token build pipeline | ✅ Decided |
| [ADR-007](#adr-007--radix-ui-for-a11y-critical-components) | Radix UI for accessibility primitives | ✅ Decided |
| [ADR-008](#adr-008--tailwind-v4-css-first-no-config-file) | Tailwind v4 CSS-first | ✅ Decided |
| [ADR-009](#adr-009--biome-for-lint--format) | Biome for lint + format | ✅ Decided |
| [ADR-010](#adr-010--storybook-is-a-dev-tool-not-public-facing) | Storybook as internal dev tool | ✅ Decided |
| [ADR-011](#adr-011--fumadocs-for-the-documentation-site) | Fumadocs for documentation | ✅ Decided |
| [ADR-012](#adr-012--versioning-strategy) | Versioning strategy | ⏸ Deferred |
| [ADR-013](#adr-013--visual-regression-testing) | Visual regression testing | ⏸ Deferred |
| [ADR-014](#adr-014--testing-approach) | Testing approach | ✅ Decided |
| [ADR-015](#adr-015--three-js-components-always-lazy-loaded) | Three.js lazy loading | ✅ Decided |
| [ADR-016](#adr-016--keep-current-repo-convert-dont-restart) | Keep current repo, convert in phases | ✅ Decided |

---

## ADR-001 — Distribution Model: shadcn Registry over npm

**Status:** ✅ Decided

**Context:**
We needed to decide how users install and consume our components. The two primary
options were: (a) publish to npm and users run `npm install @id-components/core`,
or (b) use the shadcn registry model where users copy source files via CLI.

**Decision:**
We use the **shadcn registry distribution model**.

Users run:
```bash
npx shadcn@latest add @id-components/magnetic-button
```

This copies the component source into their project. They own the code.

**Reasoning:**

The npm install model was rejected for the following reasons:

1. **Ownership.** npm packages are black boxes. Users cannot meaningfully modify them without forking. For animated/3D components, tweaking animation parameters is the norm, not the exception. The copy-install model makes this natural.

2. **Selective peer deps.** A user adding only `Badge` (Tailwind-only) should not need to install gsap, motion, and three. With a compiled package, all peer deps are declared at package level. With the registry model, each component declares only its own deps in its manifest — the CLI installs only those.

3. **Style isolation.** npm-distributed CSS (even Tailwind) can conflict with consumer apps' styles. Since our components use Tailwind classes that live in the consumer's own CSS pipeline, there's no style leakage or specificity conflict.

4. **No version lock-in.** After a copy-install, the component is in the user's repo. They don't need to upgrade our package to get a security fix — they own the file. This is different from npm where an outdated dependency is a maintenance burden.

5. **Framework agnosticism.** The registry model works with any React framework — Next.js, Vite, Remix, Astro — without framework-specific builds or SSR considerations in our publish pipeline.

6. **Industry trend.** Aceternity UI, Magic UI, Origin UI, and others have validated this model for animation-heavy component collections.

**Consequences:**
- We must maintain `registry.json` and per-component `registry-item.json` files
- The docs site also serves as the registry host (`apps/docs/public/r/`)
- No npm publish pipeline needed (at least for components)
- Supporting packages (`@id-components/motion`, `@id-components/tokens`) are still published to npm as true dependencies that users install

---

## ADR-002 — We Write Components From Scratch, Not Wrapping shadcn

**Status:** ✅ Decided

**Context:**
When adopting the shadcn distribution model, the question arose: do we take existing
shadcn/ui components and add animation on top, or do we write our own from scratch?

**Decision:**
We **write all components from scratch** on top of Radix UI primitives. We do not
wrap or re-export shadcn/ui component code.

**Reasoning:**

1. **API control.** shadcn Button has a specific API surface. Our Button needs different variants, different motion props, different event handler composition. Wrapping constrains us.

2. **Animation architecture.** GSAP animations require access to the DOM ref inside the component. If we wrap shadcn's compiled output, we cannot cleanly hook into its ref or event lifecycle.

3. **Dependency on an upstream.** If we base on shadcn components, every shadcn update is a potential breaking change for us. Writing our own removes this coupling.

4. **Same primitive, different implementation.** shadcn/ui also uses Radix UI. We use Radix UI directly. We share the primitive — not the styled output.

**What "shadcn distribution" means for us:**
We use the same CLI, the same registry protocol, and the same JSON schema. That's the
extent of the relationship. We are a **peer registry**, not a derivative.

**Consequences:**
- We must implement all component logic ourselves (no shortcuts from shadcn source)
- We have full design freedom on API, variants, and animation model
- Components may look similar to shadcn/ui visually but the code is independent

---

## ADR-003 — Single `core` Package with Category Sub-folders

**Status:** ✅ Decided

**Context:**
As we plan to support components using GSAP, Framer Motion, and Three.js, the question
was whether to split into separate packages (`core-gsap`, `core-framer`, `core-three`)
or keep one package with internal organization.

**Decision:**
Keep **one `packages/core`** package. Organize components into sub-folders by animation engine:
`base/`, `gsap/`, `framer/`, `three/`.

**Reasoning:**

1. **The CLI, not the package, manages dep selectivity.** The registry manifest per
   component (`registry-item.json`) lists which deps to install. Splitting packages
   doesn't add dep-selectivity that we don't already get from the manifest approach.

2. **Multiple packages = multiple build configs.** Four packages means four tsup
   configs, four `package.json` files to maintain, four sets of peer dep declarations,
   four entries in `pnpm-workspace.yaml`. For no user-facing benefit.

3. **Cross-engine components.** A future component might reasonably combine Framer
   Motion for layout animation and GSAP for a scroll timeline. With split packages,
   this creates an awkward cross-package dependency. With sub-folders, it's just
   two hook imports from `@id-components/motion`.

4. **The alternative is premature.** We can always split later if `packages/core`
   becomes truly unwieldy. Starting split adds complexity before we've validated the need.

**Consequences:**
- `packages/core/package.json` declares all animation peers as `optional peerDependencies`
- Internal category sub-folders provide developer navigation and make the category of
  each component immediately obvious
- The compiled `dist/` output is one bundle — Storybook and docs get all components;
  end users get only what they copy-install

---

## ADR-004 — Motion Adapter Pattern in `@id-components/motion`

**Status:** ✅ Decided

**Context:**
Components need animation. The question was whether to import animation libraries
directly in component files, or route all animation through an intermediate layer.

**Decision:**
All animation goes through **`@id-components/motion`** (the adapter layer).
Components in `packages/core` never import `gsap`, `motion`, or `three` directly.

**Reasoning:**

1. **Engine replaceability.** If we decide to swap GSAP for a different engine in a
   future version, we change the adapter hook — not every component. With direct imports,
   a migration would touch every animated component file.

2. **Centralized reduced-motion handling.** `MotionProvider` subscribes to
   `prefers-reduced-motion`. When `reducedMotion` is `true`, all hooks return empty
   handlers. No component needs its own media query check.

3. **Testability.** Tests can mock `@id-components/motion` hooks to test component
   behavior without GSAP needing a real browser rendering environment.

4. **MotionIntent consistency.** The `playful`/`professional` intent system is managed
   in `MotionProvider`. All hooks read intent from context. Without the adapter layer,
   each component would need to independently consume context.

**Consequences:**
- Every new animated component needs a corresponding hook in `packages/motion`
- The `motion` package must be published to npm (it's a real runtime dependency)
- Adding a new animation engine means adding a new hooks sub-folder in `motion/src/hooks/`

---

## ADR-005 — Multi-Engine Animation: GSAP + Framer Motion + Three.js

**Status:** ✅ Decided

**Context:**
Should the library commit to one animation engine, or support multiple?

**Decision:**
Support **multiple animation engines**. Different components use different engines
based on what the use case genuinely requires.

**Reasoning:**

| Engine | Strengths | Best used for |
|---|---|---|
| GSAP | Timeline control, scroll triggers, performance, DOM-level | Magnetic effects, scroll reveals, text animations, counters |
| Framer Motion | React-native API, layout animations, gesture-driven | Page transitions, drag-and-drop, list animations |
| Three.js + R3F | True 3D, GPU rendering, particle systems | 3D cards, holographic effects, particle fields |

Picking only one would mean either: using GSAP for layout animations (possible but awkward)
or using Framer Motion for DOM-level scroll-sequenced animations (painful). Picking the
right tool per component produces better outcomes.

**Consequences:**
- Users only install the engine(s) for the components they actually use
- `packages/motion` needs adapter hooks for each engine
- More complex peer dep management at the registry manifest level
- Three.js components must always be SSR-guarded (lazy imports, `ssr: false`)

---

## ADR-006 — Token Build Pipeline: Single Source of Truth

**Status:** ✅ Decided

**Context:**
`packages/tokens` currently has two manually-maintained files: `tokens.css` (CSS variables)
and `index.ts` (TypeScript object). They contain the same data and will drift.

**Decision:**
Define tokens **once** in `packages/tokens/src/tokens.ts` and generate both outputs
via a build script (`build.ts`).

```
tokens.ts → [build script] → tokens.css + index.ts
```

**Reasoning:**
Manual duplication across two files in different formats is a maintenance risk and
a source of bugs. A build pipeline eliminates the risk at the cost of a one-time
build step addition.

**Consequences:**
- `tokens.css` and `index.ts` become **generated files** — never manually edited
- `pnpm --filter @id-components/tokens build` must be run after token changes
- The Turbo DAG must ensure `tokens:build` runs before anything that depends on tokens

---

## ADR-007 — Radix UI for A11y-Critical Components

**Status:** ✅ Decided

**Context:**
Accessibility for interactive components (dialogs, menus, tooltips) requires significant
implementation: focus trapping, ARIA roles, keyboard navigation, screen reader announcements.
This can be written from scratch or sourced from a headless library.

**Decision:**
Use **Radix UI primitives** for all components where accessibility requires non-trivial behavior.

**When to use Radix:**
- Dialog, Sheet, Alert Dialog → focus trapping, Escape key, `role="dialog"`
- Dropdown Menu, Context Menu → keyboard navigation, `role="menu"`, `aria-expanded`
- Tooltip → hover delay, close on Escape, `role="tooltip"`
- Checkbox, Switch → `indeterminate` state, keyboard toggle
- Accordion, Collapsible → expand/collapse, `role="region"`
- Select → virtual list, keyboard type-ahead

**When NOT to use Radix:**
- Button → native `<button>` already has full a11y; only use `Slot` for `asChild`
- Badge, Label, Separator → semantic HTML is sufficient
- Any purely visual element

**Radix packages are installed per-component** in `registry-item.json` — not as a
blanket dependency. A user adding only Button does not install any Radix packages.

**Consequences:**
- Significantly less custom a11y code to write and test
- Radix Slot enables the `asChild` polymorphic pattern on all interactive components
- Radix is an optional peer dep listed in each component's registry manifest

---

## ADR-008 — Tailwind v4 CSS-First; No Config File Ever

**Status:** ✅ Decided

**Context:**
Tailwind v4 introduced a CSS-first configuration model. The question was whether to
keep using `tailwind.config.ts` (backward-compatible) or go fully CSS-first.

**Decision:**
**No `tailwind.config.js` or `tailwind.config.ts` anywhere in the repository. Ever.**

All Tailwind configuration is done via:
- `@import "tailwindcss"` in CSS entry files
- `@theme {}` in `tokens.css` for design token registration
- `@source` directives for scanning paths
- `@custom-variant` for custom variants (e.g., `.dark`)

**Reasoning:**
1. CSS-first is the Tailwind v4 canonical approach — using the JS config is a
   compatibility shim, not the intended model
2. CSS-first configuration works without a Node.js build step for configuration
3. Design tokens in `@theme` become Tailwind utilities automatically
4. No config = no config drift between packages

**Consequences:**
- All apps and packages that use Tailwind must have proper `@source` directives
- Token changes in `tokens.css` automatically become new Tailwind classes

---

## ADR-009 — Biome for Lint + Format

**Status:** ✅ Decided

**Context:**
The standard JavaScript ecosystem uses ESLint (lint) + Prettier (format) separately.
Biome is an emerging alternative that replaces both with one tool.

**Decision:**
Use **Biome only**. No ESLint, no Prettier, no `.eslintrc`, no `.prettierrc`.

**Reasoning:**
1. **Speed.** Biome is 50-100× faster than ESLint + Prettier in benchmarks
2. **One config.** `biome.json` at the repo root handles everything
3. **No plugin dependency hell.** ESLint configuration in monorepos typically requires
   careful peer dep management and often breaks across framework updates
4. **VCS integration.** Biome's `useIgnoreFile: true` respects `.gitignore` natively

**Trade-off:** Biome does not support all ESLint plugins (no eslint-plugin-react-hooks
rule parity at time of decision). This is an acceptable trade-off given the speed gain.

**Consequences:**
- All developers must have Biome extension installed in their editor
- CI runs `biome check .` — format violations and lint errors both fail the build

---

## ADR-010 — Storybook Is a Dev Tool, Not Public-Facing

**Status:** ✅ Decided

**Context:**
Some component libraries publish their Storybook as the primary documentation/demo site.
Others use it only internally for development.

**Decision:**
Storybook (`apps/storybook`) is an **internal team dev tool only**.
The **public-facing docs site** (`apps/docs`) is the Fumadocs Next.js site.

**Reasoning:**
1. Storybook is optimized for component development iteration, not end-user learning
2. Public docs (Fumadocs) can have richer content: installation guides, design rationale,
   copy-paste install commands, live demos embedded in MDX
3. Storybook can be stripped of design context; Fumadocs lets us craft the narrative

**Storybook role:**
- Develop components in isolation
- Test all variants and intents visually
- Manual a11y audit via Storybook a11y addon
- Catch visual regressions during development (by eye, not automated)

**Consequences:**
- Every component needs both: a Storybook story (for dev) and a docs MDX page (for users)
- Storybook is never deployed; it runs locally only

---

## ADR-011 — Fumadocs for the Documentation Site

**Status:** ✅ Decided

**Context:**
We needed a documentation framework for `apps/docs`. Options considered:
Nextra, Fumadocs, Docusaurus, custom Next.js.

**Decision:**
Use **Fumadocs** (Next.js App Router + MDX).

**Reasoning:**
1. Built on Next.js App Router — same framework we already know; no new runtime
2. MDX content with auto-generated sidebar from `meta.json` — minimal configuration
3. Fumadocs UI has Tailwind-first theming — overrides via CSS variables work cleanly
4. Full-text search included out of the box (Orama or Algolia)
5. Active maintenance and good TypeScript story

**Consequences:**
- Docs MDX files live in `apps/docs/content/docs/`
- Navigation is controlled by `meta.json` files alongside MDX files
- The docs site at `apps/docs` also doubles as the registry host (serves `public/r/`)

---

## ADR-012 — Versioning Strategy

**Status:** ⏸ Deferred

**Context:**
When we publish the npm packages (`@id-components/motion`, `@id-components/tokens`,
`@id-components/utils`) and release the registry, we need a versioning strategy.

**Decision:** Not yet made. Revisit before first public release.

**Options under consideration:**
- **Lockstep:** All packages at the same version (e.g., all `v1.0.0` always together)
  - Pro: Simple communication ("upgrade to ID-Components v2")
  - Con: A minor motion change bumps the version of unrelated packages
- **Independent:** Each package has its own version
  - Pro: Precise semver semantics per package
  - Con: Consumers must track multiple package versions

**Likely decision:** Lockstep versioning, managed via changesets when the time comes.

---

## ADR-013 — Visual Regression Testing

**Status:** ⏸ Deferred

**Context:**
Visual regression testing catches unintentional visual changes when code changes.
Tools: Chromatic (paid), Playwright screenshots (free but manual).

**Decision:** Skip until the library has ≥10 stable components.

**Reasoning:**
During early architecture phase, structural changes are frequent and generate false
positives in screenshot comparisons. The signal-to-noise ratio is low until the
component surface stabilizes.

**Revisit when:** 10+ stable components and a first public release is being planned.

---

## ADR-014 — Testing Approach

**Status:** ✅ Decided

**Decision:** Vitest + Testing Library per package. Tests co-located with components.
a11y tested via `vitest-axe`.

**Test pyramid:**
1. **Unit tests** per component (render, props, interactions, a11y)
2. **Integration tests** for compound components and provider interactions
3. No E2E tests at this stage (deferred with ADR-013)

**What to test per component:**
- Renders without errors
- Correct class applied per variant
- Keyboard interaction works (Enter, Space, Escape where applicable)
- `aria` attributes are correct (`vitest-axe` automates this)
- Motion handlers are attached when not disabled and not reduced-motion

**What NOT to test:**
- GSAP animation values (unit tests have no layout engine)
- Pixel-perfect visual output (that's visual regression, ADR-013)
- Storybook story rendering (Storybook has its own test runner for this)

---

## ADR-015 — Three.js Components: Always Lazy-Loaded, Always SSR-Disabled

**Status:** ✅ Decided

**Context:**
Three.js requires browser APIs (WebGL, canvas) that don't exist in Node.js.
Importing Three.js in a Server Component or during SSR will crash.

**Decision:**
All Three.js components must:
1. Use `dynamic(() => import('./ThreeCanvas'), { ssr: false })` in Next.js
2. Use `React.lazy()` with an SSR guard in other frameworks
3. Never import `three`, `@react-three/fiber`, or `@react-three/drei` at the module level
   in any file that could be executed server-side

**Pattern:**
```tsx
// ThreeCard.tsx  (the public component)
import dynamic from 'next/dynamic';
const ThreeCardScene = dynamic(() => import('./ThreeCardScene'), { ssr: false });

export const ThreeCard = forwardRef<HTMLDivElement, ThreeCardProps>((props, ref) => (
  <div ref={ref} {...props}>
    <ThreeCardScene {...props} />
  </div>
));

// ThreeCardScene.tsx  (the actual Three.js code, never server-rendered)
import { Canvas } from '@react-three/fiber';
// ...
```

**Consequences:**
- Three.js components always have a loading state to handle the async import
- Two files per 3D component: the public shell + the scene implementation
- Performance benefit: Three.js (~600kb) is only loaded when the component is rendered

---

## ADR-016 — Keep Current Repo, Convert in Phases

**Status:** ✅ Decided

**Context:**
Given the current repo has a solid but incomplete architecture, should we start fresh
or migrate the existing work?

**Decision:**
**Keep the current repository** and migrate to the target architecture in phases (see
`ARCHITECTURE.md` Section 10 for the phase-by-phase migration plan).

**Reasoning:**
1. The existing foundation is genuinely good — Turbo pipeline, TypeScript config, Biome,
   the motion adapter pattern, the Button component — none of this needs to be discarded
2. Starting fresh discards committed work (Button + story + test + docs) and doesn't
   improve the outcome
3. Phased migration allows us to validate each step before moving forward
4. The structural changes (folder reorganization, registry addition) are additive, not
   destructive — we're not rewriting, we're extending

**What changes:**
- Folder structure reorganization (components into categories)
- Addition of `registry/` and `registry.json`
- Token build script
- Motion package internal reorganization
- Storybook CSS fix

**What stays:**
- All existing component code (Button)
- Turbo pipeline
- TypeScript config
- Biome config
- Package structure (`core`, `motion`, `tokens`, `utils`)
- Storybook and docs apps
