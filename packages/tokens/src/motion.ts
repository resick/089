// Motion tokens from docs/DESIGN_SYSTEM.md §6. Motion explains or confirms;
// it is never decorative, and Reduce Motion replaces movement with fades.

export const duration = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;

export type DurationToken = keyof typeof duration;

/** Standard easing as cubic-bezier control points. */
export const easingStandard = [0.2, 0, 0, 1] as const;

/** Scale keyframes for the save confirmation, the only "delight" animation. */
export const saveBounce = [1, 1.15, 1] as const;
