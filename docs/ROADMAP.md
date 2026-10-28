# 089 — Roadmap

**Assumptions:** ~1 full-time developer (with Claude Code) + 1 part-time curator from slice 5 onward. Durations are estimates. Start **Mon 2026-11-02**. Every slice ends with a review, so nothing starts before the previous slice meets its acceptance criteria.

**Target:** internal TestFlight/Play beta **early May 2027** → public launch **mid-June 2027**, the start of beer garden + lake season (see ANALYSIS §5.3). The schedule allows ~2 weeks for holidays and slippage.

## Changes from the spec's slice order

- **Data before auth.** Every screen depends on real places, so ingestion moves up. Auth moves to the Saved slice because the MVP uses anonymous sessions (ANALYSIS §4.1). The CMS gets editor sign-in in slice 5.
- **Public web pages added** in slice 11 (share links need them).
- **MapLibre spike in slice 1** to catch native-module risk early (RISKS T4).

## Week 0 — non-code, start now (you)

Ticketmaster commercial-use request · trademark search "089" · decide legal entity · Apple/Google developer accounts (D-U-N-S takes time) · domain shortlist · photographer/curator plan.

---

## Milestone 1 — Foundations (Nov 2 → Dec 11, 2026)

### Slice 1 · Scaffold (1.5 wk)

- **Deliverables:** pnpm + Turborepo monorepo; Expo app (Router, TS strict, dev build running on iOS sim + Android emulator); Next.js app shell; `packages/{core,tokens,db,config}`; ESLint + Prettier; Vitest/Jest; GitHub Actions CI (lint, typecheck, test); env handling with zod-validated `env.ts` and `.env.example`; EAS project with dev/staging/prod profiles; **spike: MapLibre RN renders a Protomaps tile in a dev build**.
- **Accept:** fresh clone → `pnpm i && pnpm dev` works per CLAUDE.md; CI green; the map spike screen renders on both platforms; no secrets in the repo.

### Slice 2 · Design system (2 wk)

- **Deliverables:** tokens per DESIGN_SYSTEM.md (dark + light); Inter + Lucide; typed theme hooks (StyleSheet, ADR-025); component set §5 groups 1–5 (map pins in slice 7); component gallery screen; render + accessibility tests per component (pixel screenshot tests need a device farm: deferred, the gallery is reviewed by eye on a phone instead).
- **Accept:** every component in both themes, at 200% text, with a11y labels; contrast pairs come only from tokens; gallery reviewed by you.

### Slice 3 · Database core (1.5 wk)

- **Deliverables:** Supabase staging + prod projects (Frankfurt); migrations for cities, neighbourhoods (Munich Stadtbezirke from open data), categories (+attribute schemas), tags, places + base tables, editorial tables, media, `ingest_runs`, `audit_log`; RLS everywhere; pgTAP tests; categories seed (real taxonomy DE/EN); local fixtures; generated types in CI.
- **Accept:** `supabase db reset` reproduces locally; RLS tests pass for anon/other user/editor; type-drift check in CI.

## Milestone 2 — Real data (Dec 14 → Jan 29, 2027)

### Slice 4 · Ingestion pipeline (2 wk)

- **Deliverables:** `services/ingest`: OSM (Geofabrik Oberbayern) + Foursquare OS Places loaders → normalise → category mapping → match/dedup (thresholds in RISKS T2) → quality score → upsert with provenance; opening_hours parsing → `place_open_windows` (21 days, DE-BY holidays); MVV `stops.txt` → `transit_stops`; place index file → R2; GitHub Actions nightly/weekly; `ingest_runs` stats; abort on anomalies. Overture evaluated (go/no-go note in DECISIONS).
- **Accept:** a re-run with no upstream changes makes zero writes (idempotent); a dedup precision spot-check of ≥ 95% on 100 random merges; run report shows counts per category; "open now" unit tests (DST, midnight, PH) pass.

### Slice 5 · Admin CMS v1 (2 wk)

- **Deliverables:** `/admin` (editor role via magic link): place search/list with tier & quality filters; place editor (editorial DE/EN, tags, price, hours verification, tier promotion); media upload with mandatory licence/credit → renditions + blurhash; collections editor; review queues (unmatched sources, reports, stale featured); ingest-run dashboard; audit log on every write.
- **Accept:** a curator promotes a place to Featured in ≤ 10 min (timed); media can't be published without licence + credit.
- **Curation track starts:** target 100 featured by Milestone 3, 250 by beta, 400 by launch.

