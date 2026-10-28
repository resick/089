# PROJECT SPEC — City Discovery & Social Platform (Munich first)

> **How to use this file:** Put it in the repo root (e.g. `docs/PRODUCT_SPEC.md`) and start Claude Code with:
> *"Read docs/PRODUCT_SPEC.md fully. Do Part 0 and Part 9 (First Task) only. Stop after producing the planning docs and wait for my review before writing app code."*

---

## PART 0 — HOW YOU (CLAUDE CODE) SHOULD WORK

You are acting as senior product architect, mobile engineer, backend engineer, UI/UX designer and startup strategist. Think critically. If something here is unrealistic, commercially weak, legally risky or over-engineered, say so and propose a better option. Do not just agree.

**Working rules**
1. **Inspect before changing.** Read the existing repo (if any) and summarise its architecture before proposing changes. Never replace working code without explaining why.
2. **Plan first, then build in small vertical slices.** Each slice should be shippable, testable and reviewed before the next. Prefer one feature end-to-end over many half-features.
3. **Never fabricate data.** No invented places, opening hours, prices, reviews, events, crowd levels or ratings — not even as "realistic seed data". Use clearly labelled fixtures (`Test Place 1`) for tests, and real licensed data for anything user-facing.
4. **Verify external facts.** API terms, pricing, rate limits and licences change. Check current official docs before relying on any provider, and record what you checked (with date) in `docs/DATA_SOURCES.md`.
5. **Secrets never in the client.** All third-party keys live server-side (edge functions / env). The app only ever holds public, restricted keys (e.g. a domain/bundle-restricted map token).
6. **Ask me when blocked** on decisions that are genuinely mine: brand name, paid services, legal entity details, API keys. Otherwise choose sensible defaults and note them in `docs/DECISIONS.md` (lightweight ADR log).
7. **No new dependency without a reason.** Justify each one in the PR/commit message.
8. **Definition of done** for every feature: typed end-to-end, input-validated, loading/empty/error states designed, works offline-gracefully, accessible (labels, contrast, dynamic type), tested (unit for logic, at least one integration test for data flows), and no console errors.
9. Keep a running `CLAUDE.md` with project conventions, commands and gotchas so future sessions stay consistent.

---

## PART 1 — THE VISION

One app. One city. Everything worth discovering, experiencing and doing — in one place.

Think the best parts of Google Maps, Snap Map, Instagram, Tripadvisor, Eventbrite and GetYourGuide, but with its own identity. Launch city: **Munich**. Then other German cities, then international.

It must answer questions like: *Where should I eat tonight? What's open right now? What's on this weekend? What can I do when it rains? Where are hidden gems nearby? What can I do with friends this afternoon?*

**Audiences:** locals, tourists, students, couples, friend groups, new arrivals, spontaneous planners, people wanting to meet others. Useful on a Tuesday afternoon *and* a Saturday night.

### Product principles (non-negotiable)
1. Everything worth discovering is discoverable.
2. **Useful with zero friends on the app** — the single-player experience must be excellent on day one.
3. Discovery works from day one; never depend on user-generated content to fill the app.
4. Live activity is based on real data only. Estimates are labelled as estimates.
5. Privacy and user control are fundamental. Location sharing is always opt-in.
6. Every category shows information relevant to that category.
7. Fast, intuitive, visually excellent.
8. Munich first, architected for many cities and languages.
9. Real functionality over impressive-looking dead screens.

---

## PART 2 — CRITICAL CORRECTIONS TO THE ORIGINAL CONCEPT

Address these explicitly in your analysis — they change the plan.

