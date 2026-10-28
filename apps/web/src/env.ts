import { parseEnv, webPublicEnvSchema } from '@089/core';

// Next inlines NEXT_PUBLIC_* only for static `process.env.X` references.
export const env = parseEnv(webPublicEnvSchema, {
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
