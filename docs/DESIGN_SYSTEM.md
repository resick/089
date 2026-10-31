# 089 — Design System

> **Updated 2026-10-31 (ADR-033):** monochrome Apple-like neutrals, larger radii (8/16/24, continuous corners), 1.75 icon strokes, gold only for the wordmark and selected states, category colours only on map pins and the no-photo header, frosted glass only for controls over the map.

**Direction:** dark-first, image-led when we have images, typography-led when we don't. Quiet and monochrome, in the spirit of Apple's own apps. Munich's civic colours are **black and gold**, so the brand is black surfaces with one sparing gold accent. It reads as local without folklore (no lederhosen, no blue-white diamonds).

Tokens live in `packages/tokens` (TypeScript), are exported to the mobile theme hooks and to web CSS variables. Components never use raw values.

## 1. Colour

All pairs below were checked for WCAG contrast (`colors.test.ts`, values from 2026-10-31). Text pairs ≥ 4.5:1, icons/pins ≥ 3:1.

### Neutrals & semantic

| Token                   | Dark              | Light                                 | Notes                                                                                         |
| ----------------------- | ----------------- | ------------------------------------- | --------------------------------------------------------------------------------------------- |
| `bg`                    | `#000000`         | `#F5F5F7`                             | App background                                                                                |
| `surface`               | `#1C1C1E`         | `#FFFFFF`                             | Cards, tiles, grouped rows                                                                    |
| `surfaceRaised`         | `#2C2C2E`         | `#FFFFFF`                             | Only for overlays (sheet, menu). Shadow in light mode, lighter colour in dark                 |
| `border`                | `#38383A`         | `#E0E0E5`                             | Hairlines only                                                                                |
| `text`                  | `#F5F5F7` (19.3)  | `#1D1D1F` (15.5)                      | Contrast vs `bg` in brackets                                                                  |
| `textSecondary`         | `#AEAEB2` (9.5)   | `#48484A` (8.4)                       |                                                                                               |
| `textTertiary`          | `#8E8E93` (6.4)   | `#6E6E73` (4.7 / 5.1 on surface)      | Metadata. Still AA                                                                            |
| `accent`                | `#F5C400` (12.8)  | `#F5C400` fill / `#806200` text (5.3) | "Munich gold": wordmark and selected states only. Fill uses `onAccent` text                   |
| `onAccent`              | `#000000`         | `#1D1D1F`                             | 12.8 / 10.2 on accent                                                                         |
| `danger`                | `#FF6961` (7.4)   | `#D70015` (4.9)                       |                                                                                               |
| `success` / open        | `#30D158` (10.4)  | `#1B7F4B` (4.6)                       | "Open" status                                                                                 |
| `warning` / closes soon | `#F5C400`         | `#806200`                             | Shares accent hue on purpose: attention                                                       |
| `fill`                  | `#2C2C2E`         | `#E9E9EE`                             | Icon wells, unselected chips, secondary buttons                                               |
| `glass`                 | `#1C1C1E` at 72%  | `#FFFFFF` at 78%                      | `GlassView` over the map only, behind a blur                                                  |
| `scrim`                 | `rgba(0,0,0,.55)` | `rgba(0,0,0,.35)`                     | Behind sheets, and on image text overlays (≥ 4.5 guaranteed by gradient-free 55% scrim bands) |

**Accent use rule:** gold marks the wordmark and what is selected (a filter chip, a toggle), nothing else. Primary buttons are monochrome (`text` fill, `bg` label) and the selected tab is full-strength `text`. Never gold text on a light background except `accentText`.

### Category colours (map pins and the no-photo header only)

| Category                 | Dark (vs bg)   | Light (vs white) |
| ------------------------ | -------------- | ---------------- |
| Food & Drinks            | `#FF7A4D` 7.6  | `#C2410C` 5.2    |
| Nightlife                | `#A98BFF` 7.3  | `#6D28D9` 7.1    |
| Entertainment            | `#FF6FA5` 7.6  | `#BE185D` 6.0    |
| Culture & Arts           | `#6E98FF` 7.1  | `#1D4ED8` 6.7    |
| Tourism & Attractions    | `#33C7D1` 9.6  | `#0E7490` 5.4    |
| Activities & Experiences | `#C2E04E` 13.2 | `#4D7C0F` 5.0    |
| Outdoors & Nature        | `#42C982` 9.3  | `#15803D` 5.0    |
| Shopping                 | `#E8A86E` 9.6  | `#A3541A` 5.5    |
| Wellness                 | `#8FD9C3` 12.1 | `#0F766E` 5.5    |
| Events                   | `#F5C400` 12.0 | `#8A6A00` 5.1    |

Pin glyphs: `#0B0B0C` on the dark variant, white on the light variant (all ≥ 4.9:1). **Colour is never the only signal.** Every pin also carries the category icon. Tiles and chips are monochrome (ADR-033).

### Basemap

`mapPalette` in `packages/tokens`: a quiet monochrome city (water and parks only hinted at) applied to OpenFreeMap's styles by `restyleBasemap`, with 3D buildings from zoom 15. Labels pass 4.5:1 on land.

## 2. Typography

**Inter** (variable), with `tnum` for times and prices and `ss01`-style alternates off. Scale uses an 8pt rhythm and supports dynamic type (scales with the OS setting, capped at 200% for layouts that would break; long text wraps instead of truncating where content matters).