1. **Scope is the #1 risk.** "Google Maps + Instagram + Tripadvisor + Eventbrite + GetYourGuide" is five companies. The MVP must win on *one* job: **"What should I do in Munich right now / tonight / this weekend?"** — curated, beautiful, trustworthy discovery + events. Social is a later multiplier, not the foundation.
2. **Cold-start problem for social.** Feeds, check-ins, friend activity and crowd levels are empty until there's density. Ship them only when there are users to fill them; until then hide or replace empty social surfaces with editorial content.
3. **Google Places licensing.** Google's terms heavily restrict storing/caching Places content (generally only place IDs, with time limits on other data) and require display alongside Google Maps/attribution. It therefore **cannot be the base of our own place database.** Verify current terms; likely use it only for optional live enrichment, or not at all.
4. **Base place data should be openly licensed.** Candidates: **OpenStreetMap** (ODbL — attribution required; understand share-alike implications for a derived database) and **Foursquare Open Source Places** (open dataset). Combine, deduplicate, then layer our own curation on top.
5. **Crowd levels ("Quiet / Busy") are mostly not legally available.** Google's Popular Times has no official API. Realistic sources: venue partnerships, our own aggregated check-ins (once dense), and possibly licensed footfall providers (verify terms/cost). Until real data exists, **don't show the feature** rather than show guesses.
6. **Events data is fragmented.** Eventbrite's public event search API is no longer generally available; Ticketmaster Discovery API is usable; local sources (venue sites, München tourism / city open data, Resident Advisor-type listings) have their own terms. Plan for: licensed APIs + an organizer self-submission tool + an internal editorial CMS. Do not scrape against ToS.
7. **Germany/EU legal requirements** are product requirements, not afterthoughts: GDPR/DSGVO (location = sensitive-ish personal data, data minimisation, deletion/export, EU hosting), TTDSG/consent for tracking, **Digital Services Act** (notice-and-action for illegal content, reporting, transparency for a UGC platform), Impressum, minimum age for consent (16 in Germany), age-gating for 18+ venue content, and labelling of paid/sponsored placements.
8. **"Meet people with similar interests" + live location = safety risk** (stalking, harassment, minors). Requires blocking, reporting, coarse/delayed location for non-friends, no public live location of individuals, and a moderation process. Put this late in the roadmap.
9. **Bilingual from day one.** Munich has many internationals and tourists: German + English UI and content (i18n architecture now, even if some content is English-only at launch).
10. **Curation is the moat.** Raw POI data is commodity. Differentiation = editorial collections, quality photos, accurate "good for" tags (date, groups, rainy day, free), and trust. Budget human time for Munich curation.

---

## PART 3 — FEATURE SPEC

### 3.1 Categories (flexible taxonomy)
Hierarchical, data-driven (in DB, not hard-coded), multi-category per place, translatable, with per-category attribute schemas (see 3.5). Top-level:
- **Food & Drinks:** restaurants, cafés, coffee, bakeries, bars, pubs, rooftop bars, cocktail bars, beer gardens, brunch, desserts, street food
- **Nightlife:** clubs, lounges, live music, techno, parties, DJ events, late-night
- **Entertainment:** arcades, bowling, billiards, escape rooms, karaoke, cinemas, gaming lounges, VR, indoor centres, comedy
- **Culture & Arts:** museums, galleries, exhibitions, historic buildings, theatres, opera, concert halls
- **Tourism & Attractions:** landmarks, historic sites, guided tours, viewpoints/observation decks, architecture, neighbourhoods
- **Activities & Experiences:** karting, paintball, laser tag, climbing, trampoline parks, mini golf, sports, workshops, cooking classes, creative, adventure
- **Outdoors & Nature:** parks, lakes, swimming spots, hiking, cycling, viewpoints, gardens (incl. day trips from Munich — lakes & Alps are a huge use case)
- **Shopping:** centres, boutiques, markets, flea markets, vintage, independent, specialty
- **Wellness:** spas, saunas, pools, gyms, wellness, beauty
- **Events:** concerts, festivals, markets, seasonal (Oktoberfest, Christkindlmarkt, Tollwood, Auer Dult), food festivals, sports, community, pop-ups, exhibitions

Cross-cutting **tags** (not categories): occasion (date, friends, family, solo, groups), indoor/outdoor, rainy-day, free, budget, kid-friendly, dog-friendly, accessible, open late, local favourite, vegan options, etc.

