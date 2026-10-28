# 089 — App Structure (MVP)

## 1. Navigation

**Tabs: Explore · Map · Events · Saved.** A profile/settings avatar sits top-right on Explore and Saved.

Why four tabs instead of the spec's five: with no social layer, a Profile tab would only hold settings, which makes it a dead tab (principle 9). A **Social** tab appears in Phase 2. Profile becomes a tab then, if public profiles exist.

Why Events gets a tab of its own instead of living inside Explore: "what's on this weekend" is the main reason locals come back each week. It needs a date-first layout (day strip, calendar) that a feed can't give.

```
(tabs)
├─ explore/            index · search · category/[slug] · collection/[slug]
├─ map/                index (sheet: place preview, filters)
├─ events/             index (day strip + list) · calendar
└─ saved/              index (lists) · list/[id]
stack (pushed over tabs; reachable from anywhere)
├─ place/[slug]        place profile
├─ event/[slug]        event page
├─ shared/[shareId]    opened from a link: someone else's list/plan (read-only)
├─ report              report incorrect info (modal)
├─ settings/           index · account · privacy · language · notifications · legal/[doc] · about-data
└─ auth                sign in / create account (modal, only when needed)
onboarding (first launch only): language → what 089 is (1 screen) → location (optional) → analytics consent
dev/gallery            component gallery (dev builds and staging only)
```

**Deep links:** `089.app/p/{slug}`, `/e/{slug}`, `/l/{shareId}` (domain TBD). These open the app via universal/app links when it's installed, and the server-rendered web page otherwise.

## 2. Screens

Every screen has designed **loading** (skeleton matching the final layout), **empty** and **error** states (offline vs server error, each with a retry). "Offline" always shows cached content first, with a quiet "Offline — showing saved info from {time}" banner.

### Onboarding (4 steps, all skippable except language)

- **Purpose:** set language, explain value in one screen, ask for location _with a reason_ ("to show what's open near you"), ask for analytics consent with an equal-weight "No" button.
- **Components:** OnboardingPage, Button, LanguagePicker.
- **States:** location denied → app works with "Munich centre" as origin and says so in Explore.

### Explore (home)

- **Purpose:** answer "what now?" in one scroll.
- **Layout:** header (greeting by time of day + weather chip "12° · light rain"), SearchBar (tapping it opens Search), quick-filter chips (Open now · Free · Rainy day · With friends · Date), then **computed sections**, each a horizontal carousel:
  1. _Good for right now_ (time + weather aware rules, e.g. rain → indoor; 22:00 → bars/late)
  2. _Open now near you_ (needs location or uses the centre)
  3. _This weekend_ (events)
  4. Active **collections** (editorial/seasonal; sponsored ones carry an "Anzeige / Sponsored" label)
  5. _Free things to do_ · _Rainy-day ideas_ (only when rain is forecast) · _Perfect for a date_ · _Day trips_
  6. Category grid (top-level categories)
- **Rule:** a section with fewer than 4 qualifying items is not rendered (the RPC drops it; the client never pads).
- **Components:** SectionHeader, PlaceCard (L/M), EventCard, CollectionCard, CategoryTile, WeatherChip, Chip.
- **States:** loading = skeleton carousels. Empty sections are simply absent. If _all_ sections are empty (should never happen), show an EmptyState with a link to the Map. Error = full ErrorState with retry; cached feed shown if available.

### Search

- **Purpose:** one box for places, events, categories, neighbourhoods; typo- and umlaut-tolerant.
- **Layout:** recent searches + suggested categories when the box is empty; grouped results (Places · Events · Categories · Areas) while typing (debounced 200 ms); a "Show on map" action.
- **States:** no results → spelling suggestion (trigram nearest) + "Report a missing place" link. Offline → search only within cached items, labelled as such.

### Category / Collection list

- **Purpose:** browse one category or one editorial collection.
- **Layout:** title + description, filter bar (Open now, distance, price*, indoor/outdoor, wheelchair, tags), sort (Recommended · Distance), list ↔ map toggle. *Price only when the category has editorial price data.
- **Components:** FilterBar, FilterSheet, PlaceListItem, SortMenu.

### Map

- **Purpose:** spatial discovery and "what's around me".
- **Layout:** full-screen MapLibre map, category chip row on top, "Search this area" pill after panning, locate-me button, events-layer toggle. Tapping a pin opens a **bottom sheet** (peek: name, category, open/closed, distance, nearest stop, Save; drag up → full preview with "Open page" and "Directions").
- **States:** no location permission → centred on Marienplatz, with the locate button explaining why it needs permission. Tile load failure → banner + retry (place pins still render from the cached index).

