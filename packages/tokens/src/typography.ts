// Type scale from docs/DESIGN_SYSTEM.md §2. Sizes are in points (mobile) /
// CSS px (web) and scale with the OS text-size setting on mobile.

export type FontWeight = 400 | 500 | 600 | 700 | 800;

export type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing: number;
};

export const typeScale = {
  /** Large numerals only, e.g. the live clock on Explore. */
  hero: { fontSize: 56, lineHeight: 60, fontWeight: 700, letterSpacing: -2 },
  display: { fontSize: 34, lineHeight: 40, fontWeight: 700, letterSpacing: -0.5 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: 700, letterSpacing: -0.3 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: 600, letterSpacing: -0.2 },
  title3: { fontSize: 18, lineHeight: 24, fontWeight: 600, letterSpacing: 0 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: 400, letterSpacing: 0 },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: 600, letterSpacing: 0 },
  callout: { fontSize: 15, lineHeight: 20, fontWeight: 500, letterSpacing: 0 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: 400, letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: 500, letterSpacing: 0.2 },
} as const satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof typeScale;

/** Largest OS text-size multiplier layouts must survive (DESIGN_SYSTEM §2). */
export const MAX_FONT_SCALE = 2;
