import { z } from 'zod';

export const APP_ENVS = ['local', 'staging', 'production'] as const;
export const appEnvSchema = z.enum(APP_ENVS);
export type AppEnv = z.infer<typeof appEnvSchema>;

/**
 * Variables that are safe to ship inside the mobile app bundle.
 * Never add secrets here: everything in this schema is public.
 */
export const mobilePublicEnvSchema = z.object({
  EXPO_PUBLIC_APP_ENV: appEnvSchema.default('local'),
  /** Basemap style for dark mode (the default). */
  EXPO_PUBLIC_MAP_STYLE_URL: z.url(),
  /** Basemap style for light mode. */
  EXPO_PUBLIC_MAP_STYLE_URL_LIGHT: z.url(),
});
export type MobilePublicEnv = z.infer<typeof mobilePublicEnvSchema>;

/** Variables exposed to the browser by the web app. */
export const webPublicEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: appEnvSchema.default('local'),
  NEXT_PUBLIC_SITE_URL: z.url(),
});
export type WebPublicEnv = z.infer<typeof webPublicEnvSchema>;

/**
 * Parses an env record and throws one readable error listing every problem,
 * so a misconfigured build fails at startup instead of deep inside a screen.
 */
export function parseEnv<Schema extends z.ZodType>(
  schema: Schema,
  source: Record<string, string | undefined>,
): z.infer<Schema> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  return result.data;
}
