import { describe, expect, it } from 'vitest';

import { mobilePublicEnvSchema, parseEnv } from './env';

describe('parseEnv', () => {
  it('returns typed values and applies defaults', () => {
    const env = parseEnv(mobilePublicEnvSchema, {
      EXPO_PUBLIC_MAP_STYLE_URL: 'https://tiles.example.test/style.json',
    });
    expect(env).toEqual({
      EXPO_PUBLIC_APP_ENV: 'local',
      EXPO_PUBLIC_MAP_STYLE_URL: 'https://tiles.example.test/style.json',
    });
  });

  it('lists every invalid variable in one error', () => {
    expect(() =>
      parseEnv(mobilePublicEnvSchema, {
        EXPO_PUBLIC_APP_ENV: 'prod',
        EXPO_PUBLIC_MAP_STYLE_URL: 'not a url',
      }),
    ).toThrow(/EXPO_PUBLIC_APP_ENV[\s\S]*EXPO_PUBLIC_MAP_STYLE_URL/);
  });

  it('rejects a missing required variable', () => {
    expect(() => parseEnv(mobilePublicEnvSchema, {})).toThrow(/EXPO_PUBLIC_MAP_STYLE_URL/);
  });
});
