# CLAUDE.md — 089

City discovery app, Munich first. Product spec: `docs/PRODUCT_SPEC.md`. Planning docs: `docs/*.md`. Decisions: `docs/DECISIONS.md`.

## Current state

- Planning docs approved 2026-10-28. Building Phase 1 slice by slice in the order of `docs/ROADMAP.md`, **stopping for the owner's review after each slice**.
- Slice 1 (scaffold) done, pending review. Next: slice 2 (design system).

## How to work here (from spec Part 0)

1. **Inspect before changing.** Read the relevant code and docs first. Never replace working code without saying why.
2. **Small vertical slices.** One feature end to end; each slice is reviewed before the next starts.
3. **Never fabricate data.** No invented places, hours, prices, reviews, events, crowd levels or ratings — not even as "realistic" seeds. Tests use obvious fixtures ("Test Place 1", city "Testburg"). User-facing data comes only from licensed sources listed in `docs/DATA_SOURCES.md`.
4. **Verify external facts.** Before relying on a provider (terms, pricing, limits, licence), check the official docs and update its row in `docs/DATA_SOURCES.md` with the date.
5. **Secrets never in the client.** The app holds only the Supabase anon key and the public tile URL. Service-role keys live in GitHub Actions / Vercel / Edge Function env only.
6. **Ask the owner** about brand, paid services, legal entity details and API keys. Otherwise choose a sensible default and log it in `docs/DECISIONS.md`.
7. **No new dependency without a reason**, written in the commit message.
8. **Definition of done:** typed end to end · zod-validated inputs · loading/empty/error states designed · works gracefully offline · accessible (labels, contrast from tokens, dynamic type, 44pt targets) · unit tests for logic + ≥ 1 integration test per data flow · no console errors/warnings.
9. Keep this file current: add commands, conventions and gotchas as they appear.

## Conventions

- TypeScript strict everywhere; no `any` (use `unknown` + zod). Shared schemas/types in `packages/core`; DB types generated into `packages/db` (never hand-edited).
- **Expo Go compatibility (ADR-025):** only use native modules that Expo Go includes. Anything else (today: MapLibre) is lazy-loaded behind `isExpoGo` from `src/lib/runtime.ts` with a designed fallback, and gets a test proving it isn't loaded in Expo Go (see `CityMap.test.tsx`).
- Styling only through design tokens (`packages/tokens`); no raw colours/sizes in components.
- All user-facing strings go through i18n (`de` and `en` both required; CI checks for missing keys).
- Timestamps are `timestamptz`; city-time logic uses the city's timezone (`Europe/Berlin`), never the device's.
- Business logic with ranking/geo/time lives in versioned Postgres RPCs (`*_v1`). Clients don't compose complex queries.
- Every table has RLS and a pgTAP test. Migrations are hand-written, append-only and never edited after staging.
- The editorial layer (`place_editorial`, `media`, `collections`) never stores values copied from OSM (ODbL, see `docs/ANALYSIS.md` §4.9).
- Every displayed source needs attribution (see `docs/DATA_SOURCES.md` → "Attribution shown in the app").
- Analytics events only from the list in `docs/APP_STRUCTURE.md` §4, only after consent. Never send coordinates or search text.
- Commits: small, imperative subject, explain _why_; justify new dependencies.

## Commands

Run from the repo root. pnpm is pinned in `package.json` (`packageManager`); on this machine call it as `corepack pnpm …` (see Gotchas).

| Command                                                             | What it does                                                           |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm install`                                                      | Install all workspaces                                                 |
| `pnpm check`                                                        | Lint + typecheck + test everything (what CI's first job runs)          |
| `pnpm lint` / `pnpm typecheck` / `pnpm test`                        | Individually, via Turborepo                                            |
| `pnpm format` / `pnpm format:check`                                 | Prettier (CI fails on unformatted files)                               |
| `pnpm dev:web`                                                      | Next.js on http://localhost:3089                                       |
| `pnpm dev:go`                                                       | Metro for **Expo Go** (iPhone/Android, no dev build): scan the QR code |
| `pnpm dev:mobile`                                                   | Metro for the dev client (needs a dev build installed on the device)   |
| `pnpm --filter @089/web build`                                      | Production web build                                                   |
| `pnpm --filter @089/mobile export:check`                            | Metro-bundle iOS + Android JS (no native toolchain needed)             |
| `pnpm --filter @089/mobile doctor`                                  | expo-doctor: SDK version alignment and config checks                   |
| `npx eas-cli@latest build --profile development --platform android` | Cloud dev build (run inside `apps/mobile`; needs Expo login)           |

First-time setup: copy `apps/mobile/.env.example` → `apps/mobile/.env.local` and `apps/web/.env.example` → `apps/web/.env.local`.

Later slices add: `supabase start`, `supabase db reset`, `pnpm --filter ingest run osm`.

## Layout

- `apps/mobile` — Expo SDK 58 app. Routes in `src/app/` (Expo Router), features in `src/features/`, shared UI in `src/design/`, infra in `src/lib/`, strings in `src/locales/`.
- `apps/web` — Next.js 16 (public pages + `/admin` later). Source in `src/`.
- `packages/core` — zod schemas (env), locale helpers, later domain logic. `packages/tokens` — design tokens + contrast tests. `packages/db` — generated Supabase types (empty until slice 3). `packages/config` — shared tsconfig + ESLint rules.
- Workspace packages export TypeScript source (`"exports": "./src/index.ts"`); Next lists them in `transpilePackages`.

## Environment notes

- Developer machine: Windows 11, Node 24, git 2.54. **No Android SDK, Java, Xcode or Docker installed**, so native dev builds go through EAS cloud builds (or install Android Studio). Docker is needed for `supabase start` from slice 3.
- The public Overpass API is overloaded and not for production use; ingestion uses Geofabrik extracts.

## Gotchas

- `corepack enable` fails here (no write access to `C:\Program Files\nodejs`), and the global `pnpm` is 9.x. Use `corepack pnpm …` to get the pinned 10.x. Turborepo calls the global pnpm for scripts, which is fine.
- pnpm refuses to reinstall without a TTY; set `CI=true` (and `--no-frozen-lockfile` when the lockfile must change).
- Windows PowerShell 5.1 `Set-Content -Encoding utf8` writes a BOM, which breaks `package.json` parsing in Expo. Edit JSON with the Edit tool or Bash, not PowerShell.
- TypeScript 6 no longer loads all `@types/*` automatically: list them in `compilerOptions.types` (e.g. `"jest"` in the mobile tsconfig).
- Use the TypeScript version Expo pins (`~6.0.x`), not the latest (7.x); typescript-eslint also requires < 6.1.
- Expo inlines `EXPO_PUBLIC_*` (and Next `NEXT_PUBLIC_*`) only for static `process.env.NAME` references: list each variable explicitly in `env.ts`.
- MapLibre RN and dev-client code don't run in Expo Go; `CityMap.web.tsx` is the web fallback.
- `git config core.longpaths true` is set: some react-native paths in `node_modules` exceed Windows' 260-char limit.
