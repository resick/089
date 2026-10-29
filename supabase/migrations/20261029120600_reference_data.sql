-- Reference data every environment needs: the launch city, our category
-- taxonomy (spec 3.1) and the cross-cutting tags. This is our own
-- classification, not venue data. Later changes go through the CMS or a new
-- migration.

-- Munich. bbox and center are the city boundary's (OSM relation 62428,
-- © OpenStreetMap contributors, ODbL), looked up via Nominatim on 2026-10-29.
-- Day-trip areas (lakes, Alps) widen the ingestion area in slice 4, not the city.
insert into public.cities
  (slug, name, country_code, timezone, default_locale, locales, bbox, center, holiday_region)
values (
  'muenchen',
  '{"de": "München", "en": "Munich"}',
  'DE',
  'Europe/Berlin',
  'de',
  '{de,en}',
  extensions.st_makeenvelope(11.3607770, 48.0616244, 11.7229099, 48.2481162, 4326)::extensions.geography,
  extensions.st_setsrid(extensions.st_makepoint(11.5753822, 48.1371079), 4326)::extensions.geography,
  'DE-BY'
);

-- Top-level categories. Slugs, icons and colour tokens match
-- apps/mobile/src/design/categories.ts and packages/tokens; names match the
-- app's locale files. attribute_schema lists the category-specific fields
-- from spec 3.5.
insert into public.categories (slug, name, icon, color_token, sort, attribute_schema) values
(
  'food', '{"de": "Essen & Trinken", "en": "Food & Drinks"}', 'utensils-crossed', 'food', 10,
  '{
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "cuisines": {"type": "array", "items": {"type": "string"}},
      "diets": {"type": "array", "items": {"enum": ["vegetarian", "vegan", "gluten_free", "halal", "kosher"]}},
      "menu_url": {"type": "string", "format": "uri"},
      "reservation_url": {"type": "string", "format": "uri"},
      "outdoor_seating": {"type": "boolean"}
    }
  }'
),
(
  'nightlife', '{"de": "Nachtleben", "en": "Nightlife"}', 'martini', 'nightlife', 20,
  '{
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "music_genres": {"type": "array", "items": {"type": "string"}},
      "door_policy": {"enum": ["relaxed", "selective", "strict"]},
      "min_age": {"type": "integer", "minimum": 16, "maximum": 30}
    }
  }'
),
(
  'entertainment', '{"de": "Unterhaltung", "en": "Entertainment"}', 'gamepad-2', 'entertainment', 30,
  '{
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "offerings": {"type": "array", "items": {"type": "string"}},
      "booking_url": {"type": "string", "format": "uri"},
      "min_age": {"type": "integer", "minimum": 0, "maximum": 21}
    }
  }'
),
(
  'culture', '{"de": "Kultur & Kunst", "en": "Culture & Arts"}', 'palette', 'culture', 40,
  '{
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "exhibitions_url": {"type": "string", "format": "uri"},
      "tickets_url": {"type": "string", "format": "uri"},
      "free_days": {"type": "array", "items": {"enum": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]}},
      "guided_tours": {"type": "boolean"}
    }
  }'
),
(
  'tourism', '{"de": "Sehenswürdigkeiten", "en": "Sights"}', 'landmark', 'tourism', 50,
  '{
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "tickets_required": {"type": "boolean"},
      "tickets_url": {"type": "string", "format": "uri"},
      "visitor_info_url": {"type": "string", "format": "uri"}
    }
  }'
),
(
  'activities', '{"de": "Aktivitäten", "en": "Activities"}', 'zap', 'activities', 60,
  '{
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "offerings": {"type": "array", "items": {"type": "string"}},
      "booking_url": {"type": "string", "format": "uri"},
      "booking_required": {"type": "boolean"},
      "min_age": {"type": "integer", "minimum": 0, "maximum": 21}
    }
  }'
),
(
  'outdoors', '{"de": "Natur & Draußen", "en": "Outdoors & Nature"}', 'trees', 'outdoors', 70,
  '{
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "facilities": {"type": "array", "items": {"enum": ["toilets", "parking", "playground", "kiosk", "bbq_area", "lifeguard", "changing_rooms"]}},
      "swimming": {"type": "boolean"},
      "dogs_allowed": {"type": "boolean"},
      "route_length_km": {"type": "number", "minimum": 0}
    }
  }'
),
(
  'shopping', '{"de": "Shopping", "en": "Shopping"}', 'shopping-bag', 'shopping', 80,
  '{
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "specialties": {"type": "array", "items": {"type": "string"}},
      "second_hand": {"type": "boolean"}
    }
  }'
),
(
  'wellness', '{"de": "Wellness", "en": "Wellness"}', 'flower-2', 'wellness', 90,
  '{
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "facilities": {"type": "array", "items": {"enum": ["sauna", "steam_room", "pool", "gym", "massage"]}},
      "booking_url": {"type": "string", "format": "uri"}
    }
  }'
),
(
  -- Applies to events (slice 10), so places carry no attributes for it.
  'events', '{"de": "Events", "en": "Events"}', 'calendar-days', 'events', 100,
  '{"type": "object", "additionalProperties": false, "properties": {}}'
);

