import {
  categoryColors,
  palette,
  radius,
  space,
  typeScale,
  type CategoryColorToken,
  type ColorScheme,
  type FontWeight,
} from '@089/tokens';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

// Theme access for the app (ADR-025: plain StyleSheet + typed hooks over
// @089/tokens). Components read tokens from here and never use raw values.

/** Inter family names loaded in the root layout, one file per weight. */
export const fontFamily: Record<FontWeight, string> = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
  800: 'Inter_800ExtraBold',
};

function buildTheme(scheme: ColorScheme) {
  return {
    scheme,
    colors: palette[scheme],
    category: (token: CategoryColorToken) => categoryColors[token][scheme],
    space,
    radius,
    type: typeScale,
    hairline: StyleSheet.hairlineWidth,
  };
}

export type Theme = ReturnType<typeof buildTheme>;

const themes: Record<ColorScheme, Theme> = { dark: buildTheme('dark'), light: buildTheme('light') };

// Lets a subtree (the component gallery) preview a scheme other than the OS one.
const SchemeOverride = createContext<ColorScheme | null>(null);

export function ThemeOverride({
  scheme,
  children,
}: {
  scheme: ColorScheme | null;
  children: ReactNode;
}) {
  return <SchemeOverride.Provider value={scheme}>{children}</SchemeOverride.Provider>;
}

export function useTheme(): Theme {
  const override = useContext(SchemeOverride);
  const system = useColorScheme();
  // Dark-first: anything but an explicit light preference renders dark.
  return themes[override ?? (system === 'light' ? 'light' : 'dark')];
}

/** Shorthand for components that only need colours. */
export function useColors() {
  return useTheme().colors;
}

/** Whatever `StyleSheet.create` accepts (RN 0.88 no longer exports a name for it). */
type StyleInput = Parameters<typeof StyleSheet.create>[0];

/**
 * Declares theme-dependent styles once, outside the component:
 *   const useStyles = makeStyles((t) => ({ root: { padding: t.space.md } }));
 * The hook returns a memoised StyleSheet for the current scheme.
 */
export function makeStyles<S extends StyleInput>(
  // The intersection gives object literals their style types (e.g. literal
  // 'row' for flexDirection), the same way StyleSheet.create does.
  factory: (theme: Theme) => S & StyleInput,
) {
  const cache = new Map<ColorScheme, Readonly<S>>();
  return function useStyles(): Readonly<S> {
    const theme = useTheme();
    return useMemo(() => {
      const cached = cache.get(theme.scheme);
      if (cached) return cached;
      const styles = StyleSheet.create(factory(theme));
      cache.set(theme.scheme, styles);
      return styles;
    }, [theme]);
  };
}
