// Spacing, radius, elevation and touch-target tokens from docs/DESIGN_SYSTEM.md §3.

/** 4pt-based spacing steps. Use the names, never raw numbers, in components. */
export const space = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  giant: 64,
} as const;

export type SpaceToken = keyof typeof space;

export const radius = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

/** Screen side gutter by layout width. */
export const gutter = { phone: space.md, tablet: space.xl } as const;

/** Minimum touch target in points (WCAG 2.5.5 / platform guidelines). */
export const MIN_TOUCH_TARGET = 44;

/** Light-mode shadow for floating elements only; dark mode uses surface steps. */
export const floatingShadow = {
  offsetY: 4,
  blur: 16,
  opacity: 0.08,
} as const;
