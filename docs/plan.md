# AgentCenter (Nuxt) — Implementation Plan

Marketplace for AI agent extensions (Skills, MCP servers, slash commands, plugins) with internal-enterprise features (departments, scope, tags, collections) and a companion CLI for actual machine-side install.

This is a Nuxt 4 rewrite of the original Next.js implementation at `../agentcenter/`. The product surface and the public `/api/v1` contract are preserved verbatim so the existing CLI keeps working unchanged.

This document is the living plan. When a binding decision changes, update it in the same commit as the code change.

---

## 1. Project layout

File-based routing under `app/pages/`, Nitro server under `server/`, and a cross-cutting `shared/` directory that both sides import from. Single Nuxt app, server-side rendering by default. The CLI is a sibling directory (`cli/`) carried over verbatim from the original repo.

**Locale prefixing**: `@nuxtjs/i18n` with `strategy: "prefix"` auto-prefixes every page route with `/en` and `/zh` — pages live at `app/pages/index.vue`, **not** `app/pages/[locale]/index.vue`. URLs are always prefixed (`/en/...`, `/zh/...`); the locale segment is owned by the i18n module, not the file system. This is a structural difference from the original Next.js layout, which used an explicit `[locale]` directory segment.

```
agentcenter-nuxt/
├── CLAUDE.md
├── CONTRIBUTING.md
├── nuxt.config.ts
├── app.vue                            # global frame; <NuxtPage /> entry
├── app/
│   ├── layouts/
│   │   └── default.vue                # NuxtIntl boundary, TopBar + Sidebar shell
│   ├── pages/                         # @nuxtjs/i18n auto-prefixes every route with /en, /zh
│   │   ├── index.vue                  # Home: featured + browse grid
│   │   ├── extensions/
│   │   │   ├── index.vue              # Browse all (filters via query string)
│   │   │   └── [slug].vue             # Detail page
│   │   ├── sign-in.vue
│   │   ├── sign-up.vue
│   │   ├── onboard.vue                # Pick department after sign-up
│   │   ├── collections/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── publish/
│   │   │   ├── index.vue              # Publisher dashboard
│   │   │   ├── new.vue                # Upload wizard — new draft
│   │   │   └── [id]/edit.vue          # Upload wizard — resume / edit
│   │   ├── cli/auth.vue               # Device-code authorization page
│   │   └── profile/
│   │       └── index.vue              # My Workspace
│   ├── components/
│   │   ├── ui/                        # shadcn-vue primitives (button, dialog,
│   │   │                              #   dropdown, popover, select, checkbox,
│   │   │                              #   input, badge, sheet, command)
│   │   ├── layout/
│   │   │   ├── TopBar.vue             # serif wordmark, search, lang toggle,
│   │   │   │                          #   theme toggle, user avatar
│   │   │   ├── Sidebar.vue            # Browse + Categories + Collections
│   │   │   ├── LocaleSwitch.vue
│   │   │   └── ThemeSwitch.vue        # Ivory ↔ Dark
│   │   ├── extension/
│   │   │   ├── ExtCard.vue
│   │   │   ├── ExtGrid.vue
│   │   │   ├── ExtDetail.vue
│   │   │   ├── ExtTabs.vue            # Overview / Setup / Versions / Reviews
│   │   │   ├── ExtAboutCard.vue
│   │   │   ├── ExtRelatedList.vue
│   │   │   ├── InstallButton.vue      # triggers install event + CLI command hint
│   │   │   ├── AddToGroup.vue
│   │   │   └── FeaturedBanner.vue
│   │   ├── filters/                   # Mode B (drawer)
│   │   │   ├── FilterBar.vue
│   │   │   ├── FilterChips.vue
│   │   │   ├── DeptPicker.vue
│   │   │   ├── ScopePills.vue
│   │   │   ├── TagDrawer.vue
│   │   │   └── SortSelect.vue
│   │   ├── publish/
│   │   │   ├── UploadWizard.vue       # 4-step rail (Basics → Bundle → Listing → Review)
│   │   │   ├── ManifestForm.vue
│   │   │   └── DiscardButton.vue
│   │   └── Markdown.vue               # server-render via markdown-it + DOMPurify
│   ├── composables/
│   │   ├── useFilters.ts              # parsed filters + update(partial) → router.replace
│   │   ├── useAuth.ts                 # wraps Better Auth client (session, signIn, signOut)
│   │   ├── useTheme.ts                # cookie-backed Ivory ↔ Dark, no-flash on hydrate
│   │   └── useTagLabel.ts
│   ├── middleware/
│   │   ├── auth.global.ts             # populate user state on every nav
│   │   ├── locale-redirect.global.ts  # bare `/` → `/en` from Accept-Language
│   │   ├── require-auth.ts            # named middleware for protected pages
│   │   └── require-onboard.ts         # redirect to /onboard if no defaultDeptId
│   └── assets/
│       └── css/
│           └── tailwind.css           # @theme tokens (Ivory + Dark + Mono)
├── server/
│   ├── api/
│   │   ├── v1/                        # PUBLIC CONTRACT — see docs/api.md
│   │   │   ├── extensions/
│   │   │   │   ├── index.get.ts       # GET list (subset of filters)
│   │   │   │   ├── [slug].get.ts
│   │   │   │   └── [slug]/
│   │   │   │       └── bundle.get.ts  # 302 → signed storage URL
│   │   │   ├── installs.post.ts       # CLI install event
│   │   │   └── auth/device/
│   │   │       ├── code.post.ts       # device-code initiate
│   │   │       └── poll.post.ts       # device-code poll
│   │   ├── auth/[...].ts              # Better Auth Nuxt handler
│   │   ├── upload/sign.post.ts        # presigned upload URL
│   │   ├── inngest.post.ts            # Inngest webhook handler
│   │   └── internal/                  # form-backing endpoints (replaces Next.js server actions)
│   │       ├── publish/
│   │       │   ├── create-draft.post.ts
│   │       │   ├── update-draft.post.ts
│   │       │   ├── attach-file.post.ts
│   │       │   ├── submit.post.ts
│   │       │   └── discard.post.ts
│   │       ├── collections/
│   │       │   ├── create.post.ts
│   │       │   └── add-item.post.ts
│   │       └── installs.post.ts       # web install button (separate from /v1/installs)
│   ├── repositories/                  # Drizzle is ONLY imported here; every other layer takes a Transactable
│   │   ├── types.ts                   # Transactable = PostgresJsDatabase | PgTransaction
│   │   ├── extensions.ts              # findBySlug, findById, findManyWithFilters, updateVisibility, …
│   │   ├── versions.ts                # findById, findByIdWithScope, updateStatus, listReady, …
│   │   ├── files.ts                   # updateScanStatus
│   │   ├── installs.ts                # insertInstall, findByUserAndExtension, listLatestReadyForExtension
│   │   └── collections.ts             # getOrCreateSystemCollection, addItem
│   ├── utils/
│   │   ├── db.ts                      # drizzle(postgres-js client) singleton — only call site of useDb()
│   │   ├── auth.ts                    # getSessionUser(event), requireUser(event)
│   │   ├── storage.ts                 # presign + download-url helpers (Supabase Storage default)
│   │   ├── inngest.ts                 # Inngest client + functions registry
│   │   ├── extensions-state.ts        # submit/recordScanResult/publishVersion orchestrators over repos
│   │   └── installs.ts                # recordInstall orchestrator over repos
│   └── plugins/
│       └── db.ts                      # initialise drizzle once per worker
├── shared/                            # reachable from both app/ and server/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── auth.ts                # users, sessions, accounts, verifications
│   │   │   ├── org.ts                 # organizations, departments, memberships
│   │   │   ├── extension.ts           # extensions, extensionVersions, files, tags, extensionTags
│   │   │   ├── collection.ts          # collections, collectionItems
│   │   │   ├── activity.ts            # installs, ratings, viewEvents
│   │   │   └── index.ts
│   │   └── seed.ts                    # bun script: prototype extensions + dept tree + tags
│   ├── validators/
│   │   ├── extension.ts               # Zod: ManifestSchema, UploadSchema (verbatim port)
│   │   └── filters.ts                 # Zod: searchParams shape + parseFilters / serializeFilters
│   ├── search/
│   │   └── query.ts                   # buildExtensionWhere, buildExtensionOrder (verbatim port)
│   ├── extensions/
│   │   └── state.ts                   # decideScanOutcome, decidePublishOutcome (pure decisions)
│   ├── installs/
│   │   └── record.ts                  # pickInstallVersion (pure decision)
│   ├── publish/                       # planned; not yet ported
│   │   ├── row-action.ts              # rowAction()
│   │   └── scan-report.ts             # extractScanReason()
│   ├── taxonomy.ts                    # FUNC_TAXONOMY constant
│   ├── tags.ts                        # TAG_LABELS map
│   ├── types.ts                       # Extension, Department, Filters, Collection, Manifest
│   └── utils.ts                       # cn(), formatNum(), deptPath(), isDescendant()
├── i18n/
│   └── locales/
│       ├── en.json                    # ported from prototype's `T`
│       └── zh.json
├── cli/                               # carried over verbatim from ../agentcenter/cli
├── drizzle/                           # generated migrations (drizzle-kit)
├── public/
│   └── icons/
├── scripts/
│   ├── seed.ts                        # bun run scripts/seed.ts
│   ├── apply-fts.ts
│   └── set-storage-cors.ts
├── tests/
│   ├── contract/                      # shape-only Vitest specs against docs/api.md (frozen /api/v1)
│   ├── e2e/                           # Playwright specs
│   └── integration/                   # PGlite-backed repository tests + harness
│       ├── helpers/
│       │   └── db.ts                  # boot PGlite, run drizzle migrations + 0002_fts_search_vector.sql
│       └── repositories/              # one spec per server/repositories/*.ts
├── drizzle.config.ts
├── inngest.config.ts
├── playwright.config.ts
├── vitest.config.ts
├── vitest.config.integration.ts
├── eslint.config.mjs
├── tsconfig.json
├── package.json
├── bun.lockb
└── .env.example
```

