# Citation Forge — Marketing Site

Astro 6 marketing site for Citation Forge SaaS. Goal: maximum AEO/SEO performance + GitHub-as-CMS for programmatic generation by the SaaS product itself. The marketing site is the proof point: "we use our own product to optimize this site."

## Stack

- **Astro 6** (Content Layer API + Server Islands), **TypeScript strict**
- **Tailwind CSS v4** via `@tailwindcss/vite` (CSS-first `@theme` config, no `tailwind.config.js`)
- **MDX** for content via `@astrojs/mdx`
- **Cloudflare Pages** via `@astrojs/cloudflare` adapter, `output: 'static'` (Server Islands opt-in per route)
- **Pagefind** for static, build-time search index
- **Resend** for transactional email (free-audit form, Phase 2)
- **schema-dts** for typed JSON-LD output, **Zod** for runtime validation

> Note: the original brief specified Astro 5. We're on Astro 6 because it was the latest at scaffold time (May 2026). Astro 6 is a strict superset for our use case (Content Layer API GA'd in 5, carried into 6).

## Commands

- `pnpm dev` — dev server at `localhost:4321`
- `pnpm build` — `astro build && pagefind --site dist`
- `pnpm preview` — preview the production build
- `pnpm check` — `astro check` (TS + content schema validation)
- `pnpm astro <cmd>` — passthrough to Astro CLI

## Repo layout

```
src/
├── components/
│   ├── layout/         Layout.astro, BaseHead.astro
│   ├── seo/            JsonLd.astro, ArticleSchema.astro (more in Phase 1)
│   ├── content/        TLDR, DataPoint, FAQ, ExpertQuote, etc. (Phase 1)
│   ├── marketing/      Hero, FeatureGrid, Pricing, Testimonial, CTABand (Phase 1)
│   ├── tools/          React forms (free-audit) — Server Islands only (Phase 2)
│   └── widgets/        CitationCounter, ProofPoint (Phase 2)
├── content/
│   └── blog/
│       ├── curated/    Human-authored posts
│       ├── _generated/ SaaS-authored posts (via GitHub API, Phase 4)
│       └── _fixtures/  Schema test fixtures (excluded from sitemap + RSS)
├── content.config.ts   Content Layer collection + Zod schema
├── lib/
│   └── schema/         Per-page-type Zod schemas → schema-dts JSON-LD builders
├── pages/              Astro routes
└── styles/global.css   Tailwind + @theme tokens

scripts/validate-jsonld.mjs   Build-time JSON-LD sanity check
.github/workflows/             deploy.yml (main → Cloudflare), lint.yml (PRs)
.github/CODEOWNERS             curated/ owned by humans, _generated/ owned by bot
public/llms.txt + robots.txt   AEO crawler welcome mat
```

## Conventions

- All content under `src/content/blog/{curated,_generated,_fixtures}/*.{md,mdx}` validates against Zod schemas in `src/content.config.ts`.
- Schema markup goes through `src/components/seo/*` — never inline JSON-LD in pages.
- Content components in `src/components/content/*` are imported into MDX — never raw HTML in MDX.
- Performance budget: LCP < 1s, CLS < 0.1, JS bundle < 50 KB. Lighthouse 100/100/100/100 is the bar.
- Keep React strictly inside `src/components/tools/` (Server Islands or `client:only="react"`). Don't let it leak into layouts.
- Single JSON-LD emission point per page via `<BaseHead schema={...} />` — don't nest `<JsonLd>` directly in page bodies.

## GitHub-as-CMS flywheel (the moat)

The Citation Forge SaaS product writes markdown directly to this repo via the GitHub API. This is what makes the site optimize itself.

**Rules the SaaS bot must follow:**

1. **Always open a PR** — never push directly to `main`. The PR triggers `lint.yml` which runs `astro check` + JSON-LD validation. Failed checks block the merge.
2. **Write only to `src/content/blog/_generated/`**. Filename pattern: `auto-{slug}-{shortHash}.mdx`. The CODEOWNERS file enforces this.
3. **Frontmatter must validate against `src/content.config.ts`** (the Zod `blogFrontmatter` schema). Required fields: `title`, `description` (40–180 chars), `publishDate`, `author`, `category`, `priorityPrompt`. Set `generated: true`.
4. **Use the Git Trees API for batched commits** when shipping >5 files at once — opening 1 PR with N files instead of N PRs avoids rate limits and gives a single review surface.
5. **Apply the `auto-publish` label** when the bot is confident. With branch protection set up, label + green checks = auto-merge. No label = parked for human review.

**On every successful merge to main**, GitHub Actions:
- builds the site (Astro + Pagefind)
- deploys to Cloudflare Pages
- pings IndexNow
- (Phase 4) submits the new URL via GSC + Bing Webmaster APIs

## Performance + accessibility budget

- Total JS shipped to client: **< 50 KB gzipped** (Server Islands keep React off most pages).
- Largest Contentful Paint: **< 1 s** on mobile slow-3G simulation.
- Cumulative Layout Shift: **< 0.1**.
- Color contrast: WCAG AA minimum, AAA on body text.
- All interactive elements: keyboard accessible, visible focus state.

## Don'ts

- Don't add React except inside `src/components/tools/`.
- Don't add a headless CMS — markdown-in-repo IS the system.
- Don't fetch data at runtime for content pages — pre-render everything at build.
- Don't use stock photos — original SVG diagrams or commissioned photography only.
- Don't ship pages without their required schemas (see `content-style-guide.md`).
- Don't `--no-verify` past hooks. If `astro check` fails, fix the schema or the content, never skip.

## What's done in Phase 0

- Scaffold + toolchain + integrations
- Layout, BaseHead, JsonLd, ArticleSchema components
- Blog content collection with Zod schema, one fixture
- `_generated/` vs `curated/` namespace + CODEOWNERS
- `deploy.yml` + `lint.yml` workflows
- Build-time JSON-LD validator
- `robots.txt`, `llms.txt`, `rss.xml.ts`, sitemap

## What's NOT done yet

- Real homepage (Phase 2 — placeholder is in place)
- Header / Footer / nav (Phase 1)
- Most schema components (FAQ, HowTo, Speakable, DefinedTerm, Product, Breadcrumb, Organization, ItemList, Review) — Phase 1
- Content components (TLDR, DataPoint, FAQ, ExpertQuote, ComparisonTable, DecisionMatrix, DefinitionBlock) — Phase 1
- Real fonts (placeholder uses system mono + sans) — Phase 1
- Free-audit form — Phase 2 (stub scoring; SaaS API doesn't exist yet)
- 5 hero pages (homepage, pricing, about, free-audit, /vs/profound) — Phase 2
- Blog/glossary/comparison/use-case templates + launch content — Phase 3
- GitHub-as-CMS integration on the SaaS side — Phase 4

## Env vars

- `PUBLIC_SITE_URL` — full URL with scheme. Defaults to `https://citationforge.com`.
- `RESEND_API_KEY` — Phase 2 (free-audit form email).
- `PRODUCT_API_URL`, `PRODUCT_API_KEY` — Phase 2/4 (real Citation Forge SaaS API).
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `INDEXNOW_KEY` — GitHub Actions secrets.
