# 089 — Data Sources

**Rule:** a source is used only after its row here is filled in and "Verified" is ≤ 6 months old. Re-verify before launch and whenever a provider announces changes. This is not legal advice; items marked ⚖️ need review by a lawyer before launch.

Verification method used on **2026-10-28**: the provider's official docs/terms pages (fetched that day), plus web search for history. "Checked" = I read the page. "Search only" = secondary sources only, so verify again.

## Summary

| Source                            | Use                                             | Licence                                             | Status                                                         |
| --------------------------------- | ----------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| OpenStreetMap (Geofabrik extract) | Base places, hours, accessibility, geometry     | ODbL 1.0                                            | ✅ Use — ⚖️ share-alike design                                 |
| Foursquare OS Places              | Second base source, dedup, categories, websites | Apache-2.0                                          | ✅ Use                                                         |
| Overture Maps Places              | Third source / match confidence (evaluate)      | CDLA-Permissive-2.0                                 | 🔍 Evaluate in slice 5                                         |
| Wikidata                          | Landmark/museum facts, translations, IDs        | CC0                                                 | ✅ Use                                                         |
| Wikimedia Commons                 | Photos of landmarks                             | Per file (CC BY / BY-SA / PD)                       | ✅ Use with per-image credit; avoid BY-SA in composited images |
| Protomaps basemap                 | Map tiles                                       | OSM-derived (ODbL attribution) + Protomaps code BSD | ✅ Use (self-hosted)                                           |
| MVV GTFS                          | Transit stops (and later routing)               | CC BY                                               | ✅ Use                                                         |
| Bright Sky (DWD)                  | Weather                                         | DWD data CC BY 4.0                                  | ✅ Use                                                         |
| Munich Open Data portal           | Selected datasets                               | dl-de/by-2.0 mostly                                 | 🔍 Per-dataset                                                 |
| Ticketmaster Discovery API        | Events                                          | Proprietary ToS                                     | ⛔ **Blocked until commercial-use permission**                 |
| Eventbrite API                    | Events                                          | Proprietary                                         | ⛔ No public search since 2020                                 |
| Google Places API                 | —                                               | Proprietary                                         | ⛔ Not used                                                    |
| Editorial (our CMS)               | Descriptions, photos, tags, collections, events | Our own                                             | ✅ Core                                                        |
| Venue/organiser partnerships      | Events, photos, hours                           | Written licence per partner                         | ✅ Template agreement needed                                   |

---

## Details

### OpenStreetMap — Geofabrik "Oberbayern" extract

- **Gives:** POIs with names, categories (`amenity`/`shop`/`tourism`/`leisure`…), `opening_hours` (79% of food & drink POIs in central Munich; see ANALYSIS §2), website, phone, `wheelchair`, `cuisine`, `wikidata` links, geometry.
- **Licence:** Open Database License 1.0. **Attribution:** "© OpenStreetMap contributors" with a link to openstreetmap.org/copyright, visible wherever the data is shown (map corner + place page credits + About data).
- **Storage/caching:** unrestricted, but share-alike: a publicly used **Derivative Database** must be offered under ODbL on request. Mitigation: keep the editorial layer an independent database (DATABASE §1). The OSMF considers combinations with independent datasets to be "collective". ⚖️
- **Cost / rate limits:** free. Download from Geofabrik daily extracts. **Don't use the public Overpass API in production** (it's for human-scale use; it returned "at capacity" during my test). Overpass was fine for one-off analysis only.
- **Verified:** 2026-10-28 — ODbL produced-work/derivative guidance on wiki.openstreetmap.org & osmfoundation.org (checked).

### Foursquare Open Source Places

