# Claude Code — ID-Components

See [AGENTS.md](./AGENTS.md) for the full source of truth on conventions, stack, and the component
definition of done. Everything in AGENTS.md applies here too.

## Claude-Specific Workflow

- **Propose before implementing.** Before writing a new component, describe the API (props, variants,
  intent wiring, a11y approach) in chat and wait for approval. This avoids throwaway diffs.
- **One component at a time.** Don't batch multiple new components in a single PR. Each needs its
  own story, test, and docs page.
- **Run typecheck after every file change.** Catch TS errors early; don't wait for CI.
- **Never force-push to main.** All work happens on feature branches; open PRs to merge.
- **Ask before adding deps.** Any new package not already in the stack needs a brief justification
  before being installed.

## Quick Reference

| Task | Command |
|---|---|
| Build all packages | `pnpm build` |
| Type check | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Test | `pnpm test` |
| Storybook | `pnpm storybook` |
| Docs dev | `pnpm docs:dev` |
