# CLAUDE.md — 089

City discovery app, Munich first. Product spec: `docs/PRODUCT_SPEC.md`. Planning docs: `docs/*.md`. Decisions: `docs/DECISIONS.md`.

## Current state

- Planning docs approved 2026-10-28. Building Phase 1 slice by slice in the order of `docs/ROADMAP.md`, **stopping for the owner's review after each slice**.
- Slices 1 (scaffold) and 2 (design system) done and committed. Since then: designed Explore (live clock + DWD weather + categories), Events (day strip), Saved, Search and category screens with honest empty states, and a real map in Expo Go (ADR-028/029).
- Slice 3 (database core) built 2026-10-29, pending review: migrations in `supabase/migrations`, pushed to the hosted project `089-dev` (ADR-030/031); 56 pgTAP tests pass there. Places stay empty until slice 4 (ingestion). Code is on GitHub: `resick/089` (private).
- 2026-10-31, owner decisions (ADR-032/033): the **map is the home screen** with floating category quick filters; **monochrome Apple-like redesign**; roadmap order is now map + look → slice 4 real places → accounts (email code, Apple, Google; profiles) → full reviews + user/business place suggestions via an editor queue. Map-first + redesign built, pending review.
- Next: slice 4 (ingestion pipeline), after the owner's review.

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
- Styling only through design tokens (`packages/tokens`); no raw colours/sizes in components. Look (ADR-033): monochrome; gold only for the wordmark and selected states; category colours only on map pins and the no-photo header; `GlassView` (frosted) only for controls floating over the map; cards use `borderCurve: 'continuous'`.
- The basemap is OpenFreeMap restyled in code (`features/map/basemapStyle.ts` + `mapPalette` tokens): change map colours there, not in the style URL. Build screens from `@/design/components`; style with `makeStyles((t) => …)` from `@/design/theme`; render text only with `<Text variant color>`.
- A pressable never contains another pressable (DESIGN_SYSTEM §5). Put secondary actions (Save) beside the card's pressable area.
- Gallery and tests use obvious fixtures from `src/features/gallery/fixtures.ts`.
- Screens use `<Screen>` (safe area, gutter, section rhythm). Until a feature has real data, it shows a designed `EmptyState` saying which roadmap slice brings it: never fake content.
- External API responses are zod-validated at the boundary (see `features/weather/brightSky.ts`).
- Public database reads go through `supabaseGet` (`src/lib/supabaseRest.ts`, plain fetch + publishable key) and are zod-validated (see `features/categories/categories.ts`); supabase-js arrives with sign-in in slice 11. Translatable DB text is parsed with `i18nTextSchema` and shown with `pickLocale` from `@089/core`.
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

