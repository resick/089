import { duration, saveBounce } from '@089/tokens';
import { Bookmark, BookmarkCheck } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated } from 'react-native';

import { useReducedMotion } from '../motion';
import { IconButton } from './IconButton';

type Props = {
  saved: boolean;
  onToggle: () => void;
  variant?: 'plain' | 'filled';
};

/** Save toggle with the app's one "delight" animation (DESIGN_SYSTEM §6). */
export function SaveButton({ saved, onToggle, variant = 'filled' }: Props) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!saved || reduced) return;
    const half = duration.base / 2;
    Animated.sequence(
      saveBounce
        .slice(1)
        .map((toValue) =>
          Animated.timing(scale, { toValue, duration: half, useNativeDriver: true }),
        ),
    ).start();
  }, [saved, reduced, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <IconButton
        icon={saved ? BookmarkCheck : Bookmark}
        accessibilityLabel={saved ? t('save.remove') : t('save.add')}
        selected={saved}
        haptic="light"
        variant={variant}
        onPress={onToggle}
      />
    </Animated.View>
  );
}