-- Subcategories (spec 3.1). Slugs are unique across the whole taxonomy because
-- they appear in URLs; a place can belong to several categories.
insert into public.categories (parent_id, slug, name, sort)
select parent.id, sub.slug, sub.name::jsonb, sub.sort
from (values
  ('food', 'restaurants', '{"de": "Restaurants", "en": "Restaurants"}', 10),
  ('food', 'cafes', '{"de": "Cafés", "en": "Cafés"}', 20),
  ('food', 'specialty-coffee', '{"de": "Specialty Coffee", "en": "Specialty coffee"}', 30),
  ('food', 'bakeries', '{"de": "Bäckereien", "en": "Bakeries"}', 40),
  ('food', 'bars', '{"de": "Bars", "en": "Bars"}', 50),
  ('food', 'pubs', '{"de": "Kneipen", "en": "Pubs"}', 60),
  ('food', 'rooftop-bars', '{"de": "Rooftop-Bars", "en": "Rooftop bars"}', 70),
  ('food', 'cocktail-bars', '{"de": "Cocktailbars", "en": "Cocktail bars"}', 80),
  ('food', 'beer-gardens', '{"de": "Biergärten", "en": "Beer gardens"}', 90),
  ('food', 'brunch', '{"de": "Brunch", "en": "Brunch"}', 100),
  ('food', 'desserts', '{"de": "Desserts & Eis", "en": "Desserts & ice cream"}', 110),
  ('food', 'street-food', '{"de": "Streetfood", "en": "Street food"}', 120),

  ('nightlife', 'clubs', '{"de": "Clubs", "en": "Clubs"}', 10),
  ('nightlife', 'lounges', '{"de": "Lounges", "en": "Lounges"}', 20),
  ('nightlife', 'live-music', '{"de": "Livemusik", "en": "Live music"}', 30),
  ('nightlife', 'techno', '{"de": "Techno", "en": "Techno"}', 40),
  ('nightlife', 'parties', '{"de": "Partys", "en": "Parties"}', 50),
  ('nightlife', 'dj-events', '{"de": "DJ-Events", "en": "DJ events"}', 60),
  ('nightlife', 'late-night', '{"de": "Late Night", "en": "Late night"}', 70),

  ('entertainment', 'arcades', '{"de": "Arcades", "en": "Arcades"}', 10),
  ('entertainment', 'bowling', '{"de": "Bowling", "en": "Bowling"}', 20),
  ('entertainment', 'billiards', '{"de": "Billard", "en": "Billiards"}', 30),
  ('entertainment', 'escape-rooms', '{"de": "Escape Rooms", "en": "Escape rooms"}', 40),
  ('entertainment', 'karaoke', '{"de": "Karaoke", "en": "Karaoke"}', 50),
  ('entertainment', 'cinemas', '{"de": "Kinos", "en": "Cinemas"}', 60),
  ('entertainment', 'gaming-lounges', '{"de": "Gaming-Lounges", "en": "Gaming lounges"}', 70),
  ('entertainment', 'virtual-reality', '{"de": "Virtual Reality", "en": "Virtual reality"}', 80),
  ('entertainment', 'indoor-centres', '{"de": "Indoor-Freizeitzentren", "en": "Indoor centres"}', 90),
  ('entertainment', 'comedy', '{"de": "Comedy", "en": "Comedy"}', 100),

  ('culture', 'museums', '{"de": "Museen", "en": "Museums"}', 10),
  ('culture', 'galleries', '{"de": "Galerien", "en": "Galleries"}', 20),
  ('culture', 'exhibitions', '{"de": "Ausstellungen", "en": "Exhibitions"}', 30),
  ('culture', 'historic-buildings', '{"de": "Historische Gebäude", "en": "Historic buildings"}', 40),
  ('culture', 'theatres', '{"de": "Theater", "en": "Theatres"}', 50),
  ('culture', 'opera', '{"de": "Oper", "en": "Opera"}', 60),
  ('culture', 'concert-halls', '{"de": "Konzertsäle", "en": "Concert halls"}', 70),

  ('tourism', 'landmarks', '{"de": "Wahrzeichen", "en": "Landmarks"}', 10),
  ('tourism', 'historic-sites', '{"de": "Historische Stätten", "en": "Historic sites"}', 20),
  ('tourism', 'guided-tours', '{"de": "Führungen", "en": "Guided tours"}', 30),
  ('tourism', 'viewpoints', '{"de": "Aussichtspunkte", "en": "Viewpoints"}', 40),
  ('tourism', 'architecture', '{"de": "Architektur", "en": "Architecture"}', 50),

  ('activities', 'karting', '{"de": "Kartbahnen", "en": "Karting"}', 10),
  ('activities', 'paintball', '{"de": "Paintball", "en": "Paintball"}', 20),
  ('activities', 'laser-tag', '{"de": "Lasertag", "en": "Laser tag"}', 30),
  ('activities', 'climbing', '{"de": "Klettern & Bouldern", "en": "Climbing & bouldering"}', 40),
  ('activities', 'trampoline-parks', '{"de": "Trampolinparks", "en": "Trampoline parks"}', 50),
  ('activities', 'mini-golf', '{"de": "Minigolf", "en": "Mini golf"}', 60),
  ('activities', 'sports', '{"de": "Sport", "en": "Sports"}', 70),
  ('activities', 'workshops', '{"de": "Workshops", "en": "Workshops"}', 80),
  ('activities', 'cooking-classes', '{"de": "Kochkurse", "en": "Cooking classes"}', 90),
  ('activities', 'creative-classes', '{"de": "Kreativkurse", "en": "Creative classes"}', 100),
  ('activities', 'adventure', '{"de": "Abenteuer", "en": "Adventure"}', 110),

  ('outdoors', 'parks', '{"de": "Parks", "en": "Parks"}', 10),
  ('outdoors', 'lakes', '{"de": "Seen", "en": "Lakes"}', 20),
  ('outdoors', 'swimming-spots', '{"de": "Badestellen", "en": "Swimming spots"}', 30),
  ('outdoors', 'hiking', '{"de": "Wandern", "en": "Hiking"}', 40),
  ('outdoors', 'cycling', '{"de": "Radfahren", "en": "Cycling"}', 50),
  ('outdoors', 'gardens', '{"de": "Gärten", "en": "Gardens"}', 60),
  ('outdoors', 'day-trips', '{"de": "Tagesausflüge", "en": "Day trips"}', 70),

  ('shopping', 'shopping-centres', '{"de": "Einkaufszentren", "en": "Shopping centres"}', 10),
  ('shopping', 'boutiques', '{"de": "Boutiquen", "en": "Boutiques"}', 20),
  ('shopping', 'markets', '{"de": "Märkte", "en": "Markets"}', 30),
  ('shopping', 'flea-markets', '{"de": "Flohmärkte", "en": "Flea markets"}', 40),
  ('shopping', 'vintage', '{"de": "Vintage & Secondhand", "en": "Vintage & second-hand"}', 50),
  ('shopping', 'independent-shops', '{"de": "Unabhängige Läden", "en": "Independent shops"}', 60),
  ('shopping', 'specialty-shops', '{"de": "Fachgeschäfte", "en": "Specialty shops"}', 70),

  ('wellness', 'spas', '{"de": "Spas", "en": "Spas"}', 10),
  ('wellness', 'saunas', '{"de": "Saunen", "en": "Saunas"}', 20),
  ('wellness', 'pools', '{"de": "Schwimmbäder", "en": "Pools"}', 30),
  ('wellness', 'gyms', '{"de": "Fitnessstudios", "en": "Gyms"}', 40),
  ('wellness', 'beauty', '{"de": "Beauty", "en": "Beauty"}', 50),

  ('events', 'concerts', '{"de": "Konzerte", "en": "Concerts"}', 10),
  ('events', 'festivals', '{"de": "Festivals", "en": "Festivals"}', 20),
  ('events', 'seasonal-events', '{"de": "Saisonale Events", "en": "Seasonal events"}', 30),
  ('events', 'food-festivals', '{"de": "Food-Festivals", "en": "Food festivals"}', 40),
  ('events', 'sports-events', '{"de": "Sportevents", "en": "Sports events"}', 50),
  ('events', 'community-events', '{"de": "Community-Events", "en": "Community events"}', 60),
  ('events', 'pop-ups', '{"de": "Pop-ups", "en": "Pop-ups"}', 70)
) as sub (parent_slug, slug, name, sort)
join public.categories parent on parent.slug = sub.parent_slug;