| Token        | Size / line | Weight             | Use                                   |
| ------------ | ----------- | ------------------ | ------------------------------------- |
| `display`    | 34 / 40     | 700, tracking −0.5 | Place/event title on hero             |
| `title1`     | 28 / 34     | 700                | Screen titles                         |
| `title2`     | 22 / 28     | 600                | Section headers                       |
| `title3`     | 18 / 24     | 600                | Card titles (L)                       |
| `body`       | 16 / 24     | 400                | Body copy                             |
| `bodyStrong` | 16 / 24     | 600                | Inline emphasis, list titles          |
| `callout`    | 15 / 20     | 500                | Status line, buttons                  |
| `footnote`   | 13 / 18     | 400                | Metadata, credits                     |
| `caption`    | 12 / 16     | 500, tracking +0.2 | Chips, labels (minimum size anywhere) |

## 3. Spacing, radius, elevation

- **Spacing (4pt base):** `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Screen gutter 16 (phones) / 24 (tablets). Section gap 32.
- **Radius:** `none 0`, `sm 8` (inputs), `md 16` (cards, tiles, images), `lg 24` (hero cards, sheets' top corners), `full` (pills, chips, avatars). Cards use `borderCurve: 'continuous'` (Apple's squircle corners on iOS). **Only one rounded container level**: a card is never inside another rounded box.
- **Elevation:** dark mode uses surface colour steps (`bg → surface → surfaceRaised`), no shadows. Light mode adds a single soft shadow (`0 4 16 rgba(0,0,0,.08)`) only for floating elements (sheet, map buttons, toast).
- **Touch targets:** ≥ 44×44pt, even when the visual element is smaller (hitSlop).

## 4. Imagery

- Hero images full-bleed at 4:3 (place) / 16:9 (event); carousel cards 4:5; blurhash placeholder → fade-in 150 ms.
- Text on images only over a solid 55% scrim band at the bottom (not a gradient wash).
- **No-photo header** (default for basic/curated): category-coloured block (10% tint of the category colour on `surface`), large category icon line art, place name in `display`, mini-map strip below. It is a designed state, not a placeholder.
- Credits shown in `footnote` under the image or in the attribution footer.

## 5. Components (MVP set)

Built in this order and shown in the gallery in every state (default, pressed, disabled, loading, error), in both themes and at 200% text:

1. Primitives: `Text` (token-only variants), `Icon`, `Pressable` (haptics + 44pt), `Divider`, `Skeleton`
2. Controls: `Button`, `IconButton`, `Chip`, `SegmentedControl`, `Toggle`, `SearchBar`
3. Content: `PlaceCard` (L/M/S), `PlaceListItem`, `EventCard`, `EventListItem`, `CollectionCard`, `CategoryTile`, `StatusLine`, `HoursTable`, `AttributeBlock`, `TransitStops`, `WeatherChip`, `SponsoredLabel`, `AttributionFooter`, `Avatar`, `ListRow`
4. Containers: `SheetContent` (sheets are native `formSheet` routes, ADR-027), `SectionHeader`, `Toast`, `OfflineBanner`. `FilterSheet` comes with filters in slice 9.
5. States: `EmptyState` (icon + title + one sentence + one action), `ErrorState` (offline vs server, retry)
6. Map: `MapPin`, `ClusterPin`, `UserLocationDot`, `SearchAreaPill` (slice 7)

`AttributeBlock` waits for category attribute schemas (slice 6). `EventListItem` is `EventCard layout="row"`; the S size of `PlaceCard` is `PlaceListItem`.

**Interactive nesting rule:** a pressable never contains another pressable (invalid on web, unreachable for screen readers). Secondary actions such as Save sit beside the card's pressable area.

## 6. Motion

- **Purposeful only:** motion explains where something came from (sheet from pin, page from card) or confirms an action (save).
- Durations: `fast 120ms` (press, toggle), `base 200ms` (fades, chips), `slow 320ms` (sheets, shared-element page transitions). Easing: standard `cubic-bezier(0.2, 0, 0, 1)`. Sheets use spring physics (damping ~ 30).
- **Save** = icon fills + light haptic + 1.0 → 1.15 → 1.0 scale over 200 ms. The only "delight" animation.
- **Reduce Motion** (OS setting) → crossfades instead of movement, and no scale effects.
- No looping/ambient animation, no parallax, no animated gradients.

## 7. Avoid (from spec, enforced in review)

Heavy gradients · glassmorphism/blur panels (exception since ADR-033: `GlassView` for controls floating over the map) · card-in-card · more than one rounded container level · generic AI illustrations (empty states use one line icon) · decorative animation · more than one accent element per region · category colours outside pins and the no-photo header.

## 8. Accessibility checklist (per component PR)

Contrast pairs from this table only · `accessibilityLabel`/`Role`/`State` set · dynamic type at 200% without overlap · focus order logical · 44pt targets · status not conveyed by colour alone ("Open" text + colour) · Reduce Motion respected · screen reader reads status line as one phrase ("Open, closes at 11 PM").

## 9. Brand placeholders

Logo: **text wordmark "089" in Inter 800, tracking −2, gold on near-black** until a real logo exists (pending trademark check — see ANALYSIS §7). App icon placeholder: the same wordmark on `#0B0B0C`.
