import { env } from './env';

/**
 * Reads a table or view through Supabase's REST API (PostgREST) with the
 * publishable key; RLS decides which rows come back. Plain `fetch` is enough
 * for public reads and keeps Expo Go simple. supabase-js arrives with sign-in
 * (slice 11). Callers validate the result with zod.
 *
 * Query params use PostgREST syntax, e.g. `{ select: 'id,slug', order: 'sort.asc' }`.
 */
export async function supabaseGet(
  table: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<unknown> {
  // Built by hand: React Native's URLSearchParams is incomplete.
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  const response = await fetch(`${env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, Accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw new Error(`Supabase ${table} responded ${response.status}`);
  return response.json();
}