| Command                                                             | What it does                                                                                       |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm install`                                                      | Install all workspaces                                                                             |
| `pnpm check`                                                        | Lint + typecheck + test everything (what CI's first job runs)                                      |
| `pnpm lint` / `pnpm typecheck` / `pnpm test`                        | Individually, via Turborepo                                                                        |
| `pnpm format` / `pnpm format:check`                                 | Prettier (CI fails on unformatted files)                                                           |
| `pnpm dev:web`                                                      | Next.js on http://localhost:3089                                                                   |
| `cd apps/mobile` then `npx expo start`                              | **Run on a phone:** scan the QR code with Expo Go (same Wi-Fi; add `--tunnel` if it can't connect) |
| `pnpm dev:mobile`                                                   | Same as above, from the repo root                                                                  |
| `pnpm --filter @089/web build`                                      | Production web build                                                                               |
| `pnpm --filter @089/mobile export:check`                            | Metro-bundle iOS + Android JS (no native toolchain needed)                                         |
| `pnpm --filter @089/mobile doctor`                                  | expo-doctor: SDK version alignment and config checks                                               |
| `npx eas-cli@latest build --profile development --platform android` | Cloud dev build (run inside `apps/mobile`; needs Expo login)                                       |

First-time setup: copy `apps/mobile/.env.example` → `apps/mobile/.env.local` and `apps/web/.env.example` → `apps/web/.env.local`.

**Database** (Supabase CLI pinned as a root devDependency; the repo is linked to `089-dev`, ref `bjvnohtevuurkqjcyxzh`; needs `npx supabase login` once per machine):

| Command                             | What it does                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `npx supabase migration new <name>` | New empty migration file (then write the SQL by hand)                                      |
| `corepack pnpm db:push`             | Apply new migrations to `089-dev`                                                          |
| `corepack pnpm db:test`             | Run the pgTAP tests against `089-dev`, rolled back (no Docker needed)                      |
| `corepack pnpm db:types`            | Regenerate `packages/db/src/database.types.ts` from `089-dev` (commit it; CI checks drift) |
| `npx supabase db advisors --linked` | Supabase's security/performance linter; keep it at "No issues found"                       |

With Docker: `supabase start` (applies migrations + `seed.sql` fixtures), `supabase test db`. Later slices add `pnpm --filter ingest run osm`.

## Layout

- `apps/mobile` — Expo SDK 58 app. Routes in `src/app/` (Expo Router), features in `src/features/`, shared UI in `src/design/`, infra in `src/lib/`, strings in `src/locales/`.
- `apps/web` — Next.js 16 (public pages + `/admin` later). Source in `src/`.
- `packages/core` — zod schemas (env), locale helpers, later domain logic. `packages/tokens` — design tokens + contrast tests. `packages/db` — generated Supabase types (empty until slice 3). `packages/config` — shared tsconfig + ESLint rules.
- Workspace packages export TypeScript source (`"exports": "./src/index.ts"`); Next lists them in `transpilePackages`.

## Environment notes

- Developer machine: Windows 11, Node 24, git 2.54. **No Android SDK, Java, Xcode or Docker installed**, so native dev builds go through EAS cloud builds (or install Android Studio). Docker is needed for `supabase start` from slice 3.
- The public Overpass API is overloaded and not for production use; ingestion uses Geofabrik extracts.

## Gotchas

- After changing `.env.local`, restart Metro: Expo reads env files only at startup, and hot reload can leave a stale bundle.
- Jest has no `.env.local`; `apps/mobile/jest.env.js` sets obviously-fake public env values for tests.

- React Native Testing Library 14: `fireEvent` and `render` are async. Always `await` them, or later tests fail with "overlapping act() calls".
- Jest can't load `lucide-react-native`'s ESM build; `moduleNameMapper` in `apps/mobile/package.json` points it at the CJS build.
- React Compiler lint (`react-hooks/refs`) forbids `useRef(new Animated.Value()).current`. Use `const [value] = useState(() => new Animated.Value(0))`.
- RN 0.88 no longer exports `StyleSheet.NamedStyles`; `makeStyles` types itself from `Parameters<typeof StyleSheet.create>`.
- Pass `disabled={x || undefined}` to `Pressable`: a literal `false` overrides `accessibilityState.disabled`.
- On web the app renders nothing until Inter loads (native keeps the splash screen up instead).

- `corepack enable` fails here (no write access to `C:\Program Files\nodejs`), and the global `pnpm` is 9.x. Use `corepack pnpm …` to get the pinned 10.x. Turborepo calls the global pnpm for scripts, which is fine.
- pnpm refuses to reinstall without a TTY; set `CI=true` (and `--no-frozen-lockfile` when the lockfile must change).
- Windows PowerShell 5.1 `Set-Content -Encoding utf8` writes a BOM, which breaks `package.json` parsing in Expo. Edit JSON with the Edit tool or Bash, not PowerShell.
- TypeScript 6 no longer loads all `@types/*` automatically: list them in `compilerOptions.types` (e.g. `"jest"` in the mobile tsconfig).
- Use the TypeScript version Expo pins (`~6.0.x`), not the latest (7.x); typescript-eslint also requires < 6.1.
- Expo inlines `EXPO_PUBLIC_*` (and Next `NEXT_PUBLIC_*`) only for static `process.env.NAME` references: list each variable explicitly in `env.ts`.
- MapLibre RN doesn't run in Expo Go or on web; `CityMap.tsx` checks `isExpoGo`, `CityMap.web.tsx` is the web fallback.
- `expo-dev-client` is **not** installed (ADR-026): with it, `npx expo start` makes a dev-build QR code that Expo Go can't open. Re-add it only for an EAS development build.
- Root scripts that call `pnpm` internally fail in the owner's terminal (global pnpm not on PATH). Give the owner `npx expo …` commands run inside `apps/mobile`.
- `supabase test db` needs Docker even with `--linked`; use `pnpm db:test`, which sends each test file as one rolled-back DO block. Test files must end every statement with `;` at the end of a line.
- RLS policies: one permissive policy per role and action. Write staff policies as separate insert/update/delete policies, never `for all` (it also covers SELECT; advisor 0006).
- Migrations already pushed to `089-dev` are never edited: fix forward with a new migration.
- `supabase gen types` output is excluded from Prettier; CI compares it ignoring the `PostgrestVersion` line (hosted and local PostgREST differ).
- `git config core.longpaths true` is set: some react-native paths in `node_modules` exceed Windows' 260-char limit.
