import { parseCurrentWeather } from './brightSky';

// Shape copied from a real Bright Sky response; values are test values.
const response = (weather: Record<string, unknown>) => ({
  weather: { timestamp: '2026-01-01T12:00:00+01:00', ...weather },
  sources: [{ station_name: 'Test Station' }],
});

describe('parseCurrentWeather', () => {
  it('maps Bright Sky icons to our conditions', () => {
    expect(parseCurrentWeather(response({ temperature: 7.3, icon: 'clear-night' }))).toEqual({
      temperatureC: 7.3,
      condition: 'clearNight',
      observedAt: '2026-01-01T12:00:00+01:00',
      station: 'Test Station',
    });
    expect(parseCurrentWeather(response({ temperature: 1, icon: 'sleet' }))?.condition).toBe(
      'rain',
    );
  });

  it('shows no condition rather than guessing when the icon is missing or unknown', () => {
    expect(
      parseCurrentWeather(response({ temperature: 3, icon: null }))?.condition,
    ).toBeUndefined();
    expect(
      parseCurrentWeather(response({ temperature: 3, icon: 'volcano' }))?.condition,
    ).toBeUndefined();
  });

  it('returns null without a temperature', () => {
    expect(parseCurrentWeather(response({ temperature: null, icon: 'rain' }))).toBeNull();
  });

  it('rejects malformed responses', () => {
    expect(() => parseCurrentWeather({ weather: 'sunny' })).toThrow();
  });
});
