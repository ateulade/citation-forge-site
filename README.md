# Citation Forge — Marketing Site

The marketing site for Citation Forge, an AEO content production engine for B2B SaaS.

> The architectural moat: this site is generated and updated _by Citation Forge itself_ — the SaaS pushes new and transformed pages here via the GitHub API → Cloudflare Pages auto-deploys → IndexNow re-pings the search engines. The marketing site demonstrates the product by being optimized by the product.

## Quick start

```sh
pnpm install
pnpm dev          # http://localhost:4321
pnpm check        # type + content schema validation
pnpm build        # production build to dist/ (with Pagefind index)
pnpm preview      # preview the production build
```

Requires **Node 22+** and **pnpm 10+** (managed via Corepack).

## Where to read more

- **[CLAUDE.md](./CLAUDE.md)** — stack, repo layout, commands, conventions, the GitHub-as-CMS flywheel.
- **[content-style-guide.md](./content-style-guide.md)** — voice, structure, frontmatter contract, schema requirements (this is the contract the SaaS follows when writing pages).
- **[`src/content.config.ts`](./src/content.config.ts)** — the Zod schema for all content. Source of truth.

## Status

- **Phase 0** — scaffold + toolchain + first deploy ✅
- **Phase 1** — design system + schema components (next)
- **Phase 2** — 5 hero pages including free-audit
- **Phase 3** — blog/glossary/comparison/use-case templates + launch content
- **Phase 4** — SaaS-side GitHub API integration (programmatic generation flywheel)

## License

Proprietary — Citation Forge. All rights reserved.
