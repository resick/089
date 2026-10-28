import { describe, expect, it } from 'vitest';

import { CITY_TIMEZONE, dayPartAt, hourIn, upcomingDays } from './time';

describe('hourIn / dayPartAt', () => {
  it('uses the city timezone, not UTC', () => {
    // 21:30 UTC in winter is 22:30 in Munich.
    const date = new Date('2026-01-15T21:30:00Z');
    expect(hourIn(date, CITY_TIMEZONE)).toBe(22);
    expect(dayPartAt(date, CITY_TIMEZONE)).toBe('evening');
  });

  it('follows summer time', () => {
    // 21:30 UTC in July is 23:30 in Munich (UTC+2): night, not evening.
    expect(dayPartAt(new Date('2026-07-15T21:30:00Z'), CITY_TIMEZONE)).toBe('night');
  });

  it('covers every part of the day', () => {
    const at = (utcHour: number) =>
      dayPartAt(new Date(Date.UTC(2026, 0, 15, utcHour)), CITY_TIMEZONE);
    // Winter: local = UTC + 1.
    expect(at(6)).toBe('morning'); // 07:00
    expect(at(12)).toBe('afternoon'); // 13:00
    expect(at(18)).toBe('evening'); // 19:00
    expect(at(2)).toBe('night'); // 03:00
  });
});

describe('upcomingDays', () => {
  it('starts on the local date even when UTC is still on the previous day', () => {
    // 23:30 UTC on 31 Dec is already 1 Jan 00:30 in Munich.
    const days = upcomingDays(new Date('2026-12-31T23:30:00Z'), 3, CITY_TIMEZONE);
    expect(days.map((d) => d.key)).toEqual(['2027-01-01', '2027-01-02', '2027-01-03']);
    expect(days[0]).toMatchObject({ offset: 0, weekday: 5 }); // Friday
  });

  it('crosses month ends and the DST switch without skipping or repeating a day', () => {
    // Summer time ends on 25 Oct 2026.
    const days = upcomingDays(new Date('2026-10-24T10:00:00Z'), 9, CITY_TIMEZONE);
    expect(days.map((d) => d.key)).toEqual([
      '2026-10-24',
      '2026-10-25',
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
    ]);
  });
});
