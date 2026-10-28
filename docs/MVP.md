# 089 — MVP Scope

**MVP promise:** A local or a visitor can open 089 and, within a minute, find something good to do _right now_, _tonight_ or _this weekend_ in Munich, then save it, share it and get there. No account, no friends and no prior content needed.

**Exit criteria (from spec, made measurable):**

1. Five test users (2 tourists, 3 locals) each plan a real evening and a real weekend using only 089, and rate "would use again" ≥ 4/5.
2. No dead screens: every screen in `APP_STRUCTURE.md` has real data or a designed empty state. The automated check "no Explore section with < 4 items" passes.
3. Core flows (cold start → Explore, open place, open event, search) take < 2 s p75 on a mid-range Android (Pixel 6a class) on 4G.
4. "Open now" accuracy ≥ 95% on a manual spot-check of 100 random curated/featured places.
5. Crash-free sessions ≥ 99.5% in the internal beta.

## In / out

| Area          | In the MVP                                                                                                                                | Later (phase)                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Accounts      | Anonymous by default; email magic link + Sign in with Apple to back up lists and share; delete account; data export                       | Google sign-in (when Android share justifies it), public profiles (2)           |
| Places        | Basic/curated/featured tiers; category attributes; hours + holidays; transit stops; accessibility; source credits; report incorrect info  | Owner claims & editing (3), reviews/ratings (2), photos from users (2)          |
| Explore       | Computed sections, weather-aware, collections (incl. labelled sponsored), quick filters                                                   | Learned personalisation (5), AI assistant (5)                                   |
| Map           | Clustered city index, category filters, search this area, preview sheet, nearest stops, deep-link directions, events layer                | In-app transit routing, offline map packs                                       |
| Search        | Places, events, categories, neighbourhoods; DE/EN; typo + umlaut tolerant                                                                 | Typesense/Meili, semantic search                                                |
| Events        | Editorial events via CMS + one licensed feed **if** terms are cleared; dedupe; add to calendar                                            | Organizer self-submission + moderation (3), interested/going (3), reminders (3) |
| Saved         | Lists, plans (list + date/times), share link → web page, save a copy                                                                      | Collaborative lists/plans with members (2)                                      |
| Web           | Public SSR pages for place/event/list + legal pages; SEO metadata                                                                         | Full web app                                                                    |
| Admin CMS     | Places review queue, editorial editor, media upload with licence capture, collections, events editor, reports queue, ingest-run dashboard | Business dashboard (5), moderation tooling for UGC (2)                          |
| Notifications | Weekly "This weekend" digest (opt-in) — _stretch goal: cut first if late_                                                                 | Event reminders, friend invites                                                 |
| Social        | —                                                                                                                                         | Follows, posts, comments, check-ins, feeds (2+)                                 |
| Live          | —                                                                                                                                         | Aggregated activity, crowd partnerships (4)                                     |
| Ratings       | —                                                                                                                                         | Own reviews only (2)                                                            |

## User stories & acceptance criteria

### E — Explore

**E1. As anyone, I see what's good right now when I open the app.**

- Given it's 21:00 on a rainy Friday, Explore's first section prioritises indoor places open for ≥ 90 more minutes. The section title reflects the context ("Rainy evening ideas"). The ranking rules are unit-tested against fixture data.
- Sections with < 4 items are not returned by `explore_sections_v1`. A pgTAP test covers this.
- With location denied, distances are from Marienplatz and a chip says "Near city centre".

**E2. As a visitor, I can browse an editorial collection (e.g. "Beer gardens").**

- The collection page shows title, description, items and the map toggle. Sponsored collections show "Anzeige" (DE) / "Sponsored" (EN) above the title.

**E3. As anyone, I can filter by Open now, Free, Indoor, Wheelchair accessible and occasion tags.**

- Filters combine with AND. Open now excludes places with unknown hours. The result count updates within 300 ms (client-side for loaded lists).

### S — Search

**S1. As anyone, I find a place even if I misspell it or skip umlauts.**

- "hofbrauhaus", "Hofbräuhaus" and "hofbreuhaus" all return Hofbräuhaus in the top 3 (integration test against fixture data with the same names).
- "museum regen" (EN user) returns museums and indoor collections.
- p95 search RPC < 150 ms at 10k places (load test).

### M — Map

**M1. As anyone, I see places around me and filter by category without lag.**

- 10k points cluster at 60 fps on the reference Android device. A category filter updates in < 100 ms.
- Tapping a pin opens the peek sheet with name, status line, distance and nearest stop.

**M2. As anyone, I get directions by public transport.**

- "Directions" offers Apple Maps / Google Maps / MVV (whichever are installed), opened in transit mode with the destination set.

### P — Place

**P1. As anyone, I can tell immediately if a place is open and when it closes.**

- The status line is computed in Europe/Berlin and handles midnight crossings, DST and Bavarian public holidays (unit tests for each, including the night of a DST switch).
- If hours are older than 12 months or missing, the line says "Hours unknown — check website".

**P2. As anyone, I can see where the information comes from and report mistakes.**

- Credits for every source used on the page and every photo are shown. "Last verified" is shown when present.
- A report submits anonymously, is rate-limited (10/day/device), and shows up in the CMS queue.

### V — Events

**V1. As a local, I see what's on this weekend.**

- The Events tab defaults to Today. The day strip covers 14 days. Events are grouped by start time. Cancelled events are hidden from lists and bannered on their page.
- Duplicates from several sources appear once (dedupe key test fixtures).

**V2. As anyone, I can add an event to my calendar and open the ticket link.**

- The calendar event has title, time, venue address and a link back to the event page. Ticket links open externally and are tracked only if consent was given.

### L — Saved & sharing

**L1. As a first-time user, I can save without signing up.**

- Saving works offline and syncs when back online (anonymous session).

**L2. As a user, I can share a list/plan with a friend who doesn't have 089.**

- The share link opens a server-rendered web page (< 1 s TTFB, cached) with items, a map and "Open in app". Revoking the share makes the link return 404 within 1 minute.

**L3. As a user, I can delete my account and export my data.**

- Delete removes the profile, lists, consents linked to the user and uploaded media, and signs out. Export delivers a JSON file of my lists, settings and consents.

### A — Admin / curation

**A1. As a curator, I can take a place from Basic to Featured in under 10 minutes.**

- One screen covers: editorial summary/description DE+EN, tags, price, photo upload (licence + credit required, renditions + blurhash generated), verify hours, publish.
- Every edit is in `audit_log`.

**A2. As a curator, I see what needs attention.**

- Queues: unmatched/low-confidence source matches, reports, stale featured places (> 90 days since verification), last ingest-run failures.

### X — Privacy & legal

**X1. As a user, I decide about tracking.**

- No analytics event is sent before consent (verified with a network inspection test). Declining is as easy as accepting. Changing my mind in Settings takes effect immediately.
- Impressum, Datenschutzerklärung and ToS are reachable in ≤ 2 taps from any screen, in the app and on the web.