### 3.2 Navigation (recommended)
`Explore · Map · Events · Saved/Plans · Profile` for MVP. Add a **Social** tab only in Phase 2 when there's content to show (until then, social lives inside Profile). Justify or improve this.

### 3.3 Explore
Search (places, events, categories, neighbourhoods; typo-tolerant, German/English, umlaut-insensitive), category browsing, curated collections, nearby, open now, "good for right now" (time-of-day + weather aware), filters (price, distance, rating, hours, category, indoor/outdoor, occasion, free).
Dynamic sections like: *Open now near you · This weekend · Rainy-day ideas · Free things to do · Perfect for a date · Groups · Hidden gems · Locals recommend · Day trips.*
Sections must be computed from real data; a section with too few results is hidden, not padded.

### 3.4 Map
MapLibre/Mapbox map with clustering, category filters, search-on-map ("search this area"), user location (with permission), distance, tap-pin preview sheet, save, directions (deep-link to Apple/Google Maps + **public transport via MVV/MVG** — transit matters more than driving in Munich), events layer. Must stay smooth with thousands of POIs (viewport-based server queries + clustering + vector tiles if needed).

### 3.5 Place profiles
Common: name, description, photos, categories/tags, address, map, opening hours (incl. holidays, "open now/closes soon"), website, phone, price level, rating/reviews, accessibility, directions, save, share, report-incorrect-info, **data source attribution**, "last verified" date.
Category-specific (driven by attribute schemas): restaurants — cuisine, menu link, reservation link, dietary; museums — current exhibitions, admission, free days, tours; arcades/activities — offerings, pricing, booking; clubs — music genres, door/entry info, age, upcoming events; attractions — tickets, visitor info; outdoors — facilities, routes, swimming, accessibility.
Must feel premium, not like a generic listing. Owners can later claim and edit their page (verified).

### 3.6 Events
Title, description, images, start/end + recurring occurrences, venue (linked place), location, price/free, ticket link, organizer, categories, age restriction, interested/going counts, source attribution. Save, share, "interested/going", add-to-calendar. Organizer self-submission with moderation queue. Deduplicate events from multiple sources.

### 3.7 Saved & Plans (MVP version of "social")
Save places/events into lists, share lists by link, simple "plan" (a set of places/events + time) shareable to friends via link/WhatsApp even if they don't have the app. This gives social value without needing network density.

### 3.8 Social (Phase 2+)
Profiles (public/private), follow/friends, posts (photos/short videos) tied to places/events, likes, comments, recommendations, invites, friends' event attendance (privacy-controlled), groups, DMs (late — high moderation cost). Blocking, muting, reporting everywhere.

### 3.9 Check-ins & live activity (Phase 2–4)
Voluntary check-ins with optional photo; expire automatically (e.g. 3h); visibility: only me / friends / public-aggregate-only. Anti-fraud: server-side geofence check (distance from place ≤ threshold, GPS accuracy check), rate limits, cooldowns, device attestation where feasible. Aggregated activity shown only above a minimum threshold (k-anonymity, e.g. ≥5 people) and delayed/coarsened so individuals can't be inferred. Crowd indicators only from real sources, always labelled with source and freshness.

### 3.10 Reviews & UGC
Star ratings, text, photos, helpful votes, "verified visit" badge (linked to a valid check-in), report flow, moderation queue, automated filters (spam, profanity, image safety), DSA-compliant notice-and-action, rate limits, and protection against review bombing.

### 3.11 Personalization
Phase 1: rule-based ranking (distance, open now, time of day, weather, tags, popularity from saves). Later: learned preferences, "similar to places you saved", and an AI "What should I do tonight?" assistant that only recommends from our verified database (no hallucinated places) and always explains why.

