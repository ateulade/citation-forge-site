# Citation Forge — Content Style Guide

This guide is the contract for any content authored on this site, whether by humans or by the Citation Forge SaaS itself. If you're a human writing content, follow this. If you're the SaaS bot writing programmatic pages, you MUST follow this — `astro check` and the JSON-LD validator will reject anything that doesn't.

## Voice

- **Direct.** Builder energy. Founder-led.
- **No marketing fluff** ("synergize", "best-in-class", "world-leading", "revolutionary").
- **Speak to one person**, not "businesses" or "marketers".
- **Always cite.** "Per [Source 2026]" or "X% per [Study]". Untraceable claims are forbidden.
- **Plain English** before jargon. Define every acronym on first use.

Reference voices to study: Adam Robinson (RB2B), Guillaume Moubeche (Lemlist), Kyle Poyar (Growth Unhinged).

## Mandatory page structure

Every blog post / comparison / use case follows this skeleton:

1. **Title** — keyword-led, ≤ 60 chars
2. **Meta description** — 140–155 chars; primary keyword + benefit
3. **TL;DR block** — 40–60 words, direct answer that LLMs can extract verbatim. Wrapped in `Speakable` schema.
4. **Definition section** (if applicable) — wrapped in `DefinedTerm` schema
5. **Body** — H2/H3 in question form ("What is X?", "When should you use X?")
6. **At least 1 ExpertQuote**
7. **At least 3 DataPoint citations** (Apricot, Stackmatix, Kyle Poyar, Profound, etc.)
8. **ComparisonTable or DecisionMatrix** where helpful
9. **FAQ** — 4–7 self-contained Q&A pairs. Each Q must stand alone for an LLM extracting one row.
10. **Related Resources** — 3–5 internal links
11. **CTA** — Free audit / Demo / Pricing

## Frontmatter contract

Every blog MDX file MUST include:

```yaml
---
title: "..."                  # ≤ 80 chars
description: "..."            # 40–180 chars (LLM-extractable lead)
publishDate: 2026-MM-DD
updatedDate: 2026-MM-DD       # optional
author: "..."
category: "..."
tags: ["...", "..."]          # optional
heroImage: "..."              # optional
faq:
  - question: "..."
    answer: "..."
expertQuote:                  # optional but recommended
  text: "..."
  attribution: "..."
  role: "..."
proprietaryData:              # optional but recommended
  - stat: "..."
    source: "..."
    year: 2026
relatedPages: ["..."]         # optional, slugs of related pages
priorityPrompt: "..."         # the LLM prompt this page is targeting
draft: false                  # set true to keep out of sitemap + RSS
generated: false              # SaaS-written posts MUST set this true
---
```

The Zod schema in `src/content.config.ts` is the source of truth — if it differs from this doc, the schema wins.

## Schema markup requirements

Every page type ships specific schemas. The table below maps page → schemas.

| Page type        | Required schemas                                                    |
|------------------|---------------------------------------------------------------------|
| Homepage         | Organization, WebSite, BreadcrumbList                               |
| Blog post        | Article, FAQPage, Speakable, BreadcrumbList                         |
| Comparison       | Article, FAQPage, Speakable, ItemList (the comparison), Breadcrumb  |
| Glossary entry   | DefinedTerm, Article, BreadcrumbList                                |
| Use case         | Article, HowTo, FAQPage, Speakable, BreadcrumbList                  |
| Pricing          | Product, Offer (per tier), AggregateOffer, FAQPage                  |
| Free audit tool  | SoftwareApplication, FAQPage                                        |
| Case study       | Article, Review (with reviewRating), Organization, BreadcrumbList   |

These get emitted via the per-type schema components in `src/components/seo/*`. Do NOT inline JSON-LD in page bodies.

## Content components (use these in MDX, never raw HTML)

```mdx
import TLDR from '../../components/content/TLDR.astro'
import DataPoint from '../../components/content/DataPoint.astro'
import FAQ from '../../components/content/FAQ.astro'
import ExpertQuote from '../../components/content/ExpertQuote.astro'
import DefinitionBlock from '../../components/content/DefinitionBlock.astro'
import ComparisonTable from '../../components/content/ComparisonTable.astro'
import DecisionMatrix from '../../components/content/DecisionMatrix.astro'

<TLDR>40–60 words. Direct answer. Cite-ready.</TLDR>

<DataPoint stat="73% of B2B sites lost organic traffic 2024-2025" source="Apricot" year={2026} />

<FAQ items={frontmatter.faq} />
```

Most of these components ship in Phase 1 — until then, do not author content that depends on them.

## Word count

- Standard post: 1,200–1,800 words
- Pillar/comparison page: 2,500–4,000 words
- Glossary entry: 600–1,200 words
- Use case: 1,500–2,500 words

## Internal linking rules

- Every post links to ≥ 3 other Citation Forge pages.
- All slugs in `relatedPages` MUST resolve. The build will fail otherwise.
- Anchor text must be descriptive — never "click here" or "read more".

## Programmatic generation rules (for the SaaS bot, Phase 4)

1. **Always open a PR** to a feature branch under `auto/<topic>-<date>`. Never push to `main`.
2. **Write only to `src/content/blog/_generated/`**. Filename: `auto-{slug}-{shortHash}.mdx`.
3. **Set `generated: true`** in frontmatter.
4. **Validate locally** before opening the PR — running `astro check` against the file.
5. **Use the Git Trees API** to batch ≥ 5 files into a single commit, then a single PR.
6. **Apply the `auto-publish` label** if you're confident. No label = held for human review.
7. **Internal links MUST resolve.** The bot is responsible for picking real `relatedPages` slugs from the existing collection at generation time.
8. **No identical paragraphs** across two different posts. Bot must check by paragraph hash before submitting.
