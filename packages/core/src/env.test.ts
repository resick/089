import { describe, expect, it } from 'vitest';

import { mobilePublicEnvSchema, parseEnv } from './env';

const supabase = {
  EXPO_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.example.test',
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test-key',
};

describe('parseEnv', () => {
  it('returns typed values and applies defaults', () => {
    const env = parseEnv(mobilePublicEnvSchema, {
      EXPO_PUBLIC_MAP_STYLE_URL: 'https://tiles.example.test/dark.json',
      EXPO_PUBLIC_MAP_STYLE_URL_LIGHT: 'https://tiles.example.test/light.json',
      ...supabase,
    });
    expect(env).toEqual({
      EXPO_PUBLIC_APP_ENV: 'local',
      EXPO_PUBLIC_MAP_STYLE_URL: 'https://tiles.example.test/dark.json',
      EXPO_PUBLIC_MAP_STYLE_URL_LIGHT: 'https://tiles.example.test/light.json',
      ...supabase,
    });
  });

  it('lists every invalid variable in one error', () => {
    expect(() =>
      parseEnv(mobilePublicEnvSchema, {
        EXPO_PUBLIC_APP_ENV: 'prod',
        EXPO_PUBLIC_MAP_STYLE_URL: 'not a url',
        EXPO_PUBLIC_MAP_STYLE_URL_LIGHT: 'https://tiles.example.test/light.json',
        ...supabase,
      }),
    ).toThrow(/EXPO_PUBLIC_APP_ENV[\s\S]*EXPO_PUBLIC_MAP_STYLE_URL/);
  });

  it('rejects a missing required variable', () => {
    expect(() => parseEnv(mobilePublicEnvSchema, {})).toThrow(/EXPO_PUBLIC_MAP_STYLE_URL/);
  });

  it.each([
    ['a secret key', 'sb_secret_test-key'],
    ['a legacy JWT key', 'eyJhbGciOiJIUzI1NiJ9.test.test'],
  ])('refuses %s in place of the publishable key', (_, key) => {
    expect(() =>
      parseEnv(mobilePublicEnvSchema, {
        EXPO_PUBLIC_MAP_STYLE_URL: 'https://tiles.example.test/dark.json',
        EXPO_PUBLIC_MAP_STYLE_URL_LIGHT: 'https://tiles.example.test/light.json',
        ...supabase,
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
      }),
    ).toThrow(/EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: must be a Supabase publishable key/);
  });
});
