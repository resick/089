import type { ConfigContext, ExpoConfig } from 'expo/config';

// One codebase, three installable variants so dev/staging/prod can sit side by
// side on a test phone. APP_ENV is set per EAS build profile (eas.json).
type Variant = 'local' | 'staging' | 'production';

const variant: Variant =
  process.env.APP_ENV === 'production' || process.env.APP_ENV === 'staging'
    ? process.env.APP_ENV
    : 'local';

// Placeholder identifiers: the final bundle ID must be decided (brand + legal
// entity, docs/ANALYSIS.md §8) before the first store upload, because it
// cannot be changed afterwards.
const BUNDLE_ID_BASE = 'app.muc089';

const variants: Record<Variant, { name: string; bundleId: string }> = {
  local: { name: '089 Dev', bundleId: `${BUNDLE_ID_BASE}.dev` },
  staging: { name: '089 Staging', bundleId: `${BUNDLE_ID_BASE}.staging` },
  production: { name: '089', bundleId: BUNDLE_ID_BASE },
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: variants[variant].name,
  slug: 'app-089',
  scheme: 'muc089',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  backgroundColor: '#0B0B0C',
  ios: {
    bundleIdentifier: variants[variant].bundleId,
    supportsTablet: true,
  },
  android: {
    package: variants[variant].bundleId,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'single',
  },
  plugins: ['expo-router', 'expo-localization', '@maplibre/maplibre-react-native'],
  experiments: {
    reactCompiler: true,
  },
  extra: {
    appEnv: variant,
  },
});
