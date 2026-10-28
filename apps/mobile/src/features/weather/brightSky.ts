import { z } from 'zod';

import type { WeatherCondition } from '@/design/components';

// Bright Sky serves DWD open data (CC BY 4.0, credit "Deutscher Wetterdienst").
// Interim: the app calls it directly; slice 9 moves this behind our own
// cached endpoint so clients never hit Bright Sky (ARCHITECTURE §1, ADR-029).
const BRIGHT_SKY_URL = 'https://api.brightsky.dev/current_weather';

/** Bright Sky icon names, mapped to the conditions our UI can show. */
const iconToCondition: Record<string, WeatherCondition> = {
  'clear-day': 'clear',
  'clear-night': 'clearNight',
  'partly-cloudy-day': 'partlyCloudy',
  'partly-cloudy-night': 'partlyCloudyNight',
  cloudy: 'cloudy',
  fog: 'fog',
  wind: 'windy',
  rain: 'rain',
  sleet: 'rain',
  hail: 'rain',
  snow: 'snow',
  thunderstorm: 'thunderstorm',
};

const responseSchema = z.object({
  weather: z.object({
    temperature: z.number().nullable(),
    icon: z.string().nullable(),
    timestamp: z.string(),
  }),
  sources: z.array(z.object({ station_name: z.string() })).min(1),
});

export type CurrentWeather = {
  temperatureC: number;
  /** Absent when Bright Sky has no icon: show the temperature alone, never guess. */
  condition?: WeatherCondition;
  observedAt: string;
  station: string;
};

/** Validates a Bright Sky response; returns null when there's no temperature. */
export function parseCurrentWeather(body: unknown): CurrentWeather | null {
  const { weather, sources } = responseSchema.parse(body);
  if (weather.temperature === null) return null;
  return {
    temperatureC: weather.temperature,
    condition: weather.icon ? iconToCondition[weather.icon] : undefined,
    observedAt: weather.timestamp,
    station: sources[0]!.station_name,
  };
}

export async function fetchCurrentWeather(
  [lon, lat]: readonly [number, number],
  signal?: AbortSignal,
): Promise<CurrentWeather | null> {
  const url = `${BRIGHT_SKY_URL}?lat=${lat}&lon=${lon}&tz=Europe/Berlin`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Bright Sky responded ${response.status}`);
  return parseCurrentWeather(await response.json());
}
