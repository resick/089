# 089 — Decision Log (lightweight ADRs)

Format: **ID · date · status** — decision. _Why._ Alternatives. Revisit when…
Status: `proposed` (awaiting review) · `accepted` · `superseded by ADR-x`.

---

**ADR-001 · 2026-10-28 · accepted** — Working name **"089"**; neutral text wordmark until the brand is decided.
_Why:_ you chose it. It's local and scales as an area-code system for German cities. Alternatives: none evaluated. Revisit: after the trademark search (ANALYSIS §7), and before a second city.

**ADR-002 · 2026-10-28 · accepted** — **Expo (dev builds) + Expo Router + TypeScript strict** for iOS/Android.
_Why:_ one codebase, native maps via dev builds, EAS pipeline, OTA updates. Alternatives: Flutter (no TS sharing with backend/web), native ×2 (team size). Revisit: never for MVP.

**ADR-003 · 2026-10-28 · accepted** — **Supabase in eu-central-1 (Frankfurt)**: Postgres + PostGIS, Auth, Storage, Edge Functions; RLS on every table.
_Why:_ EU hosting for GDPR, relational + geo in one place, small ops burden, plain Postgres so we can leave. Alternatives: Firebase (weak geo/relational, US-centric), self-hosted Postgres (ops cost). Revisit: if costs exceed ~$1k/month or we need features Supabase lacks.

**ADR-004 · 2026-10-28 · accepted** — **pnpm workspaces + Turborepo** monorepo with `apps/mobile`, `apps/web`, `packages/*`, `services/ingest`, `supabase/`.
_Why:_ shared zod schemas/tokens/types across app, web, CMS and ingestion. Alternatives: Nx, separate repos.

**ADR-005 · 2026-10-28 · superseded by ADR-025** — Styling with **react-native-unistyles v3**; fallback plain `StyleSheet` + typed theme hook.
_Why:_ typed tokens and themes, theme switching without re-renders, close to the RN StyleSheet API (low lock-in). Alternatives: Tamagui, NativeWind, Restyle (ARCHITECTURE §1). Revisit: if it's incompatible with the Expo SDK at slice 1.

**ADR-006 · 2026-10-28 · accepted** — **MapLibre RN + self-hosted Protomaps basemap on Cloudflare R2/Worker.**
_Why:_ no per-session fees (~$20–40 vs ~$1,000+/month at 100k MAU on MapTiler), our own style, no Google lock-in. Alternatives: MapTiler Flex (documented fallback), Stadia, Mapbox. Revisit: if self-hosting maintenance exceeds ~2 h/month.

**ADR-007 · 2026-10-28 · accepted** — **The city's place index ships to the device** as a compact cached file; client-side clustering and filtering. Server viewport queries only for search and events.
_Why:_ ~10k POIs fit in ~200 KB gzipped; instant filters, offline, zero per-pan server load. Revisit: when a city exceeds ~50k POIs.

**ADR-008 · 2026-10-28 · accepted** — **Base data = OSM + Foursquare OS Places** (Overture under evaluation). **Google Places not used at all.** Editorial layer kept as an independent database.
_Why:_ licences allow storage and combination; Google's terms forbid building our own DB from Places content. Revisit: Overture go/no-go at slice 4.

**ADR-009 · 2026-10-28 · accepted** — **Ingestion runs in GitHub Actions** (TS + DuckDB + osmium), not Edge Functions.
_Why:_ bulk jobs exceed Edge Function wall-clock limits; Actions gives logs/retries/secrets cheaply. Revisit: when runs exceed ~30 min, move to a small EU VM.

**ADR-010 · 2026-10-28 · accepted** — **Opening hours and event times precomputed into `tstzrange` windows** for the next 21 days.
_Why:_ "open now"/"this weekend" becomes one indexed range check; holidays/DST/midnight handled once in tested code. Revisit: never likely.

**ADR-011 · 2026-10-28 · accepted** — **Translatable content as `jsonb` i18n columns** (`{"de","en"}`), not translation tables.
_Why:_ simpler queries at 2–5 locales; validated by a CHECK function. Revisit: if > 6 locales or translator workflows need per-field status.

**ADR-012 · 2026-10-28 · accepted** — **Anonymous-first accounts**: Supabase anonymous sessions on first launch; email magic link + Sign in with Apple to back up/share. Google sign-in later.
_Why:_ zero-friction single-player use; less auth scope. Apple's guideline 4.8 is satisfied by offering Sign in with Apple. Revisit: Phase 1.5.

**ADR-013 · 2026-10-28 · accepted** — **Four tabs (Explore · Map · Events · Saved)**; profile/settings behind a header avatar. Social tab in Phase 2.
_Why:_ no dead Profile tab without social features. Revisit: Phase 2.

**ADR-014 · 2026-10-28 · accepted** — **One Next.js app for public web pages + admin CMS** on Vercel (fra1).
_Why:_ share links need web pages, SEO is the main free growth channel, and the CMS shares the same code/auth. Alternatives: separate admin (Retool/Directus — licence/cost or less control). Revisit: if admin and public web need different release cadences.

