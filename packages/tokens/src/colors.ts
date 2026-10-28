// Colour tokens from docs/DESIGN_SYSTEM.md §1. colors.test.ts enforces the
// contrast of every text pair, so change values only together with that doc.

export type ColorScheme = 'dark' | 'light';

export const palette = {
  dark: {
    bg: '#0B0B0C',
    surface: '#161618',
    surfaceRaised: '#1E1E21',
    border: '#2A2A2E',
    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    textTertiary: '#8B8B94',
    accent: '#F5C400',
    accentText: '#F5C400',
    onAccent: '#0B0B0C',
    danger: '#FF6B6B',
    success: '#3DD68C',
    warning: '#F5C400',
  },
  light: {
    bg: '#FFFFFF',
    surface: '#F4F4F5',
    surfaceRaised: '#FFFFFF',
    border: '#E4E4E7',
    text: '#0B0B0C',
    textSecondary: '#52525B',
    textTertiary: '#6B6B74',
    accent: '#F5C400',
    accentText: '#8A6A00',
    onAccent: '#0B0B0C',
    danger: '#C62828',
    success: '#1B7F4B',
    warning: '#8A6A00',
  },
} as const satisfies Record<ColorScheme, Record<string, string>>;

export type ColorToken = keyof (typeof palette)['dark'];

/** Top-level category colours: pins, chips and the no-photo header only. */
export const categoryColors = {
  food: { dark: '#FF7A4D', light: '#C2410C' },
  nightlife: { dark: '#A98BFF', light: '#6D28D9' },
  entertainment: { dark: '#FF6FA5', light: '#BE185D' },
  culture: { dark: '#6E98FF', light: '#1D4ED8' },
  tourism: { dark: '#33C7D1', light: '#0E7490' },
  activities: { dark: '#C2E04E', light: '#4D7C0F' },
  outdoors: { dark: '#42C982', light: '#15803D' },
  shopping: { dark: '#E8A86E', light: '#A3541A' },
  wellness: { dark: '#8FD9C3', light: '#0F766E' },
  events: { dark: '#F5C400', light: '#8A6A00' },
} as const satisfies Record<string, Record<ColorScheme, string>>;

export type CategoryColorToken = keyof typeof categoryColors;
