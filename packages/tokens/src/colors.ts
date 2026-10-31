// Colour tokens from docs/DESIGN_SYSTEM.md §1. colors.test.ts enforces the
// contrast of every text pair, so change values only together with that doc.

export type ColorScheme = 'dark' | 'light';

export const palette = {
  // Monochrome, Apple-like greys (ADR-033); gold stays for the brand and rare emphasis.
  dark: {
    bg: '#000000',
    surface: '#1C1C1E',
    surfaceRaised: '#2C2C2E',
    /** Icon wells and unselected controls placed on a surface. */
    fill: '#2C2C2E',
    border: '#38383A',
    text: '#F5F5F7',
    textSecondary: '#AEAEB2',
    textTertiary: '#8E8E93',
    accent: '#F5C400',
    accentText: '#F5C400',
    onAccent: '#000000',
    danger: '#FF6961',
    success: '#30D158',
    warning: '#F5C400',
    /** Floating controls over the map, behind a blur. */
    glass: 'rgba(28, 28, 30, 0.72)',
  },
  light: {
    bg: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    fill: '#E9E9EE',
    border: '#E0E0E5',
    text: '#1D1D1F',
    textSecondary: '#48484A',
    textTertiary: '#6E6E73',
    accent: '#F5C400',
    accentText: '#806200',
    onAccent: '#1D1D1F',
    danger: '#D70015',
    success: '#1B7F4B',
    warning: '#806200',
    glass: 'rgba(255, 255, 255, 0.78)',
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

/**
 * Basemap colours (ADR-033): a quiet monochrome city where water and parks
 * are only hinted at, so pins and labels carry the colour.
 */
export const mapPalette = {
  dark: {
    land: '#0E0E10',
    landuse: '#121214',
    park: '#111D17',
    water: '#0A1520',
    building: '#1A1A1E',
    road: '#222226',
    roadMajor: '#2D2D32',
    casing: '#0E0E10',
    path: '#1C1C20',
    rail: '#2A2A2F',
    label: '#9A9AA0',
    labelStrong: '#E5E5EA',
    waterLabel: '#4F6A80',
    halo: '#0E0E10',
  },
  light: {
    land: '#F2F2F4',
    landuse: '#ECECEF',
    park: '#DCEADB',
    water: '#C8DBEA',
    building: '#E2E2E7',
    road: '#FFFFFF',
    roadMajor: '#FFFFFF',
    casing: '#D9D9DF',
    path: '#E2E2E6',
    rail: '#CFCFD5',
    label: '#6E6E73',
    labelStrong: '#1D1D1F',
    waterLabel: '#5B7B93',
    halo: '#F2F2F4',
  },
} as const satisfies Record<ColorScheme, Record<string, string>>;

export type MapPalette = (typeof mapPalette)[ColorScheme];
