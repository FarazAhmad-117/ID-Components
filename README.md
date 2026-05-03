# ID-Components

> GSAP-native React components with motion personality.

ID-Components is an open-source React UI component library that ships with two motion personalities built on GSAP. Components feel alive by default (`playful`) and snap into focus when you need precision (`professional`).

## What It Is

- **GSAP-powered** — every interaction is a real animation, not a CSS transition
- **Dual intent** — `playful` (default) for expressive UIs, `professional` for business-critical interfaces
- **Headless a11y** — built on Radix UI primitives; keyboard nav and ARIA come for free
- **Tailwind v4** — utility-first, CSS-first theming via `@theme` — no config file
- **Typed strictly** — TypeScript strict mode throughout

## Install

```bash
# Not yet published — coming soon
pnpm add @id-components/core @id-components/motion @id-components/tokens @id-components/utils
```

## Quick Example

```tsx
import { MotionProvider } from '@id-components/motion';
import { Button } from '@id-components/core';

export default function App() {
  return (
    <MotionProvider intent="playful">
      <Button variant="primary" size="md">
        Get started
      </Button>
    </MotionProvider>
  );
}
```

Switch to professional intent for dashboards and data-heavy UIs:

```tsx
<MotionProvider intent="professional">
  <Button variant="secondary">Save changes</Button>
</MotionProvider>
```

## Dev Setup

Requires Node 20+ and pnpm 9+.

```bash
git clone https://github.com/FarazAhmad-117/ID-Components.git
cd ID-Components
pnpm install
pnpm build
```

| Command | Description |
|---|---|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm lint` | Lint with Biome |
| `pnpm test` | Run Vitest |
| `pnpm storybook` | Open Storybook |
| `pnpm docs:dev` | Start Fumadocs site |

## Repository Structure

```
apps/docs         — Fumadocs documentation site
apps/storybook    — Storybook 8 component playground
packages/core     — @id-components/core
packages/motion   — @id-components/motion
packages/tokens   — @id-components/tokens
packages/utils    — @id-components/utils
examples/         — Runnable examples
```

## Contributing

See [AGENTS.md](./AGENTS.md) for conventions and the definition of done for new components.

## License

MIT — see [LICENSE](./LICENSE).
