import { mobilePublicEnvSchema, parseEnv } from '@089/core';

// Expo inlines EXPO_PUBLIC_* at build time only for static `process.env.X`
// references, so each variable is listed explicitly (no destructuring/spread).
export const env = parseEnv(mobilePublicEnvSchema, {
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_MAP_STYLE_URL: process.env.EXPO_PUBLIC_MAP_STYLE_URL,
  EXPO_PUBLIC_MAP_STYLE_URL_LIGHT: process.env.EXPO_PUBLIC_MAP_STYLE_URL_LIGHT,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
