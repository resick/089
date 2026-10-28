import type { EventSummary, HoursRow, PlaceSummary, TransitStop } from '@/design/components';

// Obviously fake fixtures for the gallery and tests. Never real places,
// hours or events (CLAUDE.md rule 3).

export const fixturePlace: PlaceSummary = {
  name: 'Test Place 1',
  category: 'food',
  categoryLabel: 'Food & Drinks',
  meta: 'Testburg Mitte · €€',
  status: { status: 'open', text: 'Open · closes 23:00' },
  distance: '850 m',
};

export const fixtureEvent: EventSummary = {
  title: 'Test Event 1',
  when: 'Sat 2 Nov · 20:00',
  venue: 'Test Venue',
  price: 'from €18',
};

export const fixtureHours: HoursRow[] = [
  { day: 'Mon', hours: 'Closed' },
  { day: 'Tue', hours: '11:00–23:00' },
  { day: 'Wed', hours: '11:00–23:00', isToday: true },
  { day: 'Thu', hours: '11:00–23:00' },
  { day: 'Fri', hours: '11:00–01:00' },
  { day: 'Sat', hours: '10:00–01:00' },
  { day: 'Sun', hours: '10:00–15:00, 17:00–22:00' },
];

export const fixtureStops: TransitStop[] = [
  { name: 'Test Stop A', modes: ['U', 'S'], walkMinutes: 4 },
  { name: 'Test Stop B', modes: ['Tram'], walkMinutes: 7 },
];
