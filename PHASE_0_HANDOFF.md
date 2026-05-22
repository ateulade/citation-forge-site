# Phase 0 — Handoff

Phase 0 of the Citation Forge marketing site is done. The repo is live at https://github.com/ateulade/citation-forge-site and `pnpm build` passes locally.

Below is everything you need to finish wiring before Phase 1.

---

## TL;DR — what's left

| # | Step | Where | Why |
|---|------|-------|-----|
| 1 | Revoke the PAT you pasted in chat | github.com/settings/tokens | That token is compromised in the conversation log. Kill it now. |
| 2 | Add `deploy.yml` + `lint.yml` via GitHub web UI | github.com → repo → Actions tab | The gh CLI OAuth token doesn't have `workflow` scope; pushing them locally was rejected by GitHub. |
| 3 | Create Cloudflare account + Pages project | dash.cloudflare.com | Phase 0's success bar is a `*.pages.dev` preview deploy. |
| 4 | Add 3 secrets to the GitHub repo | github.com → repo → Settings → Secrets | Lets the workflow deploy to Cloudflare + ping IndexNow. |
| 5 | Push the "trigger deploy" empty commit | local PowerShell, 1 line | First green run of the workflow = Phase 0 complete. |

Estimated total time: **15–20 minutes**, all clicks.

---

## Step 1 — Revoke the compromised PAT

1. Open https://github.com/settings/tokens
2. Find the token starting with `github_pat_11AL5SNSI00OH3yUOEcixa...` (or whatever you named it)
3. Click **Delete** → confirm
4. **Why this matters**: the token was pasted in our chat and is now in conversation logs. Treat any credential that touches a chat as compromised — always.

---

## Step 2 — Add the two workflow files via GitHub web UI

The files exist locally at `.github/workflows/deploy.yml` and `.github/workflows/lint.yml` but are NOT committed to the repo (the OAuth scope issue).

**Easiest path** — copy-paste via GitHub web UI:

1. Go to https://github.com/ateulade/citation-forge-site
2. Click the **Actions** tab → **set up a workflow yourself** (skip if it suggests templates)
   - Or directly: **Add file → Create new file** → name it `.github/workflows/deploy.yml`
3. **Open the local file** `C:\Users\AlexandreTeulade\Code\citation-forge-site\.github\workflows\deploy.yml`
4. **Copy its entire contents**, paste into the GitHub web editor
5. Click **Commit changes…** → "Commit directly to the master branch" → Commit
6. **Repeat for `lint.yml`**: Add file → Create new file → `.github/workflows/lint.yml` → paste → commit

Once both are committed, the workflow files exist on GitHub. Then locally run:
```powershell
git pull origin master
```
to sync the new commits down.

**Alternative path** (if you want to handle it from the terminal later): create a new PAT with `repo` + `workflow` scopes, set it via `[Environment]::SetEnvironmentVariable('GH_TOKEN', 'ghp_...', 'User')`, then `git add .github/workflows && git commit && git push`. Don't paste the token in chat.

---

## Step 3 — Cloudflare Pages

1. **Create a Cloudflare account** (free tier is enough): https://dash.cloudflare.com/sign-up
2. Once in the dashboard, go to **Workers & Pages** in the left sidebar
3. Click **Create** → **Pages** → **Connect to Git**
4. **Authorize the Cloudflare GitHub app** to access your account
5. **Select `citation-forge-site`**, click **Begin setup**
6. Configure the build:
   - **Production branch**: `master`
   - **Framework preset**: `Astro` (auto-detected; otherwise pick from dropdown)
   - **Build command**: `pnpm install --frozen-lockfile && pnpm run build`
   - **Build output directory**: `dist/client`
   - **Root directory**: (leave blank)
   - **Node version**: Add an environment variable `NODE_VERSION` = `22`
7. Click **Save and Deploy** — first build takes ~2 minutes
8. Once done, Cloudflare gives you a preview URL like `https://citation-forge-site-xxx.pages.dev`

**This is the Phase 0 success signal** — that preview URL returning the placeholder homepage = Phase 0 done.

