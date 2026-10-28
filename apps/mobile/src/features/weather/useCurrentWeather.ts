import { useQuery } from '@tanstack/react-query';

import { MUNICH_CENTER } from '@/features/map/constants';

import { fetchCurrentWeather } from './brightSky';

const THIRTY_MINUTES = 30 * 60 * 1000;

/** Current weather at the city centre, refreshed at most every 30 minutes. */
export function useCurrentWeather() {
  return useQuery({
    queryKey: ['weather', 'current', MUNICH_CENTER],
    queryFn: ({ signal }) => fetchCurrentWeather(MUNICH_CENTER, signal),
    staleTime: THIRTY_MINUTES,
    retry: 1,
  });
}