### 3.12 Additional features worth adding (evaluate & place on roadmap)
- Weather-aware suggestions (DWD open data, e.g. via Bright Sky API)
- Public transport times/directions (MVV GTFS)
- Seasonal guides (Oktoberfest, Christmas markets, summer lakes) — strong acquisition hooks
- Share cards / deep links (universal links) for growth
- Home-screen widget "Open now near you" (later)
- Offline cache of saved places
- Accessibility filters (wheelchair access, step-free)
- Business dashboard: claim page, update hours, post events, view stats
- Admin/editorial CMS: curate collections, fix data, moderate, feature content
- Notifications: saved-event reminders, friend invites (opt-in, never spammy)

---

## PART 4 — DESIGN DIRECTION

Premium, modern, minimal, image-led. Feels like a high-end travel app crossed with a modern social app — a serious consumer startup, not a template.

- **Dark-first** with a polished light mode; one confident accent colour plus a restrained category colour system used sparingly (map pins, chips).
- Strong typography hierarchy (one good sans family, e.g. Inter/Geist or similar), generous spacing on an 4/8pt grid, consistent icon set (one library).
- Imagery does the heavy lifting: full-bleed hero photos on place/event pages, edge-to-edge horizontal carousels in Explore.
- Bottom sheets for map previews and filters; smooth, purposeful motion (Reanimated) — no decorative animation.
- **Avoid:** heavy gradients, glassmorphism, card-inside-card layouts, excessive rounded boxes, generic AI illustrations, cluttered screens, inconsistent spacing.
- Build a **design system first**: tokens (colour, type, spacing, radius, elevation, motion), core components (Button, Chip, ListItem, PlaceCard, EventCard, Sheet, SearchBar, Rating, Skeleton, EmptyState, ErrorState) with a component gallery screen.
- Every screen has designed loading (skeletons), empty and error states.
- Accessibility: WCAG AA contrast, dynamic type, screen-reader labels, 44pt touch targets.

Key screens deserving the most care: **Explore feed, Map, Place profile, Event page.**

---

## PART 5 — RECOMMENDED STACK (validate, challenge, then decide)

| Layer | Recommendation | Notes |
|---|---|---|
| App | **React Native + Expo (dev builds, EAS)**, TypeScript strict | Expo Router for navigation; dev builds required for native maps |
| State/data | TanStack Query + Zustand (light) | Query cache = offline-ish behaviour |
| Validation | Zod (shared schemas client/server) | |
| Styling | Your choice (e.g. Restyle, Tamagui, or NativeWind) — justify | Must support tokens + dark/light |
| Animation | Reanimated + Gesture Handler, Gorhom bottom sheet | |
| Maps | **MapLibre (`@maplibre/maplibre-react-native`)** with a vector tile provider (MapTiler / Stadia / self-hosted), or Mapbox | Compare cost at 10k/100k MAU; avoid Google Maps SDK lock-in |
| Images | expo-image + server-side transforms/CDN | |
| Backend | **Supabase (EU – Frankfurt region)**: Postgres + **PostGIS**, Auth, Storage, Realtime, Edge Functions | RLS on every table |
| Search | Postgres FTS + `pg_trgm` + `unaccent` (MVP) → Typesense/Meilisearch when needed | German stemming, umlauts |
| Jobs/ingestion | Scheduled edge functions or a small worker (Node/TS) for data imports | Idempotent, logged |
| Push | Expo Notifications | |
| i18n | i18next / expo-localization (de, en) | Content fields translatable in DB |
| Analytics | PostHog (EU cloud) — consent-gated | |
| Errors/monitoring | Sentry | |
| CI/CD | GitHub Actions + EAS Build/Update | Lint, typecheck, tests on every PR |
| Admin CMS | Simple web admin (Next.js or similar) on the same Supabase | Needed early for curation |

---

## PART 6 — DATABASE ARCHITECTURE (starting point — refine it)

Multi-city, multi-language, multi-source with provenance. Use UUIDs, `created_at/updated_at`, soft deletes where useful, RLS everywhere.