> Note: Cloudflare's "Connect to Git" deploy and our GitHub Actions deploy both work. Connect-to-Git is simpler (Cloudflare runs the build on its side). The Actions workflow is the smarter long-term path (one place for IndexNow pings, JSON-LD validation, etc.) — use Cloudflare's connect-to-Git for the **initial verification**, then disable it once the Actions workflow has been tested.

---

## Step 4 — Add GitHub Actions secrets

You only need these once the GH Actions workflow runs (Step 5). To get the Cloudflare values:

1. **`CLOUDFLARE_API_TOKEN`**
   - https://dash.cloudflare.com/profile/api-tokens
   - Click **Create Token** → use the **"Edit Cloudflare Workers"** template
   - Account resources: include `your account`. Zone resources: include all zones (or leave default).
   - Click **Continue to summary** → **Create Token** → copy the token value (only shown once)

2. **`CLOUDFLARE_ACCOUNT_ID`**
   - In the Cloudflare dashboard, go to **Workers & Pages** → right sidebar shows **Account ID** (32-char hex)

3. **`INDEXNOW_KEY`**
   - Generate 32 random hex chars. From PowerShell:
     ```powershell
     -join ((48..57) + (97..102) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
     ```
   - Save the value — you'll also need to drop a file `<INDEXNOW_KEY>.txt` at `public/<INDEXNOW_KEY>.txt` containing only the key. That proves ownership to IndexNow. (Skip this if you're not on the domain yet.)

**Add them to GitHub:**
1. https://github.com/ateulade/citation-forge-site/settings/secrets/actions
2. Click **New repository secret** → paste each one

---

## Step 5 — Trigger the first workflow run

After Steps 2–4, push any small change to fire the workflow:

```powershell
cd C:\Users\AlexandreTeulade\Code\citation-forge-site
git pull origin master
# touch any file or update README footer
git commit -am "ci: trigger first deploy"
git push
```

Watch https://github.com/ateulade/citation-forge-site/actions — `Deploy to Cloudflare Pages` should run, all steps green.

---

## What's in the repo right now

- ✅ Astro 6 scaffold with TS strict
- ✅ Tailwind v4 (CSS-first `@theme`) at `src/styles/global.css`
- ✅ `Layout.astro`, `BaseHead.astro`, `JsonLd.astro`, `ArticleSchema.astro`
- ✅ Content Layer collection `blog/` with Zod schema (`src/content.config.ts`)
- ✅ Curated / `_generated` / `_fixtures` namespace split for the GitHub-as-CMS flywheel
- ✅ One fixture MDX at `_fixtures/hello.mdx` validating the schema
- ✅ Placeholder homepage with `Organization` + `WebSite` JSON-LD
- ✅ `robots.txt`, `llms.txt`, `rss.xml.ts`, sitemap config
- ✅ `CODEOWNERS` with placeholders `@CITATION_FORGE_OWNER` / `@CITATION_FORGE_BOT` (replace these once you decide on the bot account)
- ✅ Build-time JSON-LD validator at `scripts/validate-jsonld.mjs`
- ✅ Wrangler config for Cloudflare adapter
- ✅ Full docs: `README.md`, `CLAUDE.md`, `content-style-guide.md`
- ⏳ Workflow files locally but not pushed (Step 2 above)

## What's NOT in the repo (Phase 1+)

- Header / Footer / nav
- Most schema components (FAQ, HowTo, Speakable, DefinedTerm, Product, Breadcrumb, Review, ItemList) — Phase 1
- Content components (TLDR, DataPoint, ExpertQuote, ComparisonTable, etc.) — Phase 1
- Real fonts (currently system mono + sans) — Phase 1
- Free-audit form — Phase 2 (stub scoring planned)
- Hero pages (homepage real version, pricing, about, /vs/profound) — Phase 2
- Blog / glossary / comparison / use-case templates + launch content — Phase 3
- SaaS-side GitHub API integration — Phase 4

See `CLAUDE.md` for the full phase breakdown.

---

## When you're back, just say "ready to continue Phase 1" and I'll pick up from here.