## Milestone 3 — Core app (Feb 1 → Mar 19, 2027)

### Slice 6 · Place profile (1.5 wk)

- `place_detail_v1` RPC; screen per APP_STRUCTURE; StatusLine; HoursTable; AttributeBlock driven by category schemas; TransitStops; attribution footer; report modal; no-photo header; deep link `/p/{slug}`.
- **Accept:** all states designed; status correctness tests; < 1 s from cache.

### Slice 7 · Map (1.5 wk)

- Self-hosted Protomaps (R2 + Worker), dark/light styles; place index fetch with ETag + clustering; category filters; preview sheet; locate-me; search-this-area; events layer stub; directions deep links.
- **Accept:** 60 fps with 10k points on the reference Android; offline shows cached pins.

### Slice 8 · Search (1 wk)

- `search_documents` + triggers; `de_unaccent`/`en_unaccent` configs; trigram typo tolerance; `search_all_v1` RPC; Search screen.
- **Accept:** the misspelling/umlaut tests from MVP S1; p95 < 150 ms.

### Slice 9 · Explore (1.5 wk)

- Weather Edge Function + `weather_snapshots`; `explore_sections_v1` (rules: time of day, weather, open now, tags, tier, distance); sections hide below 4 items; quick filters; collections; category grid.
- **Accept:** rule unit tests with fixed clocks/weather; no padded sections; cold start → Explore < 2.5 s.

## Milestone 4 — Complete MVP (Mar 22 → Apr 30, 2027)

### Slice 10 · Events (1.5 wk)

- Events editor in CMS (occurrences, recurrence helper, venue link); dedupe key; licensed feed adapter **only if cleared** (Ticketmaster); Events tab (day strip, filters); event page; add to calendar; events layer on map; partner content-licence template.
- **Accept:** ≥ 60 real upcoming events for the next 14 days at beta (editorial + partners); cancelled handling; dedupe tests.

### Slice 11 · Saved, accounts, sharing, web (2 wk)

- Anonymous sessions; lists + plans; offline save + sync; email magic link + Sign in with Apple (upgrade anonymous → permanent keeps data); `get_shared_list` RPC; public Next.js pages `/p`, `/e`, `/l` with SEO metadata + universal/app links; account deletion + data export.
- **Accept:** MVP L1–L3 criteria; a shared link opens on a phone without the app in < 1 s TTFB.

### Slice 12 · Launch readiness (1.5 wk)

- Consent flow + log; PostHog EU (explicit events) + Sentry EU; legal pages (Impressum, Datenschutz, ToS — texts by a professional); performance pass on the reference device; accessibility audit; store listings (DE/EN), screenshots; TestFlight + Play internal testing.
- **Accept:** all MVP exit criteria except the user test → **internal beta starts**.

### Beta → Launch (May → mid-June 2027)

- 4 weeks beta with ~50 testers (locals + internationals). Fix list. Run the 5-person exit test. Content push to 400 featured. Publish summer guides (beer gardens, lakes, Isar spots). Public launch.

---

## After MVP (outline — each phase gets its own detailed plan)

| Phase                      | Window (est.)   | Main deliverables                                                                                    | Gate to start                                |
| -------------------------- | --------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1.5 Retention              | Jun–Jul 2027    | Weekly digest, event reminders, Google sign-in, collaborative plans                                  | W4 local retention baseline measured         |
| 2 Social                   | Q3–Q4 2027      | Profiles, follows, reviews (with moderation + DSA flows), check-ins (private/friends), activity feed | ≥ 10k MAU and the moderation process staffed |
| 3 Events & experiences     | Q4 2027–Q1 2028 | Organizer accounts + submissions, attendance, affiliate booking, Eventbrite connect for organisers   | Affiliate terms verified                     |
| 4 Live city                | 2028            | Aggregated activity (k ≥ 5), venue crowd partnerships, trending                                      | Real data source signed                      |
| 5 Personalisation & growth | 2028            | Learned recs, grounded AI assistant, business dashboard, sponsored placements, 2nd city              | Unit economics positive in Munich or funding |