**Geography & taxonomy**
- `cities` (id, slug, name i18n, country, timezone, default_locale, bbox, center geography)
- `neighbourhoods` (id, city_id, name, slug, boundary geography(MultiPolygon))
- `categories` (id, parent_id, slug, name i18n, icon, color_token, attribute_schema jsonb, sort, is_active)
- `tags` (id, slug, name i18n, group e.g. occasion/feature)

**Places**
- `places` (id, city_id, neighbourhood_id, slug, name, description i18n, location geography(Point, 4326) + GIST index, address fields, phone, website, price_level, attributes jsonb (validated vs category schema), status (active/closed/pending), quality_score, is_verified_owner, last_verified_at)
- `place_categories` (place_id, category_id, is_primary)
- `place_tags` (place_id, tag_id, source: editorial/user/derived)
- `opening_hours` (place_id, weekday, opens, closes, valid_from/to) + `opening_exceptions` (date, closed/hours) — or store OSM `opening_hours` string + parsed form
- `place_sources` (place_id, provider, external_id, license, attribution, raw jsonb, fetched_at) — **provenance for every field source**
- `media` (id, owner_type, owner_id, storage_path, width, height, blurhash, credit, license, uploaded_by, moderation_status)

**Events**
- `organizers` (id, name, user_id?, verified)
- `events` (id, city_id, place_id?, organizer_id?, title i18n, description i18n, price_min/max, currency, is_free, ticket_url, age_min, status, source fields)
- `event_occurrences` (event_id, starts_at, ends_at) — supports recurring/multi-day
- `event_categories`, `event_attendance` (user_id, event_id, status: interested/going, visibility)