- **Gives:** ~100M global POIs; for each: name, location, address, Foursquare categories, website/phone/email/social (partly), `date_refreshed`, `date_closed`. **No opening hours, photos, ratings or price** (those are in the paid Pro/Premium tiers).
- **Licence:** Apache License 2.0, © Foursquare Labs. Attribution: keep the licence notice (we credit "Foursquare Open Source Places" in About data).
- **Storage/caching:** unrestricted under Apache-2.0. Can be combined with ODbL data.
- **Access:** Foursquare Places Portal (Iceberg catalogue; DuckDB/Spark/PyIceberg connectors; needs a free account token). Also on Hugging Face. The legacy public S3 bucket has been replaced by the Iceberg catalogue.
- **Cost:** free. **Update frequency:** monthly releases (per secondary source; docs page itself didn't state it).
- **Verified:** 2026-10-28 — docs.foursquare.com access page and OS schema page (checked).

### Overture Maps Places

- **Gives:** conflated places from several contributors (release 2026-03-18 described as Meta + Microsoft sources), with confidence scores and categories.
- **Licence:** CDLA-Permissive-2.0 for the Places theme. Credit "Overture Maps Foundation" + any source-specific attribution listed on docs.overturemaps.org/attribution.
- **Use:** evaluate in slice 5 as a third vote for dedup/match confidence and closure detection. Accessible as GeoParquet on S3/Azure, queryable with DuckDB by bbox.
- **Verified:** 2026-10-28 — search only (FAQ + attribution page + catalogue entry). **Re-check attribution page before use.**

### Wikidata / Wikimedia Commons

- **Wikidata:** CC0, so no attribution is legally required (we credit anyway). Gives multilingual names, descriptions, official websites, Commons image links, heritage IDs for landmarks/museums.
- **Commons:** licence per file. Store the licence, author and source URL in `media`, and show the credit. Prefer CC0/CC BY. CC BY-SA images are fine to _display_ with credit; don't build composites (collages, edited images) from them.
- **Verified:** general knowledge; re-check Wikimedia API User-Agent policy at slice 5.

### Protomaps basemap

- **Gives:** a vector basemap built from OSM as a single PMTiles file; self-hosted with no API keys or metering.
- **Licence:** Protomaps software is open source. Map data is OSM, so it needs "© OpenStreetMap contributors" on the map. Check Protomaps' attribution guidance for the build version we use.
- **Cost:** storage + bandwidth only (Cloudflare R2: no egress fees). The hosted Protomaps API requires GitHub sponsorship for commercial use, so we self-host.
- **Verified:** 2026-10-28 — search only (protomaps.com FAQ/about + case study). Re-check attribution docs at slice 7.

### MVV GTFS (Münchner Verkehrs- und Tarifverbund)

- **Gives:** full-network timetable feed (S-Bahn, U-Bahn, tram, bus, regional trains): stops, routes, times. MVP uses `stops.txt` for "nearest stops".
- **Licence:** CC BY. **Attribution:** "Münchner Verkehrs- und Tarifverbund GmbH (MVV)" + retrieval date + feed version.
- **Update:** irregular, roughly every 4–8 weeks; each feed covers about 3 months. Re-import monthly.
- **Note:** MVG (city operator) has no official public realtime API; unofficial endpoints are **not** to be used.
- **Verified:** 2026-10-28 — search only, via mvv-muenchen.de developer page summary. **Open the MVV page and record the exact licence version at slice 7.**

### Bright Sky (DWD open data)

- **Gives:** current weather, hourly forecast, alerts, radar for Germany, as JSON.
- **Licence:** Bright Sky is free for all purposes and needs no API key. The underlying DWD data falls under DWD terms: **CC BY 4.0** with source acknowledgement. Credit: "Wetterdaten: Deutscher Wetterdienst (DWD), via Bright Sky".
- **Rate limits:** none stated. We call it once per 30 min per city from an Edge Function; clients never call it directly.
- **Verified:** 2026-10-28 — brightsky.dev (checked); DWD terms of use PDF (search, dated May 2024). Check dwd.de/copyright for exact credit wording.

### Munich Open Data portal (opendata.muenchen.de)

- **Gives:** datasets such as Gasteig HP8 visitors/events and Filmfest München with JSON APIs; city geodata (district boundaries → `neighbourhoods`).
- **Licence:** mostly **Datenlizenz Deutschland – Namensnennung 2.0**; check each dataset.
- **Use:** neighbourhood boundaries (Stadtbezirke) at slice 3; event datasets as opportunistic editorial input.
- **Verified:** 2026-10-28 — search only.

### Ticketmaster Discovery API — ⛔ blocked

- **Gives:** global event coverage including Germany (ticketmaster.de inventory).
- **Terms (checked 2026-10-28):** no caching or storage "other than for reasonable periods"; takedown within 24 h on request; **no earning revenue from using or providing the API**; must not replicate Ticketmaster's core experience; may be cut off at any time. Default quota 5,000 calls/day, 5 req/s.
- **Decision:** don't ingest until Ticketmaster confirms in writing that our use is allowed (or through an affiliate/partner agreement). Ask in week 1. Even then, Eventim is the dominant German ticketing platform, so coverage gains are limited.

### Eventbrite — ⛔

- Public event search ended in Feb 2020. The API is now limited to your own organisation's events, venue lookup or event lookup by ID. **Scraping is not an option** (ToS). Usable later only for organisers who connect their own Eventbrite account (Phase 3).

### Google Places — ⛔ not used

- Policies (checked 2026-10-28): only place IDs may be stored indefinitely; other content can't be pre-fetched/cached/stored beyond narrow exceptions. Attribution rules require Google branding, and photo/review author credits with links to Google Maps. **Incompatible with our own database and a MapLibre map.** Not used, including for enrichment.

### Partnerships & editorial (core)

- **Venues/organisers/museums:** a one-page **content licence agreement** (non-exclusive, worldwide, revocable with notice, for photos, descriptions and event data) before using their material. Template needed by slice 10. ⚖️
- **Own photography:** model releases for recognisable people (KUG §22). Buildings from public ground are covered by _Panoramafreiheit_ (§59 UrhG). Interiors need the owner's permission.
- **Event-candidate sources needing partnership (not scraping):** muenchen.de / München Tourismus event calendar, Resident Advisor, venue sites, Bavarian state museums. Contact list built in slice 10.

### Affiliate programmes (Phase 3, to verify)

GetYourGuide, Tiqets, Eventim (Germany), venue booking/reservation tools (OpenTable/Quandoo/TheFork availability in Munich). Not yet verified. Check programme terms, EU availability and attribution before planning revenue.

## Attribution shown in the app

- **Map corner:** "© OpenStreetMap contributors" (tappable → About data).
- **Place page footer:** the sources used for _this_ place ("Info: OpenStreetMap contributors · Foursquare OS Places · 089 editorial · Photo: Name / CC BY 4.0").
- **Explore weather chip:** tapping it shows "Deutscher Wetterdienst via Bright Sky".
- **Transit block:** "Fahrplandaten: MVV".
- **Settings → About data:** the full list with licences and links, plus the ODbL "on request" contact for derivative data.