**API routes vs server actions**: Nuxt has no server actions. The Next.js implementation used server actions for user-initiated mutations from RSC pages (install toggle from web, save-to-collection, create collection, draft create/update). All of these become POST handlers under `server/api/internal/...` called via `$fetch` from client components. Validation lives in the handler using the same Zod schemas as before; the handler is the new trust boundary. API routes under `/api/v1/...` (public, CLI-consumed), `/api/auth/...` (Better Auth), `/api/upload/sign` (presigned URL), and `/api/inngest` (webhook) keep their original purpose.

---

## 2. Routes & pages

URLs are unchanged from the Next.js version — the CLI's `verificationUri` (`/cli/auth`) and any deep links from emails/docs continue to work.

| URL | Purpose | MVP |
|---|---|---|
| `/[locale]` | Home — featured banner + Trending Skills + Browse All grid | **P0** |
| `/[locale]/extensions` | Full browse with all filters in URL | **P0** |
| `/[locale]/extensions/[slug]` | Detail: README, metadata sidebar, version history, install | **P0** |
| `/[locale]/sign-in`, `/sign-up` | Email/password (open sign-up) | **P0** |
| `/[locale]/onboard` | Pick department after sign-up | **P0** |
| `/[locale]/collections` | My collections list | **P0** |
| `/[locale]/collections/[id]` | Collection contents | P1 |
| `/[locale]/publish` | Publisher dashboard | **P0** |
| `/[locale]/publish/new` | Upload wizard — new draft | **P0** |
| `/[locale]/publish/[id]/edit` | Upload wizard — resume / edit existing draft | **P0** |
| `/[locale]/cli/auth` | Device-code authorization page | **P0** |
| `/[locale]/profile` | My Workspace — profile, settings, installed / published / drafts / saved / activity | **P0** |
| `/[locale]/admin` | Moderate, feature, ban | P1 |

---

## 3. Drizzle schema

**The schema is portable verbatim from `../agentcenter/lib/db/schema/`.** Same tables, same columns, same indexes, same enums. The `drizzle/` migrations directory is copied across as-is. See the original `docs/plan.md` §3 for the full table specification — it is the source of truth for column types and indexes, and is not re-pasted here to avoid drift.

Driver change: the original used `@neondatabase/serverless` (HTTP). We use `drizzle-orm/postgres-js` (TCP) with a standard `DATABASE_URL`. This works against Supabase, self-hosted Postgres, or any vanilla Postgres. No code change in queries.

```ts
// server/utils/db.ts
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "~~/shared/db/schema"

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
export const db = drizzle(client, { schema })
```

Critical indexing notes — unchanged from the original:

- Department descendant matching uses the dotted-path id directly: `WHERE deptId = $1 OR deptId LIKE $1 || '.%'`. This requires `text_pattern_ops` on `deptId` to use the index for `LIKE`. No recursive CTE.
- `(funcCat, subCat, l2)` covers drill-down.
- Sort indexes are separate (`downloadsCount DESC`, `starsAvg DESC`).

---

## 4. i18n strategy

- **Module**: `@nuxtjs/i18n` with `strategy: 'prefix'`. Locales `en` (default) | `zh`. **Always-prefixed URLs** (`/en/...`, `/zh/...`). A global middleware (`app/middleware/locale-redirect.global.ts`) redirects bare `/` → `/en` based on `Accept-Language`.
- **Static UI strings**: `i18n/locales/{en,zh}.json`, namespaced by feature (`Sidebar.browse`, `FilterBar.scope.personal`, `Card.installed`). Reuse the prototype's `T` keys verbatim. Use the `$t()` / `t()` helpers from `useI18n()` in components.
- **Dynamic content** (extension names, descriptions, dept names, tag labels, changelogs): **column-per-language** (`name` + `nameZh`, `description` + `descriptionZh`). Locked decision; same rationale as the original.
- **Tag labels**: `tags` table carries `labelEn` + `labelZh`. The `useTagLabel(tag)` composable picks the right column from `useI18n().locale`.
- **Locale switcher**: `<NuxtLink>` swapping the locale segment via `switchLocalePath()`; preserves filter query string.
- **FTS**: separate weighted tsvector concatenating all language variants — see §8.

---

## 5. Theming

Three themes shipped: **Editorial Ivory** (default), **Dark**, and **Mono Clean**.

Theme tokens in `app/assets/css/tailwind.css` via Tailwind v4 `@theme` blocks. Ivory lives in the base `@theme` block; Dark and Mono Clean live behind `.dark` and `.mono` class selectors applied to `<html>`:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Editorial Ivory (default) */
  --color-bg:           oklch(98.5% 0.008 80);
  --color-sidebar:      oklch(97.5% 0.008 80);
  --color-card:         #ffffff;
  --color-border:       oklch(92% 0.012 70);
  --color-ink:          oklch(22% 0.02 60);
  --color-ink-muted:    oklch(48% 0.015 60);
  --color-accent:       oklch(40% 0.09 35);
  --color-accent-fg:    oklch(98% 0.005 70);
  --font-sans:    "Inter", ui-sans-serif, system-ui;
  --font-serif:   "Fraunces", Georgia, serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;
  --radius-card:  10px;
}