**ADR-015 · 2026-10-28 · accepted** — **No ratings, crowd levels or price filters without a real source.** Editorial signals instead; price only on curated places.
_Why:_ principle 4 / "never fabricate data"; no legal source at launch. Revisit: Phase 2 (own reviews), Phase 4 (crowd partners).

**ADR-016 · 2026-10-28 · accepted** — **Ticketmaster blocked until written commercial-use permission**; Eventbrite not usable for discovery; no scraping.
_Why:_ current ToS forbid earning revenue from API use (checked 2026-10-28). Revisit: when Ticketmaster answers.

**ADR-017 · 2026-10-28 · accepted** — **Analytics: PostHog EU, opt-in only, explicit event list, no autocapture, no coordinates or search text. Errors: Sentry EU.**
_Why:_ TDDDG §25 / GDPR; keeps volume inside the free tier for longer. Revisit: at 100k MAU (sampling).

**ADR-018 · 2026-10-28 · accepted** — **Image renditions generated at upload** (400/800/1600 WebP + blurhash) and served from Supabase Storage CDN; consider R2 for images at scale.
_Why:_ predictable cost, no per-transform billing, fast loads. Revisit: when image egress > ~1 TB/month.

**ADR-019 · 2026-10-28 · accepted** — **Brand colour system: near-black + Munich gold (`#F5C400`)**, Inter, Lucide icons.
_Why:_ references Munich's civic colours (black and gold) without folklore; contrast verified (DESIGN_SYSTEM §1). Revisit: when the real brand/logo is designed.

**ADR-020 · 2026-10-28 · accepted** — Toolchain pins for slice 1: **Expo SDK 58** (React Native 0.88.0, React 19.3), **TypeScript ~6.0** (the version Expo pins; TS 7 is out but typescript-eslint supports < 6.1), **ESLint 9** (eslint-config-expo/next presets aren't verified on ESLint 10 yet), **pnpm 10.34** (latest is 12.x; 10 has the build-script allowlist we rely on and well-known behaviour), **Next.js 16.4**, **Vitest 5** for packages, **jest-expo + Testing Library** for the app.
_Why:_ follow each framework's supported versions rather than the newest release. Revisit: at each Expo SDK upgrade.

**ADR-021 · 2026-10-28 · superseded by ADR-025** — Unistyles installation **moves to slice 2** (design system). The scaffold uses plain `StyleSheet` + a `useColors()` hook over `@089/tokens`.
_Why:_ it is a native module that can only be verified in a dev build, and slice 2 is where the theme is built; installing it now would be untested weight. ADR-005 still stands.

**ADR-022 · 2026-10-28 · proposed** — **Placeholder app identifiers** `app.muc089` (+ `.dev`, `.staging`) and URL scheme `muc089`.
_Why:_ bundle IDs can't change after the first store upload, so the final one depends on the brand/domain/legal-entity decisions (ANALYSIS §8). **Must be decided before slice 12.**

**ADR-023 · 2026-10-28 · accepted** — Map spike uses **MapLibre's public demo style** (`demotiles.maplibre.org`) via `EXPO_PUBLIC_MAP_STYLE_URL`.
_Why:_ free, no key, enough to prove the native module renders. Replaced by the self-hosted Protomaps style in slice 7 (ADR-006).

**ADR-024 · 2026-10-28 · accepted** — Expo Router **typed routes off** for now.
_Why:_ the generated route types only exist after `expo start`, which CI doesn't run; enabling them needs a CI step that generates them. Revisit: slice 6, when real navigation between screens starts.

**ADR-025 · 2026-10-28 · accepted** — **Keep the app runnable in Expo Go until launch.** Styling uses React Native `StyleSheet` + typed theme hooks over `@089/tokens` (replaces Unistyles, ADR-005/021). Local storage uses `expo-sqlite/kv-store` instead of react-native-mmkv. **Any native module that Expo Go doesn't include (today: MapLibre) must be lazy-loaded behind `isExpoGo` (`src/lib/runtime.ts`) with a designed fallback.**
_Why:_ the owner tests on an iPhone without an Apple Developer account ($99/yr) until launch; Expo Go is free. Android dev builds (EAS) still cover the full app including the map. Cost: no Unistyles theme-switch optimisation — acceptable at our screen count. Revisit: at launch, when iOS dev builds become available.

**ADR-026 · 2026-10-28 · accepted** — **Remove `expo-dev-client`**; `npx expo start` runs the app in Expo Go on iPhone and Android.
_Why:_ with the dev client installed, Expo's QR code targets the custom dev build, which confused testing on an iPhone (the camera opened it as a web link). Expo Go is the owner's test path until launch (ADR-025). The Android dev build from 2026-10-28 (with the real map) stays installable, but needs `expo-dev-client` re-added and a new build to connect again. Revisit: when we need the map on a device again (slice 7) or at launch.
