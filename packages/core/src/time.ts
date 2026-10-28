// City-time helpers. "Now", "today" and "this weekend" are always computed in
// the city's timezone, never the device's (CLAUDE.md conventions).

/** Munich, the launch city. Multi-city support reads this from `cities`. */
export const CITY_TIMEZONE = 'Europe/Berlin';

export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night';

/** Hour 0–23 of `date` in `timeZone`. */
export function hourIn(date: Date, timeZone: string): number {
  const hour = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone })
    .formatToParts(date)
    .find((part) => part.type === 'hour')?.value;
  return Number(hour);
}

/** Morning 5–11, afternoon 12–17, evening 18–22, night 23–4 (local time). */
export function dayPartAt(date: Date, timeZone: string): DayPart {
  const hour = hourIn(date, timeZone);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'night';
}

export type CityDay = {
  /** Local calendar date, e.g. "2026-10-28". Stable key for lists and queries. */
  key: string;
  /** Noon UTC on that date: inside the same calendar day in any European zone, safe to format. */
  date: Date;
  /** 0 = today, 1 = tomorrow, … */
  offset: number;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
};

/** `count` consecutive local calendar days starting with today in `timeZone`. */
export function upcomingDays(now: Date, count: number, timeZone: string): CityDay[] {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone,
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  const [y, m, d] = [Number(parts.year), Number(parts.month), Number(parts.day)];
  return Array.from({ length: count }, (_, offset) => {
    // Date.UTC normalises day overflow (e.g. 32 Oct → 1 Nov), and noon UTC
    // keeps clear of DST switches, which happen at night.
    const date = new Date(Date.UTC(y, m - 1, d + offset, 12));
    return { key: date.toISOString().slice(0, 10), date, offset, weekday: date.getUTCDay() };
  });
}