.dark {
  --color-bg:           oklch(14% 0.006 240);
  --color-sidebar:      oklch(12% 0.005 240);
  --color-card:         oklch(19% 0.008 240);
  --color-border:       oklch(24% 0.008 240);
  --color-ink:          oklch(90% 0.006 240);
  --color-ink-muted:    oklch(58% 0.008 240);
  --color-accent:       oklch(72% 0.18 200);
  --color-accent-fg:    oklch(12% 0.01 240);
}

.mono {
  --color-bg:           oklch(96% 0 0);
  --color-sidebar:      oklch(98% 0 0);
  --color-card:         #ffffff;
  --color-border:       oklch(88% 0 0);
  --color-ink:          oklch(14% 0 0);
  --color-ink-muted:    oklch(52% 0 0);
  --color-accent:       oklch(22% 0 0);
  --color-accent-fg:    #ffffff;
}
```

`ThemeSwitch` is a dropdown (sun / moon / contrast icons + preview tiles per option) that writes the `theme` cookie. `useTheme` reads the cookie via `useCookie` and applies the matching class (`""` for ivory, `dark`, `mono`) to `<html>` via `useHead` — serialised into the SSR HTML so the initial paint already carries the correct theme, no flash on hydrate. Fonts loaded via `@nuxt/fonts` and wired into the CSS variables.

---

## 6. Auth & access model

**Better Auth.** Cookie-based server-side sessions; no JWTs. Drizzle adapter; auth tables live in `shared/db/schema/auth.ts`. Same shape as the original — no schema change.

- **Sign-up policy**: open. Email + password for v1; SSO/SAML deferred.
- **MVP roles** (on `memberships.role`): `viewer`, `publisher`, `admin`.
- **Onboarding step** at `/[locale]/onboard` after first sign-up. Enforced by `require-onboard` middleware on the home, browse, and publish routes.
- **CLI auth**: device-code OAuth flow on top of Better Auth's `verifications` table — identical scheme to the original.
  1. `POST /api/v1/auth/device/code` → creates two `verifications` rows (`dc:poll:<deviceCode>` and `dc:user:<userCode>`) and returns the user code.
  2. User opens `/[locale]/cli/auth`, signs in, enters the user code; the page resolves user code → device code, marks the poll row authorized, and stores a session token in it.
  3. CLI polls `POST /api/v1/auth/device/poll` every 5s. When authorized, the token is returned once and the row is deleted.
  4. Token stored at `~/.config/agentcenter/credentials.json` (mode 0600).

The Better Auth client lives in `useAuth()` composable; the server-side helper `requireUser(event)` lives in `server/utils/auth.ts` and is the single place that decides whether an incoming request has a valid session (cookie *or* Bearer header — same `sessions` table backs both).

---

## 7. Upload pipeline

The wizard is a 4-step rail layout (`<UploadWizard>` in `app/components/publish/`): **Basics → Bundle → Listing → Review**, with a sticky live-preview pane that mirrors the listing card and the derived `manifest.json`. Step 1 (Basics) creates the draft on advance; Steps 2-3 mutate it; Step 4 submits.

```text
Browser                          Nitro                          Storage      Inngest
   │ Basics → Next                  │                              │             │
   ├──── POST /api/internal/publish/create-draft ───►│  extensions row (visibility=draft)
   │                                │                              │             │
   ├──── Bundle: upload .zip ───────│─── presigned PUT URL ───────►│             │
   │                                │                              │             │
   ├──── POST /api/internal/publish/attach-file ────►│  files row + extensionVersion
   │                                │                              │             │
   ├──── Listing/Review edits ─────► /api/internal/publish/update-draft
   │                                │                              │             │
   ├──── Review → Publish ─────────► /api/internal/publish/submit ──► sendEvent("extension/scan.requested")
   │                                │                              │             │
   │                                │                              │  scan-bundle:
   │                                │                              │   download from storage,
   │                                │                              │   sha-256 checksum,
   │                                │                              │   parse manifest.toml,
   │                                │                              │   validate schema,
   │                                │                              │   recordScanResult →
   │                                │                              │    scope=personal → auto-publish
   │                                │                              │    scope=org|enterprise → await admin
   │                                │                              │   sendEvent("extension/index.requested")
   │                                │                              │             │
   │                                │                              │  reindex-search:
   │                                │                              │   bust route cache for browse pages
```

**Synchronous** (server endpoint, returns < 200ms): manifest creation, presigned URL signing, attach-file, submit.
**Async** (Inngest): bundle download, scan, validation, indexing, publish flip.

Implementation notes — unchanged from the original:

- Bundle keys: `bundles/<slug>/<version>/bundle.zip` (`bundleKey()` in `server/utils/storage.ts`). `slug` and `version` are locked on the Basics step once a draft has been persisted.
- `submit(versionId)` is idempotent for `pending|scanning` so retries don't get stuck.
- `recordScanResult` branches on `extensions.scope`: `personal` auto-publishes; `org|enterprise` waits for admin `publishVersion`.
- `extensions.search_vector` is a Postgres `GENERATED ALWAYS ... STORED` column; no application code writes it.
- `scan-bundle` keeps download + checksum + manifest parsing in a single `step.run` (Buffer doesn't survive step boundaries).

The `shared/extensions/state.ts` module owns every transition of `extensionVersions.status`, `files.scanStatus`, and `extensions.visibility`. Ported verbatim from the original.

---

## 8. Search

Postgres FTS with `pg_trgm` fallback for short fuzzy queries. **Migration SQL is portable verbatim from `../agentcenter/drizzle/0002_fts_search_vector.sql`.**

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE extensions ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(name, '')),       'A') ||
    setweight(to_tsvector('simple', coalesce(name_zh, '')),    'A') ||
    setweight(to_tsvector('simple', coalesce(tagline, '')),    'B') ||
    setweight(to_tsvector('simple', coalesce(tagline_zh, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')),    'C') ||
    setweight(to_tsvector('simple', coalesce(description_zh, '')), 'C')
  ) STORED;

CREATE INDEX idx_ext_search ON extensions USING GIN (search_vector);
CREATE INDEX idx_ext_name_trgm ON extensions USING GIN (lower(name) gin_trgm_ops);
CREATE INDEX idx_ext_name_zh_trgm ON extensions USING GIN (name_zh gin_trgm_ops);
```

`buildExtensionWhere` / `buildExtensionOrder` in `shared/search/query.ts` compose Drizzle SQL clauses from filters; they're pure (no DB call), unit-tested, and shared with `server/api/v1/extensions` so web and CLI see the same listing semantics.

Filters originate as `useRoute().query`, parsed by Zod (`shared/validators/filters.ts`) — so the URL is the filter state (shareable, server-rendered, deeplinkable). The `useFilters` composable wraps parse + serialize and exposes `update(partial)` that calls `router.replace` with the new query string.

---

## 9. CLI

**Unchanged.** The CLI is carried over verbatim from `../agentcenter/cli/` and lives at `cli/` in this repo. Only its default registry base URL (in `cli/src/config-store.ts` and `cli/README.md`) is updated when production deploys flip over.

The `/api/v1/...` JSON shapes documented in the original `docs/api.md` are frozen — any change is a `v2` breakage and goes through the API contract review described in `CLAUDE.md`. A Vitest suite in `tests/contract/` asserts each `v1` response shape against the example payloads in `docs/api.md` to catch accidental contract drift.

---

## 10. Milestone order