**Users & social**
- `profiles` (id = auth.uid, username, display_name, avatar, bio, locale, home_city_id, is_private, birth_year/age_verified flag)
- `user_preferences` (interests, budget, notification settings, privacy defaults)
- `lists` + `list_items` (saved places/events, collaborative flag), `plans` + `plan_items` + `plan_members`
- `follows` (follower_id, followee_id, status pending/accepted), `blocks`, `mutes`
- `posts`, `comments`, `likes`
- `check_ins` (user_id, place_id, created_at, expires_at, visibility, lat/lng accuracy — store only what's needed, purge precise coordinates after validation)
- `reviews` (user_id, place_id, rating, body, verified_visit, helpful_count, moderation_status) + `review_votes`

**Trust, safety, business**
- `reports` (reporter, target_type, target_id, reason, status, resolution), `moderation_actions`
- `place_claims`, `business_accounts`, `sponsored_placements` (clearly flagged, date-ranged)
- `activity_aggregates` (place_id, time_bucket, count, source) — only ever aggregated & thresholded
- `audit_log`

Key queries to design indexes for: places within viewport/radius by category + open now; text search; events by date range near point; feed sections.

---

## PART 7 — MUNICH DATA STRATEGY

Goal at launch: **~1,500–3,000 high-quality places** across categories (quality > quantity) + a reliable rolling events calendar.

1. **Base layer:** import OSM (Overpass/Geofabrik extract for Munich + day-trip region) and Foursquare Open Source Places; map their categories to ours.
2. **Deduplicate & merge:** match by name similarity + distance + address; keep provenance per field.
3. **Quality filter:** drop closed/low-signal POIs; compute a quality score.
4. **Enrich:** official websites (with permission/terms respected), owner self-service, Wikidata/Wikipedia for landmarks & museums (open licences), Munich open data portal where available.
5. **Editorial layer:** human-curated descriptions, photos (own photography, licensed stock, owner-provided, or properly licensed CC with credit), tags, collections. Build the admin CMS to make this fast.
6. **Events:** Ticketmaster Discovery API + other licensed APIs (verify), venue/organizer submissions, partnerships with museums/clubs/venues, editorial for major seasonal events. Dedup across sources.
7. **Freshness:** scheduled re-imports, "report incorrect info" button, "last verified" dates, auto-flag stale entries.
8. **Attribution:** show required credits (e.g. "© OpenStreetMap contributors") in-app and on place pages.

Deliver `docs/DATA_SOURCES.md` with each source: what it gives, licence, attribution requirement, storage/caching rules, cost, rate limits, verified-on date.

---

## PART 8 — ROADMAP

**Phase 1 — Foundation & Discovery (MVP)**
Repo setup, CI, design system, auth (email/Apple/Google), profiles (basic), i18n de/en, city + category + place data model, Munich import pipeline + admin CMS, search, Explore feed, Map, Place profiles, Events (read-only from sources + editorial), Saved lists, share links, consent + privacy settings, analytics/Sentry, legal pages (Impressum, Datenschutz, ToS).
**Exit criteria:** a tourist and a local can each plan a real evening and a weekend in Munich using only the app; no dead screens; core flows < 2s on mid-range Android.

**Phase 2 — Social layer**
Follow/friends, posts, reviews, comments/likes, check-ins (private/friends), plans & invites, activity feed, blocking/reporting/moderation tooling, DSA flows.

**Phase 3 — Events & experiences**
Organizer accounts & submissions, attendance, reminders, booking/ticketing affiliate integrations (e.g. GetYourGuide/ Tiqets / ticketing partners — verify programs), reservation links.

**Phase 4 — Live city**
Aggregated activity (thresholded), venue partnerships for crowd data, trending, realtime updates, push notifications.

**Phase 5 — Personalization & growth**
Learned recommendations, AI "what should I do tonight?" grounded in our DB, business subscriptions & dashboard, sponsored placements (labelled), second city (e.g. Berlin/Hamburg) to prove the multi-city architecture.

**Monetization (later, never at UX's expense):** booking/ticket commissions & affiliates (first), business profiles/subscriptions, promoted events/venues (clearly labelled, capped frequency), reservation partnerships, possibly a premium tier. No intrusive ads.

---

## PART 9 — YOUR FIRST TASK (do this before writing app code)

Produce these documents in `docs/`, concise but specific:

1. `ANALYSIS.md` — critique of the concept, missing features, problems, and where you disagree with this spec (with reasons).
2. `ARCHITECTURE.md` — final stack with justification and costs at 1k / 10k / 100k MAU; system diagram (Mermaid); folder structure for app, backend, admin, ingestion.
3. `DATABASE.md` — refined schema (SQL-ish), indexes, RLS policy summary, migration strategy.
4. `APP_STRUCTURE.md` — navigation map, every MVP screen with purpose, key components, states.
5. `DATA_SOURCES.md` — per Part 7, with verified current terms.
6. `MVP.md` — exact MVP scope vs. later, with user stories and acceptance criteria.
7. `RISKS.md` — top commercial, technical, legal and safety risks, each with mitigation.
8. `ROADMAP.md` — milestones broken into ~1–2 week slices, each with deliverables and acceptance criteria.
9. `DESIGN_SYSTEM.md` — tokens, type scale, colour palette (dark + light), component list, motion principles.
10. `DECISIONS.md` — ADR log started with the stack decisions.
11. `CLAUDE.md` — conventions, commands, rules from Part 0.

Then **stop and wait for my review.** After approval, implement Phase 1 in this order, each as a reviewed slice:
1. Monorepo/project scaffold, TS strict, lint/format, CI, env handling
2. Design tokens + core components + component gallery screen
3. Supabase project (EU), migrations for cities/categories/places/media, RLS, seed of categories
4. Auth + basic profile + consent/privacy settings
5. OSM + Foursquare OS import pipeline for Munich (idempotent, logged, deduped) + minimal admin CMS
6. Place profile screen
7. Map with clustering, filters, viewport queries, preview sheet
8. Search (FTS + trigram, de/en)
9. Explore feed with computed sections (open now, nearby, collections, weather-aware)
10. Events ingestion + Events tab + event page
11. Saved lists + share links/deep links
12. Analytics, Sentry, performance pass, legal pages, TestFlight/Play internal release

Working name, brand and logo: TBD — ask me, and use a neutral placeholder until decided.
