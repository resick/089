// Public env values for tests. Real ones come from .env.local / EAS; these
// only need to pass validation in src/lib/env.ts.
process.env.EXPO_PUBLIC_APP_ENV = 'local';
process.env.EXPO_PUBLIC_MAP_STYLE_URL = 'https://tiles.example.test/dark.json';
process.env.EXPO_PUBLIC_MAP_STYLE_URL_LIGHT = 'https://tiles.example.test/light.json';
