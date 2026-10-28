import type { CategoryColorToken } from '@089/tokens';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { categoryIcons } from '../categories';
import { makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';

type Props = {
  category: CategoryColorToken;
  photo?: ImageSourcePropType;
  aspectRatio?: number;
  rounded?: boolean;
};

/**
 * Card/hero artwork. With a licensed photo it shows the photo; without one it
 * renders the designed no-photo state (category tint + line icon), which is
 * the default for most places (ANALYSIS §4.3), not a placeholder.
 */
export function PlaceArt({ category, photo, aspectRatio = 4 / 3, rounded = true }: Props) {
  const styles = useStyles();
  const theme = useTheme();
  const tint = theme.category(category);

  if (photo) {
    return (
      <Image
        source={photo}
        accessibilityIgnoresInvertColors
        style={[styles.frame, { aspectRatio }, rounded && styles.rounded]}
      />
    );
  }

  return (
    <View style={[styles.frame, { aspectRatio }, rounded && styles.rounded]}>
      {/* 10% category tint over surface, as specified in DESIGN_SYSTEM §4. */}
      <View style={[styles.tint, { backgroundColor: tint }]} />
      <Icon icon={categoryIcons[category]} size="xl" color={{ raw: tint }} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  frame: {
    width: '100%',
    backgroundColor: t.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rounded: { borderRadius: t.radius.md },
  tint: { ...StyleSheet.absoluteFill, opacity: 0.1 },
}));
