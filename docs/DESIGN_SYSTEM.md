# 089 — Design System

**Direction:** dark-first, image-led when we have images, typography-led when we don't. Munich's civic colours are **black and gold**, so the brand is near-black surfaces with one gold accent. It reads as local without folklore (no lederhosen, no blue-white diamonds).

Tokens live in `packages/tokens` (TypeScript), are exported to the mobile theme hooks and to web CSS variables. Components never use raw values.

## 1. Colour

All pairs below were checked for WCAG contrast (script run 2026-10-28). Text pairs ≥ 4.5:1, icons/pins ≥ 3:1.

### Neutrals & semantic

| Token                   | Dark              | Light                                 | Notes                                                                                         |
| ----------------------- | ----------------- | ------------------------------------- | --------------------------------------------------------------------------------------------- |
| `bg`                    | `#0B0B0C`         | `#FFFFFF`                             | App background                                                                                |
| `surface`               | `#161618`         | `#F4F4F5`                             | Sheets, grouped rows                                                                          |
| `surfaceRaised`         | `#1E1E21`         | `#FFFFFF`                             | Only for overlays (sheet, menu). Shadow in light mode, lighter colour in dark                 |
| `border`                | `#2A2A2E`         | `#E4E4E7`                             | Hairlines only                                                                                |
| `text`                  | `#F4F4F5` (17.9)  | `#0B0B0C` (19.7)                      | Contrast vs `bg` in brackets                                                                  |
| `textSecondary`         | `#A1A1AA` (7.7)   | `#52525B` (7.7)                       |                                                                                               |
| `textTertiary`          | `#8B8B94` (5.8)   | `#6B6B74` (5.3 / 4.8 on surface)      | Metadata. Still AA                                                                            |
| `accent`                | `#F5C400` (12.0)  | `#F5C400` fill / `#8A6A00` text (5.1) | "Munich gold". Fill uses `onAccent` text                                                      |
| `onAccent`              | `#0B0B0C`         | `#0B0B0C`                             | 12.0 on accent                                                                                |
| `danger`                | `#FF6B6B` (7.1)   | `#C62828` (5.6)                       |                                                                                               |
| `success` / open        | `#3DD68C` (10.5)  | `#1B7F4B` (5.0)                       | "Open" status                                                                                 |
| `warning` / closes soon | `#F5C400`         | `#8A6A00`                             | Shares accent hue on purpose: attention                                                       |
| `scrim`                 | `rgba(0,0,0,.55)` | `rgba(0,0,0,.35)`                     | Behind sheets, and on image text overlays (≥ 4.5 guaranteed by gradient-free 55% scrim bands) |

**Accent use rule:** one gold element per screen region: the primary button, the selected tab, or the "open now" emphasis. Never gold text on a light background except `accentText`.

### Category colours (pins, chips, the typographic header only)

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

Pin glyphs: `#0B0B0C` on the dark variant, white on the light variant (all ≥ 4.9:1). **Colour is never the only signal.** Every pin and chip also carries the category icon.

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
- **Radius:** `none 0`, `sm 6` (chips, inputs), `md 12` (cards, images), `lg 20` (sheets' top corners), `full` (pills, avatars). **Only one rounded container level**: a card is never inside another rounded box.
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

Heavy gradients · glassmorphism/blur panels · card-in-card · more than one rounded container level · generic AI illustrations (empty states use one line icon) · decorative animation · more than one accent element per region · category colours outside pins/chips/headers.

## 8. Accessibility checklist (per component PR)

Contrast pairs from this table only · `accessibilityLabel`/`Role`/`State` set · dynamic type at 200% without overlap · focus order logical · 44pt targets · status not conveyed by colour alone ("Open" text + colour) · Reduce Motion respected · screen reader reads status line as one phrase ("Open, closes at 11 PM").

## 9. Brand placeholders

Logo: **text wordmark "089" in Inter 800, tracking −2, gold on near-black** until a real logo exists (pending trademark check — see ANALYSIS §7). App icon placeholder: the same wordmark on `#0B0B0C`.