| Phase | Duration | Deliverable |
|---|---|---|
| **0. Bootstrap** | 0.5d | `bunx nuxi init`, Nuxt 4 compat, Tailwind v4 via `@nuxtjs/tailwindcss` (or `@tailwindcss/vite`), shadcn-vue init, `@nuxt/fonts`, `@nuxtjs/i18n` skeleton, `@nuxt/eslint`, `@pinia/nuxt`, Vitest + `@nuxt/test-utils`, Playwright. CI workflow (`bun run validate`). Adapted `CLAUDE.md` + this plan committed. |
| **1. Visual shell** | 1.5d | `app.vue` + `default` layout, `TopBar` + `Sidebar`, theme tokens (Ivory + Dark) in `tailwind.css`, `ThemeSwitch` (cookie-backed, no flash on hydrate), `LocaleSwitch`. Static home pixel-matched to the prototype, statically renders. |
| **2. DB + seed** | 1d | Port `shared/db/schema/*` from the original. Copy `drizzle/` migrations. `server/utils/db.ts` (postgres-js + Drizzle). `scripts/seed.ts` ported (Bun runnable). Working `useAsyncData` query on the home page. |
| **3. Browse + filter (vertical-slice demo)** | 2d | `/[locale]/extensions/index.vue` with all filters wired through query string; `useFilters` composable; `ExtCard` + `ExtGrid`; `FilterBar` Mode B; `DeptPicker` popover; `SortSelect`. Home shows featured banner + first 6 + Browse All. **Anonymous browse works.** ← clickable demo URL by end of this phase |
| **4. Detail page** | 1d | `/[locale]/extensions/[slug].vue` — `Markdown.vue` (markdown-it + DOMPurify), metadata sidebar (homepage/repo/license/compat), version table, install button (placeholder, wired in Phase 9). Port `getExtensionBySlug`, `listExtensionVersions`, `getRelatedExtensions`. `ExtTabs.vue` over `reka-ui` tabs primitive. |
| **5. i18n** | 1d | `@nuxtjs/i18n` wired, `en` + `zh` messages from prototype's `T`, locale switcher, locale-redirect middleware, always-prefixed URLs. |
| **6. Auth** | 1.5d | Better Auth + Drizzle adapter, server handler at `server/api/auth/[...].ts`, sign-in/up pages, dept-pick onboarding, `getSessionUser()` / `requireUser()` helpers, protect publish/collection routes via named middleware. |
| **7. Public registry API + manifest spec** | 1d | `server/api/v1/extensions/...` endpoints with frozen JSON shapes, signed bundle redirect, contract tests (Vitest). Port `docs/manifest-spec.md` from the original. |
| **8. Storage + upload signing** | 0.5d | `server/utils/storage.ts` with Supabase Storage default; `server/api/upload/sign.post.ts`; `scripts/set-storage-cors.ts`. R2 alternative documented in `docs/deploy.md`. |
| **9. Collections + Install events** | 1d | `server/api/internal/collections/...`, `server/api/internal/installs.post.ts`, system 'installed' / 'saved' collections seeded per user on sign-up. Port `shared/installs/record.ts`. Web install button wired. |
| **10. Upload wizard** | 2d | `UploadWizard.vue` 4-step (Basics → Bundle → Listing → Review) with vee-validate + Zod (same schemas as original), presigned upload, `internal/publish/*` endpoints. Resume + discard flows. `DiscardButton` calls `internal/publish/discard`. |
| **11. Background jobs** | 1d | Inngest client + `scan-bundle` + `reindex-search` functions, webhook route at `server/api/inngest.post.ts`, status polling on publisher dashboard. Port `shared/extensions/state.ts`. |
| **12. Search FTS** | 0.5d | Apply `0002_fts_search_vector.sql` to dev DB, trgm indexes, top-bar search wired through `useFilters`. |
| **13. Polish** | 1.5d | Empty states, `error.vue` route-level boundaries, loading skeletons via `<Suspense>` + skeleton components, OG images via `@nuxtjs/og-image`, a11y pass, dark-mode polish across all surfaces. |
| **14. Deploy** | 1d | Node preset (`nitro: { preset: 'node-server' }`), env template, deploy runbook in `docs/deploy.md`, smoke test the CLI against the new URL (with `cli/src/config-store.ts` pointed at it). |

**Total: ~17 days** to v1. Clickable demo URL by end of Phase 3 (~5 days in).

Each phase ends with a commit on its branch and a PR back to `main`. CI mirrors `bun run validate` (see §11). Tag the merge commit (`p0`, `p1`, …) to make per-phase rollback trivial.

### Status (2026-05-13)