### Place profile

- **Purpose:** decide "do I go?" fast, then act (save, directions, call, book).
- **Layout:** hero (photo carousel for featured places; **typographic/mini-map header** otherwise), name, category · neighbourhood · price, **status line** ("Open · closes 23:00" / "Closed · opens Tue 11:00" / "Hours unknown"), action row (Save · Directions · Call · Website · Share), editorial summary/description, "Good for" tags, hours table (today highlighted; holiday note), category-specific block (from attribute schema: cuisine & menu link for restaurants, admission & free days for museums…), upcoming events here, getting there (nearest U/S/tram stops + walking minutes), accessibility, **"Last verified {date}" + data source credits** ("© OpenStreetMap contributors", photo credits), Report incorrect info.
- **Not in the MVP:** ratings, reviews, crowd levels (see ANALYSIS §4.4).
- **States:** closed permanently → banner, still viewable. Unknown hours → shown honestly; the place is excluded from "Open now".

### Events (tab)

- **Purpose:** what's on, by date.
- **Layout:** day strip (Today · Tomorrow · Fri · Sat · Sun · next week…), quick filters (Free · Music · Family · Outdoor · Nightlife), list grouped by time of day, featured/seasonal events pinned at the top. Optional calendar view.
- **States:** a day with no events → "Nothing listed for {day} yet" + suggest nearest day with events. **Never pad with places.**

### Event page

- **Layout:** hero image (if licensed), title, date/time (all occurrences, next one highlighted), venue (link to place page), price/free, age restriction, ticket button (external link, marked as such), description, add to calendar, Save, Share, source attribution ("Listed via …" / "089 editorial").
- **States:** cancelled/postponed → prominent status banner. Past event → "This event has ended" + similar upcoming events.

### Saved

- **Purpose:** personal lists and plans; works without an account.
- **Layout:** default "Saved" list + user lists, "New list", "New plan" (a plan = list + date + optional time per item). List detail: items (place/event cards), reorder, notes, **Share** (creates a link; first share asks to create an account so the list is backed up — can be skipped for anonymous users, with a clear warning that the list lives on this device only).
- **States:** empty → EmptyState explaining saving + a "Browse Explore" button. Anonymous user → a gentle "Back up your lists" card (dismissible).

### Shared list / plan (opened from a link)

- Read-only view of someone else's list/plan, with "Save a copy" and "Open in maps".

### Settings

- Account (create/sign in, sign out, **delete account**), Language (de/en), Privacy (analytics consent toggle, crash reports toggle, location explanation + link to OS settings, **download my data**), Notifications (weekly digest, event reminders — off by default), Legal (Impressum, Datenschutzerklärung, Nutzungsbedingungen, open-data licences/credits), About data ("Where our information comes from").

### Report incorrect info (modal)

- Reason picker + optional text + optional "I'm the owner" checkbox (collects interest for Phase 3 claims). Works anonymously; rate-limited. Confirmation says what happens next.

### Component gallery (dev only)

- Every design-system component in every state and both themes, plus dynamic type at 200%. Used for visual review and screenshot tests.

## 3. Key shared components

`Button` (primary/secondary/ghost/destructive; sizes; loading) · `IconButton` · `Chip` (filter/selectable/category) · `SearchBar` · `SectionHeader` · `PlaceCard` (L hero / M carousel / S row) · `PlaceListItem` · `EventCard` · `EventListItem` · `CollectionCard` · `CategoryTile` · `StatusLine` (open/closed/unknown) · `HoursTable` · `AttributeBlock` (renders a category's attribute schema) · `TransitStops` · `AttributionFooter` · `Sheet` (gorhom wrapper) · `FilterSheet` · `MapPin`/`ClusterPin` · `WeatherChip` · `Skeleton` (+ per-card skeletons) · `EmptyState` · `ErrorState` · `OfflineBanner` · `Toast` · `SponsoredLabel` · `Avatar` · `ListRow` · `Toggle` · `SegmentedControl`.

## 4. Analytics events (consent-gated, explicit list)

`app_open`, `explore_section_view{section}`, `place_open{tier,source_screen}`, `event_open`, `search{has_results,result_type_clicked}`, `save{item_type}`, `list_share`, `directions{mode}`, `ticket_click{provider}`, `report_submit{reason}`, `filter_apply{filters}`. No free-text search queries are sent (they can contain personal data); only lengths/flags. No coordinates are ever sent.
