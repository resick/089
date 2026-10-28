# 089 — Concept Analysis

_Working name: **089** (Munich's dialling code). Written 2026-10-28. Companion to `PRODUCT_SPEC.md`._

This document gives my view of the concept, says where I disagree with the spec, and lists what the spec leaves out. The short version: the spec's corrections (Part 2) are right, but **Phase 1 is still about 2× too big for the team this probably is**, and several MVP features it lists (ratings, price filters, crowd levels, "premium photo-led" pages) **have no legal data source at launch**. The plan below cuts Phase 1 down to what can be true on day one.

---

## 1. The core bet, restated

> **"What should I do in Munich right now / tonight / this weekend?" — answered in under 10 seconds, with information you can trust.**

The job is spontaneous decision-making, not planning a trip. That leads to three product truths:

1. **Freshness beats breadth.** One wrong "open now" costs more trust than 1,000 extra POIs earn. Show "hours unknown" honestly rather than guess.
2. **Editorial judgement is the product.** Raw POIs are a commodity. Curation (what's worth it, and _for what_) is the reason to open 089 instead of Google Maps.
3. **Events are the retention engine.** Places are stable, so locals don't need to come back for them. "This weekend" changes every week, so events are why a local opens the app again.

## 2. What the data actually looks like (measured, not assumed)

On 2026-10-28 I counted OSM features in a bounding box around Munich (48.061,11.360 → 48.248,11.723) with an Overpass mirror whose data snapshot was dated 2026-06-01:

| Slice                                                                                           | Count         | Share                               |
| ----------------------------------------------------------------------------------------------- | ------------- | ----------------------------------- |
| Food & drink (restaurant, café, bar, pub, biergarten, fast food, nightclub, ice cream)          | 5,096         | —                                   |
| …with `opening_hours`                                                                           | 4,028         | **79%**                             |
| …with `website` / `contact:website`                                                             | 1,684 / 1,155 | ~45–55% (they overlap)              |
| …with `cuisine`                                                                                 | 2,974         | 58%                                 |
| …with `wheelchair`                                                                              | 3,299         | 65%                                 |
| Tourism (museum, gallery, attraction, viewpoint, artwork)                                       | 1,308         | —                                   |
| …with `wikidata`                                                                                | 200           | 15% (most of the rest are artworks) |
| Selected leisure (parks, escape games, bowling, arcades, mini golf, trampoline, sports centres) | 1,528         | —                                   |
| Theatres                                                                                        | 76            | —                                   |

**What this means:**

- OSM is a **strong base layer for Munich**: hours coverage is far better than in most cities. We don't know how _fresh_ those hours are, so the importer must read `check_date` / `opening_hours:check_date` and use it in the quality score.
- **No open source provides photos, ratings or price level** in any useful amount. OSM, Foursquare OS Places and Overture have no photos or ratings. That has big consequences (§4).
- The bounding box includes some suburbs, and the snapshot is a few months old. Re-measure with the real Geofabrik extract during slice 5.

## 3. Where I agree with the spec

- Part 2 is correct and important: limit the scope, solve cold start, don't build on Google Places, use open base data, don't show crowd levels without a source, treat EU law as a product requirement, push "meet people" late, bilingual from day one, curation is the moat.
- Expo + Supabase (Frankfurt) + PostGIS + MapLibre is the right core stack for a small team (see `ARCHITECTURE.md`).
- "Sections with too few results are hidden, not padded" is the right rule. Keep it as an automated invariant.

## 4. Where I disagree, and what to do instead

### 4.1 Phase 1 is still too big

Phase 1 includes auth with 3 providers, profiles, import pipeline, admin CMS, search, explore, map, place pages, events from several sources, lists, share links, consent, analytics, legal pages and store release. That is **~5–7 months for one strong full-stack developer**, plus the curation work. **Proposal:**

- **Accounts are optional in the MVP.** Use Supabase anonymous sessions on first launch, so saved lists work at once. Ask the user to "create an account to sync and share" only when it adds value. This removes onboarding friction, fits "useful with zero friends" and cuts auth scope to **email magic link + Sign in with Apple**. Add Google sign-in when the Android share justifies it.
- **No "Profile" tab in the MVP.** With no social layer it would be a dead screen (principle 9). Settings, privacy and account live behind an avatar button in the header. Tabs: **Explore · Map · Events · Saved** (see `APP_STRUCTURE.md`).
- **Events at launch come from two sources:** editorial (the CMS) plus one licensed feed if the terms allow it (§4.4). Organizer self-submission moves to Phase 3, as the spec already says.

### 4.2 "1,500–3,000 high-quality places" mixes two different things

Curating 3,000 places at ~15 min each (description in DE+EN, tags, photo sourcing, verification) is **~750 hours**, close to half a person-year. **Proposal: three tiers.**

| Tier         | Launch target                                          | What it has                                                                           | Where it appears                             |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Featured** | 250–400                                                | Editorial copy DE/EN, ≥1 licensed photo, "good for" tags, price level, verified hours | Explore sections, collections, top of search |
| **Curated**  | 1,000–1,500                                            | Verified category + tags + hours, short one-liner, no photo required                  | Map, search, category lists, filters         |
| **Basic**    | everything else that passes the quality filter (~5–8k) | Open-data fields only, clearly shown as such                                          | Map (at higher zoom levels) and search only  |

This is honest (basic entries look basic but complete) and puts curation time where it pays off.

### 4.3 Photos are the hardest problem, and the design must not depend on them

"Imagery does the heavy lifting" assumes photos we don't have. Legal sources: our own photography (Germany's _Panoramafreiheit_, §59 UrhG, allows photos of buildings from public ground), owner-provided photos with a written licence, Wikimedia Commons (licence per file, credit required) and paid stock. **Proposal:**

- Plan a **photography sprint**: shoot the 250–400 featured places ourselves (a few weekends, or a paid student photographer). Budget it.
- Design a **typographic/map-led place header** that looks deliberate with no photo (category colour field + large name + mini-map). Basic and curated places use it by default, and it is not a placeholder.
- Store licence, credit and source for every image (the `media` table already plans this). Commons images need credits shown.

### 4.4 Some MVP features in the spec have no legal source

| Spec feature                                                       | Problem                                                                                                                                                                                                        | Decision                                                                                                                                                                                                              |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ratings / reviews on place pages (3.5) and the rating filter (3.3) | No open dataset has ratings. Google's can't be stored or shown off a Google map. Our own reviews need users (Phase 2).                                                                                         | **No ratings in the MVP.** Use editorial signals instead ("Editor's pick", "Local favourite") and saves counts once we have enough.                                                                                   |
| Price filter                                                       | OSM rarely has price level, and FSQ OS doesn't include it.                                                                                                                                                     | Price level is **editorial only** and the filter applies only to featured/curated places. The UI says so.                                                                                                             |
| "Locals recommend" section                                         | Needs real local signal.                                                                                                                                                                                       | Rename to **"Editors' picks"** until there is enough save data; then "Popular with locals" uses saves from users whose home city is Munich.                                                                           |
| Crowd levels                                                       | No legal source (spec 2.5 agrees).                                                                                                                                                                             | Not in the product until Phase 4 and only with a real source.                                                                                                                                                         |
| Ticketmaster events                                                | The current Discovery API terms (checked 2026-10-28) **forbid earning revenue "from using or providing" the API** and allow caching only "for reasonable periods". A commercial app is in a grey zone at best. | Use only after **written confirmation or a partner/affiliate agreement**. Also, Germany's ticketing market is dominated by Eventim, not Ticketmaster, so the coverage gain is smaller than it looks.                  |
| Public transit directions (MVV GTFS)                               | Real routing needs a routing engine (OpenTripPlanner/MOTIS) — a project of its own.                                                                                                                            | MVP: show the **nearest U-/S-Bahn/tram stops with walking distance** (from GTFS `stops.txt`, CC BY) and **deep-link** to transit directions in the MVV app / Apple / Google Maps. In-app routing is a later decision. |

### 4.5 Map: ship the dataset, don't query the viewport

Spec 3.4 suggests viewport server queries plus clustering. For one city with ~10k places, it is simpler and faster to **ship the whole place index for the city** as a compact, cached GeoJSON/FlatGeobuf (id, lon/lat, category, tier, ~150–250 KB gzipped) refreshed nightly with an ETag. MapLibre clusters it on the device, filters are instant, it works offline after the first load, and server load per map session is zero. Use server-side viewport queries only for search ("search this area") and events. Revisit if a city goes over ~50k POIs.

### 4.6 Basemap: self-host instead of paying per map load

MapTiler Flex is $30/month for 25k map sessions plus **$2.50 per 1,000** after that (free tier is non-commercial). At 100k MAU and ~10 map opens per user per month, that's **~$2,500/month**. A self-hosted **Protomaps PMTiles** basemap (OSM-derived, open source) on Cloudflare R2 behind a Worker costs **tens of dollars** at that scale. Recommendation: start on self-hosted Protomaps from day one. It is a one-day setup, and our own style is a design asset anyway. Keep MapTiler as a documented fallback. Details in `ARCHITECTURE.md`.

### 4.7 The missing piece: public web pages

Spec 3.7 wants plans shareable "even if they don't have the app". That **requires a web view of places, events, lists and plans**. The same pages are also the biggest free acquisition channel (SEO for "brunch Schwabing", "was tun bei Regen München"). **Proposal:** add a lightweight public web app (Next.js, server-rendered, same Supabase) that renders place/event/list pages with "Open in app" universal links. It shares the admin CMS's codebase/deployment. This moves from "later" into the MVP (slice 11).

### 4.8 Ingestion should not run in Edge Functions

Supabase Edge Functions have wall-clock limits that don't suit importing hundreds of MB of OSM/parquet data. **Proposal:** a TypeScript ingestion worker run by **GitHub Actions on a schedule** (nightly diff, weekly full). It uses DuckDB for parquet sources (Foursquare/Overture) and osmium/`osmtogeojson` for the Geofabrik Oberbayern extract, and writes to Postgres over a direct connection. Edge Functions stay for small request-time jobs (weather cache, share-link rendering, push).

### 4.9 ODbL share-alike is manageable if the schema is designed for it

Merging OSM with other data into one place record makes a **Derivative Database**. If we publicly use it, we must offer that derived data under ODbL on request. That is acceptable **if our editorial layer stays an independent database**: our own descriptions, photos, tags, collections and rankings, linked to places by ID but not derived from OSM. Schema consequence: `place_editorial` and `media` are separate tables, and the importer never writes editorial data into the OSM-derived columns (see `DATABASE.md`). Foursquare OS Places is Apache-2.0 and Overture Places is CDLA-Permissive-2.0, so both can be combined with ODbL data without conflict. **Get a one-hour review from an IT/open-data lawyer before launch.**

## 5. Missing from the spec

1. **Public web pages / SEO / share landing pages** (§4.7). This is the main growth channel.
2. **Data quality operations:** who verifies hours, how often, and what happens when someone reports an error. The design needs a staleness SLA (e.g. featured places re-verified every 90 days) and a CMS queue for it.
3. **Seasonality planning:** Munich's big moments (Starkbierfest Mar, Frühlingsfest Apr, lakes Jun–Aug, Oktoberfest Sep–Oct, Christkindlmärkte late Nov–Dec, Tollwood summer & winter, Auer Dult three times a year) drive acquisition. **Launch timing matters:** launching just before a big moment (a summer lakes & beer gardens guide in June, or a Christmas markets guide in early November) is worth more than any feature. Pick the launch date by season.
4. **A weekly "This weekend in Munich" digest** (push, email or both — opt-in). It is the cheapest retention mechanic and reuses the events data.
5. **Holidays:** Bavaria has more public holidays than most German states (e.g. Heilige Drei Könige, Fronleichnam, Mariä Himmelfahrt, Allerheiligen). "Open now" must handle `PH` rules for Bavaria.
6. **Accessibility data as a feature:** 65% of OSM food POIs have a `wheelchair` tag. A wheelchair filter is cheap and valuable.
7. **Content operations tooling** is the real Phase 1 bottleneck, more than app screens. The CMS must make one curator fast: bulk tag, photo upload with licence capture, "needs review" queues.
8. **Store-review requirements:** Apple requires account deletion in-app if accounts exist (Guideline 5.1.1(v)). Location-permission prompts need clear purpose strings.
9. **Backup/exit plan per provider:** what if Ticketmaster revokes access, or Supabase pricing changes? The architecture keeps everything in plain Postgres + S3-compatible storage, so moving is possible.

## 6. Commercial view (honest)

- **City guide apps historically struggle with retention.** Tourists use them for 3 days. Locals need a weekly reason to come back. Retention has to come from **events + weekly digest + saved lists/plans**, not places.
- **Monetization is slow.** In order of realism: (1) affiliate commissions on bookable experiences/tickets (GetYourGuide, Tiqets, venue partners — programmes to be verified); (2) **B2B sponsored collections** with clear "Anzeige / Sponsored" labelling (UWG §5a) — e.g. a brewery sponsoring a beer garden guide; (3) business profiles/subscriptions once owners see traffic; (4) a tourism-board or city partnership. Don't plan on a premium consumer tier.
- **A cheaper path to validation:** before a full native build, the web app (§4.7) plus an Instagram/TikTok presence posting the same curated content could test demand in weeks. **I recommend building the native app anyway** (the spec asks for it and the Map experience needs native), but the web pages and social content should start early because they cost little and compound.
- **Moat:** curation quality, Munich-specific knowledge (lakes, Alps day trips, seasonal guides), and speed of freshness corrections. None of this is technical. Budget human time for it.

## 7. The name "089"

**Strengths:** every Münchner recognises it; it sounds local, not touristy; it's short and memorable; and it **scales as a system**: Berlin 030, Hamburg 040, Frankfurt 069, Köln 0221. Each city could keep its own code under a parent brand.

**Risks to resolve before spending money on brand:**

1. **Trademark registrability:** a bare area code for a Munich city service is likely to be refused by DPMA/EUIPO as **descriptive / lacking distinctiveness** (it literally denotes Munich). Plan for a **word-and-figurative mark** (logo plus a distinctive element), and do a proper DPMA/EUIPO search in Nice classes 9, 35, 39, 41, 43. I found no obvious app conflicts in a quick search, but that is not a trademark search.
2. **App-store search:** "089" alone is hard to find. The store title should be like "089 – Munich: Events, Food & Things to Do".
3. **Expansion:** an area code means nothing outside Germany (the international "+49 89"), so the international expansion needs a parent brand anyway.
4. **Domain/handles:** check `089.app`, `089.city`, `089app.de`, @089… availability before committing.

**Recommendation:** keep "089" as the Munich product name. Decide on a parent brand before the second city.

## 8. Decisions I need from you

| #   | Decision                                                                             | My default if you don't decide                                                                                    |
| --- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Team & time: who builds, who curates, hours per week?                                | Solo dev + 1 part-time curator; roadmap estimates assume this                                                     |
| 2   | Launch window (see §5.3)                                                             | Aim for a **mid-June 2027** public launch (summer lakes/beer gardens), internal beta from early May (see ROADMAP) |
| 3   | Monthly infra budget for the first 6 months                                          | ≤ €150/month                                                                                                      |
| 4   | Legal entity for the Impressum / app stores (UG, GmbH, sole trader?)                 | Required before store submission — **blocking for slice 12**                                                      |
| 5   | Apple Developer + Google Play accounts (organisation account needs a D-U-N-S number) | Needed by slice 12                                                                                                |
| 6   | Photography budget for featured places                                               | ~€1.5–3k or own time                                                                                              |
| 7   | Trademark search / filing for "089"                                                  | Do a search before logo design                                                                                    |
| 8   | Ticketmaster: ask them for commercial-use permission?                                | Yes. Send the request in week 1 because it takes time                                                             |