- **P0 – P13: shipped** in the original rewrite track (#1 – #9).
- **P14 (Deploy): pending.** The Node preset is already configured in `nuxt.config.ts`; the runbook in `docs/deploy.md` is up to date; what's left is wiring the production environment and flipping the CLI's default registry to point at it.
- **P14a – P20: rewrite-completion track, all merged.** A second pass closed gaps the audit found at the end of the initial rewrite:
  - **P14a** — trim `CLAUDE.md` to short-form, point to this plan for details (#10).
  - **P14** — import `cli/` as a standalone Bun project; ship a cross-platform Node JS bundle (#10).
  - **P15** — port shadcn-vue primitives backed by reka-ui (#10).
  - **P16** — filter drawer pickers: DeptPicker, TagDrawer, CreatorPicker, PublisherPicker + facets endpoint (#11).
  - **P17** — 4-step publish wizard with live preview + `publish/[id]/edit` resume flow (#11).
  - **P18** — `/profile` My Workspace page with 9 components + 3 internal endpoints (#12).
  - **P19** — split the detail page into hero / about / tabs / related + InstallCommand / ShareButton / SaveButton (#12).
  - **P20** — `nuxt-og-image` for social previews + Playwright browse / detail / navigation specs (#12).

The "P14" label is reused intentionally — the original P14 (Deploy) never executed before the rewrite-completion track began, so P14a was named to avoid clashing with the unfinished P14 deploy work.

### P1 (post-v1)

- Publisher dashboard improvements (install metrics, version diffs)
- Collection sharing
- Ratings & reviews UI on detail page
- View events + trending calculation
- CLI installers for MCP / slash commands / plugins (in the carried-over CLI repo)

### P2

- MDX docs site at `/docs`
- SSO / SAML for enterprise sign-up
- Multi-tenant UI (org switcher, per-org branding)
- Meilisearch swap-in (only if Postgres FTS is hitting limits)

---

## 11. Validate pipeline

`bun run validate` is the primary command — the fast inner loop that mirrors the first four steps of CI. It chains four steps in order, failing fast. The fifth gate, `bun run test:integration`, runs PGlite-backed repository tests; CI runs it on every PR but it's not part of `validate` (kept separate so the local typecheck/test loop stays under a few seconds). Phase 0 landed a working `bun run validate` against the bare scaffold; every subsequent phase keeps it green.

```bash
bun run prepare           # nuxi prepare — generates .nuxt/types/* (needed for typecheck)
bun run lint              # @nuxt/eslint over the whole tree
bun run typecheck         # nuxi typecheck (vue-tsc) — handles .ts, .vue, auto-imports
bun run test              # vitest run — unit + contract suites
bun run test:integration  # vitest run -c vitest.config.integration.ts — PGlite repo suite (separate, slower)
```

### Tools

| Step | Tool | Why |
|---|---|---|
| Prepare | `nuxi prepare` | Generates type shims for auto-imports (`useFetch`, `useAsyncData`, `definePageMeta`, components, composables). Without it, `vue-tsc` errors on every auto-imported symbol. CI must run this before `typecheck`. |
| Lint | `@nuxt/eslint` | Auto-configures ESLint rules for Vue 3 + TS + Nuxt 4. Replaces `eslint-config-next`. |
| Typecheck | `nuxi typecheck` → `vue-tsc` | `tsc --noEmit` doesn't understand `.vue` SFCs. `vue-tsc` is the wrapper that does. |
| Unit / component tests | Vitest + `@nuxt/test-utils` + `@vue/test-utils` + happy-dom | Vitest is the runner; `@vue/test-utils` for `mount()`; `@nuxt/test-utils` for components that touch Nuxt runtime (auto-imports, `useFetch`, `useNuxtApp`) via `mountSuspended()`. |
| Integration | Vitest + PGlite (`@electric-sql/pglite` + `drizzle-orm/pglite`) | In-process Postgres-in-WASM with real Drizzle migrations applied. Covers `server/repositories/**` — same SQL dialect as production, no Docker. Runs as a separate suite via `bun run test:integration`. |
| E2E | Playwright | Same library as the original. Runs against a dev server with seeded data. Local on demand + nightly CI; **not** per-PR. |

### What gets tested where

Five tiers, each with a distinct boundary. Together they cover the codebase end-to-end without leaning on any single layer past its strengths.

- **Pure unit** (`shared/**/*.test.ts`, `app/**/*.nuxt.test.ts`) — pure logic, validators, composables, components. Vitest, no DB, no real network. Includes the *decisions* extracted from server orchestrators: `shared/extensions/state.ts` (`decideScanOutcome`, `decidePublishOutcome`), `shared/installs/record.ts` (`pickInstallVersion`). Highest leverage, cheapest to write.
- **Integration** (`tests/integration/repositories/*.test.ts`) — every function in `server/repositories/**` exercised against PGlite with real Drizzle migrations applied. PGlite is Postgres-in-WASM: same SQL dialect as production, in-process, no Docker. This tier is where SQL is verified — generated columns, FTS, `pg_trgm`, dotted-path `LIKE`, transaction semantics.
- **Orchestrator unit** (`server/utils/*.test.ts`, `server/api/**/*.test.ts`) — adapter logic that composes repository calls inside transactions. The **repository module is mocked**, never Drizzle's builder. Verifies orchestration shape (which repo methods get called, in what order, with what arguments), error mapping, and transaction wiring. Fast.
- **Contract** (`tests/contract/*.test.ts`) — Zod schemas assert that the JSON payloads documented in `docs/api.md` parse against each `/api/v1` endpoint's response shape. Shape-only, no DB. Catches accidental contract drift before the CLI does.
- **E2E** (`tests/e2e/*.spec.ts`) — Playwright against a dev server with seeded data. Owns full-stack flows. Slow, not per-PR.

The structural rule that makes the tiers coherent: **Drizzle's query builder is called only inside `server/repositories/`**. Every other layer (`server/utils/`, `server/api/`, jobs) takes a `Transactable` (= `PostgresJsDatabase | PgTransaction`) and calls named repository functions. Transactions are opened at orchestrator boundaries and the `tx` is threaded down through repo calls. Without this rule, "mock the repo" devolves into "mock Drizzle chains" — coupling tests to query implementation and bypassing the Postgres-specific features the integration tier is the only place to verify.

### CI

`.github/workflows/ci.yml` runs `bun run validate` plus the integration suite on every PR push:

```yaml
- bun install --frozen-lockfile
- bun run prepare
- bun run lint
- bun run typecheck
- bun run test                # main Vitest suite (unit + contract)
- bun run test:integration    # PGlite repository suite
```

`bun run validate` itself stays fast (no PGlite) — the integration suite is a separate script. CI runs both per-PR; local devs run `test:integration` when touching repositories or schema.

A nightly `.github/workflows/e2e.yml` runs Playwright against a seeded test database. Slow + needs DB + browser, so not on every PR.

### Locked tooling decisions

- **`vue-tsc` is the typechecker.** Do not try to substitute `tsc --noEmit`; it can't read `.vue`. The `bun run typecheck` script wraps `nuxi typecheck`.
- **`nuxi prepare` runs before `typecheck` and `lint`.** It's idempotent and fast; always include it. CI must run it after `bun install`.
- **Drizzle is only imported inside `server/repositories/`.** Every other layer takes a `Transactable` and calls repo functions. Mocking the Drizzle builder is banned — refactor the call into a repo function and mock that instead. Repository functions themselves are integration-tested against PGlite, never mocked.
- **PGlite is the integration DB.** Same SQL dialect as production, in-process, ~50ms cold-start. Commit 2 of P21 includes a smoke check exercising the Postgres-specific features this app uses most: `tsvector` / FTS, `pg_trgm`, dotted-path `LIKE`. If any of these fail on PGlite, fall back to a Docker Postgres service container — but only if needed; the default is PGlite.
- **`test:integration` is not part of `validate`.** It's a separate, slower gate (still per-PR in CI). Local devs run it explicitly when touching `server/repositories/**` or `shared/db/schema/**`. Same rationale as Playwright before it: keep the local validate loop tight.
- **Playwright is not part of `validate`.** It's a separate, slower gate. Run locally with `bun run test:e2e` on demand; CI runs nightly.

---

## 12. Coverage & maintainability

The original Next.js project relied on culture ("add a colocated test") for test coverage, with no CI threshold. This rewrite tightens that: coverage is a CI gate, with per-area thresholds calibrated to where logic lives. The goal is a codebase that survives 30k+ LOC without regressing into "we don't really test that" rot.

### Coverage thresholds (CI-enforced)

| Area | Lines | Branches | Why |
|---|---|---|---|
| `shared/**` (pure logic) | **≥ 95%** | **≥ 90%** | Validators, search query builder, state machine, utilities. Highest leverage; cheapest to test; load-bearing. |
| `app/composables/**` | ≥ 90% | ≥ 85% | Mostly pure (filter parse/serialize, tag-label resolver). |
| `server/repositories/**` | ≥ 90% | ≥ 85% | Drizzle lives only here. Coverage comes from the integration suite (PGlite). |
| `server/utils/**` | ≥ 85% | ≥ 80% | Orchestrators over repos + helpers (auth, storage, inngest). Coverage from unit tests with mocked repos. DB client singleton excluded. |
| `server/api/**` | ≥ 70% | ≥ 65% | Endpoints are thin adapters; logic lives in `shared/` or `server/utils/`. End-to-end behavior covered by Playwright. |
| `app/components/**` | ≥ 60% overall; ≥ 80% for interactive components (FilterBar, UploadWizard, InstallButton) | — | Component logic that branches on state earns its own tests; pure-layout components are covered by Playwright. |
| `app/pages/**`, `app/layouts/**`, `app/app.vue` | excluded | — | Composition only; Playwright owns this layer. |
| `cli/**` | unchanged from original | — | Carried over with its existing tests. |

Configured in `vitest.config.ts`. The `include` list deliberately scopes coverage measurement to the *currently tested* surface — files not yet in the test pyramid (`server/api/**`, `server/utils/{auth,db,storage,inngest,publish}.ts`, `server/utils/jobs/**`, `server/utils/queries/**`, `app/pages/**`, `app/components/{extension,filters,publish,ui}/**`, layout components without tests) stay outside the include so they're not silently averaged in at 0%. Add a path to `include` only after its tests actually land.

```ts
test: {
  coverage: {
    provider: "v8",
    reporter: ["text", "html", "lcov"],
    include: [
      "shared/validators/**",
      "shared/search/**",
      "shared/extensions/**",
      "shared/installs/**",
      "shared/tags.ts",
      "shared/taxonomy.ts",
      "shared/theme.ts",
      "app/composables/useFilters.ts",
      "app/composables/usePublishWizard.ts",
      "app/composables/useTheme.ts",
      "server/utils/extensions-state.ts",
      "server/utils/installs.ts",
    ],
    exclude: ["**/*.test.ts", "**/*.spec.ts", ".nuxt/**", ".output/**"],
    thresholds: {
      lines: 85, branches: 75, functions: 85, statements: 85,
      "shared/validators/**":   { lines: 95, branches: 90, functions: 95, statements: 95 },
      "shared/search/**":       { lines: 95, branches: 87, functions: 95, statements: 95 },
      "shared/extensions/**":   { lines: 95, branches: 90, functions: 95, statements: 95 },
      "shared/installs/**":     { lines: 95, branches: 90, functions: 95, statements: 95 },
      "shared/tags.ts":         { lines: 95, branches: 90, functions: 95, statements: 95 },
      "shared/taxonomy.ts":     { lines: 95, branches: 90, functions: 95, statements: 95 },
      "shared/theme.ts":        { lines: 95, branches: 90, functions: 95, statements: 95 },
      "server/utils/extensions-state.ts": { lines: 95, branches: 90, functions: 95, statements: 95 },
      "server/utils/installs.ts":         { lines: 95, branches: 85, functions: 95, statements: 95 },
      "app/composables/useFilters.ts":      { lines: 90, branches: 75, functions: 90, statements: 90 },
      "app/composables/usePublishWizard.ts": { lines: 90, branches: 85, functions: 85, statements: 85 },
      "app/composables/useTheme.ts":         { lines: 90, branches: 85, functions: 90, statements: 90 },
    },
  },
}
```

`server/repositories/**` coverage is computed by the integration suite (PGlite). The integration suite's `vitest.config.integration.ts` does not yet emit coverage by default — merging into the main lcov is a CI-side concern. Today the integration suite verifies behavior; the threshold for `server/repositories/**` is enforced de facto by "every repo function has integration test coverage" rather than a numeric gate. Adding the numeric gate is a follow-up.

CI runs `bun run test:coverage` and uploads the HTML report as a build artifact. A PR that drops any thresholded subdir below its gate fails CI; reviewers don't have to remember to check. Aspirational thresholds in the table above (e.g. `server/api/**: 70`, `app/components/**: 60–80`) land as those surfaces get test coverage in future PRs.

### Patch coverage rule

Coverage thresholds protect the aggregate; patch coverage protects each PR from sneaking in untested code under a high-coverage average. Rule:

> A PR cannot reduce coverage of any file it touches by more than 3 percentage points.

Enforced in CI by diffing `lcov.info` between the PR head and `main`. Practically: if you change a function, you either keep its existing test coverage or add tests to compensate.

### TypeScript strictness

Beyond `strict: true` (already locked), enable:

- **`noUncheckedIndexedAccess: true`** — `arr[i]` returns `T | undefined`. Forces handling the missing case. The single change that catches the most "but it always exists" bugs.
- **`noImplicitOverride: true`** — `override` keyword required when overriding parent methods. Cheap, catches refactor mistakes.

**`exactOptionalPropertyTypes` was tried and dropped in P15.** Vue's `defineProps` adds explicit `undefined` to optional prop types, and reka-ui's prop-forwarding helpers (`useForwardProps`, `useForwardPropsEmits`) then route those values into reka-ui's stricter optional props, which refuse explicit `undefined`. The result is dozens of `TS2379` errors at every shadcn-vue forwarding boundary. The fix would be either casting at each forward site or relaxing the flag globally — the former is verbose and ts-ignorant; the latter loses the "JSON-serializer-shape-drift" guarantee that motivated the flag. Since the marketplace doesn't have a hot JSON-shape-drift path that this flag was preventing, the trade favoured relaxing.

These cost ~1 extra hour of TS friction per phase and pay it back the first time a `(items[0] as Item).foo` would have crashed in production.

### Layer boundaries

The directory layout encodes a dependency graph. Enforce it in ESLint so violations get caught at write time:

```text
shared/                              ──►  (nothing else)                # leaf — pure code, no framework, no Drizzle
server/repositories/                 ──►  shared/db/schema, drizzle-orm  # the ONLY place Drizzle is imported
server/utils/, server/api/, server/plugins/, server/jobs/
                                     ──►  server/repositories/, shared/  # take Transactable; never import drizzle-orm
app/                                 ──►  shared/                        # may import shared/, not server/ (only $fetch over the wire)
cli/                                 ──►  (its own world)                # standalone Bun workspace; only talks to /api/v1
```

`eslint.config.mjs` uses `no-restricted-imports` with glob patterns:

```js
{
  files: ["app/**"],
  rules: { "no-restricted-imports": ["error", { patterns: ["server/*", "~~/server/*"] }] },
},
{
  files: ["server/**"],
  ignores: ["server/repositories/**", "server/utils/db.ts", "server/plugins/db.ts"],
  rules: {
    "no-restricted-imports": [
      "error",
      { patterns: ["app/*", "~/*", "drizzle-orm", "drizzle-orm/*"] },
    ],
  },
},
{
  files: ["server/repositories/**", "server/utils/db.ts", "server/plugins/db.ts"],
  rules: { "no-restricted-imports": ["error", { patterns: ["app/*", "~/*"] }] },
},
{
  files: ["shared/**"],
  rules: {
    "no-restricted-imports": [
      "error",
      { patterns: ["app/*", "server/*", "~/*", "~~/server/*", "drizzle-orm", "drizzle-orm/*"] },
    ],
  },
},
```

The `server/**` rule with `ignores` ensures Drizzle imports outside `server/repositories/`, `server/utils/db.ts`, and `server/plugins/db.ts` are rejected at lint time. This is what makes the repository boundary load-bearing rather than a convention.

This is the single rule that keeps the codebase navigable as it grows. Without it, `shared/` slowly grows imports from `server/`, then `app/`, then nothing is testable in isolation.

### Other lint rules

- **`@typescript-eslint/no-explicit-any: error`** — `any` is a code smell. Document exceptions with `// reason: ...` directly above the `any`.
- **`@typescript-eslint/no-floating-promises: error`** — unawaited `$fetch()` calls are the #1 source of "why didn't my mutation happen" bugs.
- **`vue/multi-word-component-names: error`** — Vue best practice; avoids collisions with HTML elements.
- **`vue/no-unused-refs: error`**, **`vue/require-explicit-emits: error`** — common Vue trapdoors.
- **No barrel files** (`index.ts` re-exports) — direct imports from source. Hurts tree-shaking; causes circular imports. The single allowed exception is `shared/db/schema/index.ts` because Drizzle needs the `schema` namespace as a single module.

### Test types in this repo

| Layer | Test type | Tool |
|---|---|---|
| `shared/**` pure logic | Unit | Vitest |
| `app/composables/**` | Unit (pure) or via consuming component (Nuxt internals) | Vitest + `@nuxt/test-utils/runtime` |
| `app/components/**` | Component | Vitest + `@vue/test-utils` + `mountSuspended()` |
| `server/repositories/**` | Integration | Vitest + PGlite (`@electric-sql/pglite` + `drizzle-orm/pglite`) |
| `server/utils/**`, `server/api/**` | Orchestrator unit (repo mocked, not Drizzle) | Vitest |
| `/api/v1/**` JSON shapes | Contract | Vitest, asserts `docs/api.md` payloads against Zod schemas |
| End-to-end | E2E | Playwright, seeded DB |

### Per-phase coverage discipline

Each phase PR ships:

1. The feature.
2. Tests for any new `shared/**` code at the ≥ 95% line threshold.
3. Tests for any new endpoint adapter logic via extracted pure functions.
4. Component tests for any new interactive component (forms, multi-step flows, anything with branching state).
5. A Playwright spec update if the feature is reachable from a new URL.

Reviewers reject PRs that ship `shared/**` code without unit tests. This is a hard rule, not a "would be nice." The cost of letting one through is the seed of "we don't really test that area" — easier to never start.

### What this does not include

Deliberately out of scope for v1:

- **Mutation testing** (Stryker): high-value but slow to wire; revisit at v2 if coverage starts feeling like vanity.
- **Visual regression** (Playwright screenshots): defer to P13 polish; needs a stable design first.
- **Storybook / Histoire** for component documentation: defer; not load-bearing for a v1 codebase.
- **External coverage trend service** (Codecov, Coveralls): the local-first deploy target rules out per-PR third-party uploads as a hard dependency. CI artifact is sufficient.

---

## 13. Commit & PR rules

The original Next.js project locked "Conventional Commits, one coherent unit per commit, phase scope." That carries over verbatim. This section spells out the parts that were left informal — granularity, breaking-change handling for `/api/v1`, merge strategy, the per-commit vs. per-PR validate split, and the hook tooling.

### Commit message format

```
<type>(<scope>): <one-line summary, lowercase, no trailing period>

<body — optional. Why, not what. Wraps at 72 chars.
Reference incidents, surprising decisions, or invariants the diff doesn't show.>

<footer — optional. BREAKING CHANGE, Closes #N, …>
```

### Types

`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `revert`, `style`. Use the type that describes the dominant change in the commit. A commit that's "feat plus its tests" is `feat`, not split.

### Scopes

Two scope shapes used here:

- **Phase scope** during the v1 build: `p<N>-<short>` matching §10. Example: `feat(p3-browse): wire filter chips to query string`. Use this for any commit that lands a phase deliverable.
- **Feature scope** for hotfixes during v1 and all post-v1 work: a short noun for the area touched. Examples: `fix(filter-bar): preserve dept on locale switch`, `refactor(install-button): extract install state machine`, `chore(deps): bump drizzle 0.45 → 0.46`.

If a commit spans two scopes evenly, that's a smell — split it.

### Commit granularity — one coherent unit per commit

A phase is one or several commits. Default to **one coherent unit per commit** — a single focused change that compiles and stands on its own. The exact number of commits per phase depends on the work: a mechanical port may be one commit per phase; a feature build may be several. Optimise for "the diff tells a clear story", not for a target commit count.

Calibration:

| Granularity | Example | Verdict |
|---|---|---|
| Too small | `feat: rename variable in ext-card.vue` | No — file-by-file noise |
| Right | `chore(p0): install @nuxt/eslint and base config` | Yes |
| Right | `feat(p2-db): add extension drizzle schema` | Yes |
| Right | `feat(p3-browse): ExtCard component + test` | Yes — code + its tests usually one commit |
| Right | `feat(p3-browse): wire ExtCard into home grid` | Yes |
| Right | `feat(p15-ui): port shadcn-vue primitives` covering ~28 generated wrappers (Button + Input + Label + Textarea + Checkbox + Skeleton + Dialog × 6 + Sheet × 4 + Popover × 3 + Select × 5 + Tabs × 4) | Yes — single mechanical unit |
| Too big | `feat(p3-browse): browse page` covering 8 unrelated files | No — split where the story changes |

Tests usually live with the code they cover in the same commit. The exception is adding tests to *existing* code as a coverage-improvement pass — then the test commit stands alone.

Always-split boundaries (these go in separate commits even if "small"):

- Database schema / migration vs. application code that uses it.
- Refactor vs. new feature (refactor first; feature on top).
- Generated code (migrations, lockfile updates) vs. source.
- Dependency install (`chore`) vs. first use (`feat`).

### Per-commit vs. per-PR validate

The validate suite has two gates with different strictness:

- **Each commit must compile and `bun run typecheck` must pass.** This is the per-step gate. Strict enough to keep history bisectable; loose enough that you can land a Zod validator in one commit before its consumer in the next.
- **The PR head must pass full `bun run validate`** (lint + typecheck + test + coverage thresholds). This is the per-PR gate. Enforced by the `pre-push` hook locally and by CI on the PR.

This split is intentional. Trying to make every single commit hit 95% coverage on `shared/**` would force unnatural test-first-then-code ordering. Coverage is a PR-boundary property, not a commit-boundary property.

### Breaking changes

The `/api/v1` contract is the only thing in this repo that can break external consumers (the CLI). If you change a v1 endpoint's response shape, request shape, or status semantics, mark the commit with both `!` and a `BREAKING CHANGE:` footer:

```
feat(p7-api)!: bundle endpoint returns 410 for archived versions

BREAKING CHANGE: GET /api/v1/extensions/:slug/bundle previously returned 503
for archived versions; it now returns 410 Gone. CLI < 0.3.0 will misinterpret
this. Bump the CLI minimum and document the upgrade in cli/CHANGELOG.md.
```

CI's contract suite (`tests/contract/`) fails when a v1 response shape changes without these markers — a hard gate, not a convention. Anything else (internal endpoints, components, schema before v1.0 ships) doesn't need the marker; update `docs/plan.md` instead.

### Hard rules

- **No `--amend` once a commit is on a pushed branch.** Pushed history is shared. Local pre-push amends are fine.
- **No `--force` / `--force-with-lease`** on pushed branches. Use a corrective commit (`fix: the previous commit broke X`) or `revert` instead.
- **No `--no-verify`.** If a hook is wrong, fix the hook in its own commit; don't bypass.
- **No squash-then-amend dance to "clean up" a PR.** PRs are reviewed and merged with their commit history intact. A 20-noisy-commits PR is a PR-shape problem, not a history-cleanup problem — split the work earlier.

### Merge strategy

PRs merge as **merge commits**, not squash, not rebase. Each phase's commit history is preserved on `main`.

Rationale:

- The phase-internal commit split exists for a reason — squashing a phase into one commit destroys that.
- `git log --first-parent main` gives the high-level view (one entry per merged PR); `git log main` gives the per-commit detail. Both are useful.
- `git bisect` is more precise with smaller commits visible on `main`.
- Per-step commit messages stay searchable on `main` instead of being collapsed into one PR-shaped blob.

Configure GitHub to disable "Allow squash merging" and "Allow rebase merging" on the repo, leaving only "Allow merge commits."

### Hooks (Phase 0 deliverable)

Phase 0 installs:

- **`@commitlint/cli` + `@commitlint/config-conventional`** — validates commit-msg format. Also runs in CI over the PR's commit range as a backstop.
- **`husky`** — manages the hooks.
- **`lint-staged`** — pre-commit, runs `@nuxt/eslint --fix` on staged files only.

Hook layout:

| Hook | Runs | Purpose |
|---|---|---|
| `commit-msg` | `commitlint --edit` | Reject commits that don't match Conventional Commits |
| `pre-commit` | `lint-staged` (ESLint on staged files) | Fast; catches obvious lint regressions |
| `pre-push` | `bun run validate` | Full lint + typecheck + tests before sharing |

Commit-msg is microsecond-fast. Pre-commit is staged-files only so it stays under a few seconds. Pre-push runs the full suite — the longest hook, but it's the one that protects shared state.

### AI agent workflow

For AI agents working in this repo (Claude Code or otherwise):

1. Work in coherent units. When a unit lands, commit it; surface a diff summary (`git diff --stat` + key file changes) in the chat alongside the commit.
2. Pause for an explicit human checkpoint at **phase boundaries**, not at every commit. Within a phase, commit at coherent-unit boundaries without pausing for each one — pause when surprised, when a decision is required, or at the end of the phase.
3. Never run `git push` without an explicit request. Pushes happen at natural breaks (end of session, before review) — the `pre-push` hook then validates the accumulated commits.
4. Never bypass hooks (`--no-verify`). If a hook fails, investigate and fix the underlying issue rather than skipping.
5. Each phase ends with an explicit human checkpoint; the agent does not auto-start the next phase.
6. When asked to "fix a previous commit," create a new corrective commit — do not amend or rebase.

### PR rules

A PR == one phase or one coherent post-v1 feature. PR title is a Conventional Commit summary (the same line that will appear in the merge commit). PR body:

```markdown
## Summary
- 1–3 bullets describing what changed

## Why
- Motivation, constraint, or incident this addresses (if non-obvious from Summary)

## Test plan
- [ ] What you ran locally
- [ ] What reviewers should verify

## Tradeoffs
- Alternatives considered, why this one won (only for non-trivial changes)
```

CI must be green before merge. Reviewer-requested changes go in as new commits on the PR branch — do not amend or force-push to address review.

---

## 14. Locked decisions

These are the v1 binding decisions. Identical to `CLAUDE.md` — repeated here so a planning reader has the whole picture in one place. Update this section in the same commit when any decision changes.

### Product

1. **Multi-tenant schema, single-tenant UI** — `organizations` table populated, single org for v1, no org switcher in UI. Multi-org flip is middleware-only later.
2. **Auth library**: Better Auth.
3. **Background jobs**: Inngest.
4. **Themes**: Editorial Ivory (default) + Dark + Mono Clean. Selected via a 3-way TopBar dropdown and persisted in the `theme` cookie.
5. **Bundle storage**: Supabase Storage (default). R2 via S3 SDK is a documented alternative.
6. **Install semantics**: real machine-side install via the Agent CLI. Web records install events; CLI does the work. CLI is **P0** and carries over from the Next.js repo unchanged.
7. **Sign-up policy**: open.
8. **Locale URLs**: always-prefixed (`/en/...`, `/zh/...`).
9. **Detail page README**: raw markdown stored, rendered server-side with markdown-it + DOMPurify. Manifest metadata rendered as a side panel.
10. **CLI strategy**: agent-agnostic with Claude-first defaults. Extensions declare per-agent install paths in the manifest; users override via `agentcenter config`.

### Technical (Nuxt-specific)

- **Deployment target**: local / self-hosted Node (Nitro `node-server` preset). Cloudflare is a stretch goal, not maintained alongside primary.
- **Database driver**: `drizzle-orm/postgres-js` over standard `DATABASE_URL`. No HTTP / edge drivers in v1.
- **Public API contract**: `/api/v1` JSON shapes are frozen. Breaking changes go through `v2`.
- **Server actions → endpoints**: every Next.js server action becomes a `server/api/internal/...` POST endpoint, validated with the same Zod schema.
- **UI library**: shadcn-vue (Reka UI under the hood). Components copied into `app/components/ui/`, not consumed from npm.

---

## 15. Deployment

### Primary: local / self-hosted Node

```ts
// nuxt.config.ts (excerpt)
export default defineNuxtConfig({
  nitro: { preset: "node-server" },
  // ...
})
```

```bash
bun install
bun run db:migrate
bun run db:apply-fts
bun run db:seed                # optional sample data
bun run build
PORT=3000 node .output/server/index.mjs
```

Reverse-proxy in front (nginx, Caddy) terminates TLS and forwards to the Node process. The CLI's `verificationUri` is the public origin + `/{locale}/cli/auth`, so the only env that matters at deploy is `BETTER_AUTH_URL` / `NUXT_PUBLIC_APP_URL`.

#### Required environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (Supabase or self-hosted) |
| `BETTER_AUTH_URL` | Public origin, e.g. `https://agentcenter.example.com` |
| `BETTER_AUTH_SECRET` | Random 32+ char string |
| `NUXT_PUBLIC_APP_URL` | Public origin (mirrors `BETTER_AUTH_URL`) |
| `SUPABASE_URL` | Storage endpoint (if using Supabase Storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage signing (server-side only) |
| `SUPABASE_BUCKET` | e.g. `agentcenter-bundles` |
| `INNGEST_EVENT_KEY` | From Inngest app settings |
| `INNGEST_SIGNING_KEY` | From Inngest app settings |

If using R2 instead of Supabase Storage, swap the three `SUPABASE_*` vars for `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. The decision is enforced by which presigning module `server/utils/storage.ts` imports.

### Stretch: Cloudflare

Documented but not maintained alongside primary. Two changes from the Node config:

```ts
nitro: { preset: "cloudflare_module" }
```

- Swap `postgres-js` for `@neondatabase/serverless` (or a Hyperdrive binding) — TCP doesn't work in Workers.
- Swap Supabase Storage for R2 via native binding (`event.context.cloudflare.env.BUCKET`) — the S3 SDK bloats the Worker bundle.

These swaps are localized to `server/utils/db.ts` and `server/utils/storage.ts`. Everything else is preset-agnostic.

### Inngest

- Local dev: `bunx inngest-cli@1.19.2 dev` (auto-discovers `/api/inngest`).
- Production: register the webhook URL `https://<origin>/api/inngest` in the Inngest dashboard.

---

## 16. Translation guide — Next.js → Nuxt

A handful of patterns from the original repo don't have a direct Nuxt equivalent. Where you'd reach for them, here's what to do instead.

| Next.js pattern | Nuxt translation |
|---|---|
| `app/[locale]/.../page.tsx` (RSC) | `app/pages/.../index.vue` with `useAsyncData` for SSR fetches (`@nuxtjs/i18n` auto-prefixes the locale) |
| `"use client"` component | A `.vue` SFC that uses reactivity normally; mark client-only branches with `<ClientOnly>` or use `.client.vue` if the whole component is browser-only |
| Server action (`'use server'`) called from form | POST endpoint at `server/api/internal/...` called with `$fetch` (use vee-validate + Zod on submit) |
| `revalidateTag('extensions')` after mutation | Either: (a) call `refresh()` on the page's `useAsyncData` handle, or (b) for cross-route invalidation use Nitro `defineCachedEventHandler` with versioned cache keys and bump the version |
| `getTranslations()` in RSC | `useI18n()` in `<script setup>`; also available in `useNuxtApp().$i18n` from server utils |
| `useTranslations()` in client component | `useI18n()` — same API in both contexts |
| `next/font` | `@nuxt/fonts` module |
| `next/link` | `<NuxtLink>` |
| `next/image` | `@nuxt/image` module (deferred to P13 polish; not P0) |
| `app/.../error.tsx` route boundary | `app/pages/.../[slug].vue` neighbour `error.vue`, or wrap pages in `<NuxtErrorBoundary>` |
| `notFound()` | `throw createError({ statusCode: 404, statusMessage: '...' })` |
| `cookies().get('theme')` in RSC | `useCookie('theme')` (works in both SSR and client) |
| `redirect('/en')` from server component | `await navigateTo('/en')` from setup, or `sendRedirect(event, '/en')` from a server endpoint |
| `react-markdown` + `rehype-sanitize` | `markdown-it` + `DOMPurify`, server-rendered in the `Markdown` component |
| `@base-ui/react` tabs in `ExtTabs` | `reka-ui` tabs primitive (shadcn-vue wraps it) |

---

## 17. Prototype-to-Nuxt mapping (load-bearing)

Same as the original. The data shapes from the prototype HTML are unchanged.

- `T` object in prototype HTML → `i18n/locales/en.json` + `i18n/locales/zh.json`, preserving keys verbatim.
- `DEPARTMENTS` constant → seeded into `departments` table; the dotted-path id is **kept verbatim as the primary key**. Load-bearing schema decision.
- `FUNC_TAXONOMY` → static TS in `shared/taxonomy.ts`, not a DB table.
- `TAG_LABELS` → seeded into `tags` table.
- `EXTENSIONS` array → `shared/db/seed.ts` rows.
- `MY_DEPT_ID` constant → comes from authenticated user's `defaultDeptId`.
- `isDescendant(deptId, ancestorId)` → moves into the SQL query (`OR LIKE 'ancestor.%'`), no client-side recursion.
- `FilterAreaB` (Mode B drawer) is the only filter mode to build.