-- Cross-cutting tags (spec 3.1): what a place is good for, not what it is.
insert into public.tags (slug, tag_group, name, sort)
select slug, tag_group, name::jsonb, sort
from (values
  ('date', 'occasion', '{"de": "Date", "en": "Date"}', 10),
  ('friends', 'occasion', '{"de": "Mit Freunden", "en": "With friends"}', 20),
  ('family', 'occasion', '{"de": "Mit Familie", "en": "With family"}', 30),
  ('solo', 'occasion', '{"de": "Allein", "en": "Solo"}', 40),
  ('groups', 'occasion', '{"de": "Gruppen", "en": "Groups"}', 50),

  ('indoor', 'feature', '{"de": "Drinnen", "en": "Indoor"}', 10),
  ('outdoor', 'feature', '{"de": "Draußen", "en": "Outdoor"}', 20),
  ('rainy-day', 'feature', '{"de": "Bei Regen", "en": "Rainy day"}', 30),
  ('open-late', 'feature', '{"de": "Lange geöffnet", "en": "Open late"}', 40),

  ('free', 'price', '{"de": "Kostenlos", "en": "Free"}', 10),
  ('budget', 'price', '{"de": "Günstig", "en": "Budget"}', 20),

  ('kid-friendly', 'access', '{"de": "Kinderfreundlich", "en": "Kid-friendly"}', 10),
  ('dog-friendly', 'access', '{"de": "Hundefreundlich", "en": "Dog-friendly"}', 20),
  ('accessible', 'access', '{"de": "Barrierefrei", "en": "Accessible"}', 30),

  ('local-favourite', 'vibe', '{"de": "Bei Einheimischen beliebt", "en": "Local favourite"}', 10),

  ('vegan-options', 'diet', '{"de": "Vegane Optionen", "en": "Vegan options"}', 10),
  ('vegetarian-options', 'diet', '{"de": "Vegetarische Optionen", "en": "Vegetarian options"}', 20)
) as t (slug, tag_group, name, sort);
