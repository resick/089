import { duration } from '@089/tokens';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReducedMotion } from '../motion';
import { makeStyles } from '../theme';
import { Text } from './Text';

const VISIBLE_MS = 3000;

type ToastApi = { show: (message: string) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>');
  return api;
}

/** One short confirmation at a time ("Saved to Beer gardens"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const show = useCallback((text: string) => {
    setMessage(text);
    setKey((k) => k + 1);
    AccessibilityInfo.announceForAccessibility(text);
  }, []);

  const api = useMemo(() => ({ show }), [show]);
  // Stable, so the toast's animation isn't restarted when the provider re-renders.
  const hide = useCallback(() => setMessage(null), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {message && <ToastView key={key} message={message} onHidden={hide} />}
    </ToastContext.Provider>
  );
}

function ToastView({ message, onHidden }: { message: string; onHidden: () => void }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: duration.base, useNativeDriver: true }),
      Animated.delay(VISIBLE_MS),
      Animated.timing(progress, { toValue: 0, duration: duration.base, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => {
      if (finished) onHidden();
    });
    return () => animation.stop();
  }, [progress, onHidden]);

  const translateY = reduced
    ? 0
    : progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <View pointerEvents="none" style={[styles.host, { bottom: insets.bottom + 72 }]}>
      <Animated.View style={[styles.toast, { opacity: progress, transform: [{ translateY }] }]}>
        <Text variant="callout" color="text" align="center">
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  host: { position: 'absolute', left: t.space.md, right: t.space.md, alignItems: 'center' },
  toast: {
    paddingHorizontal: t.space.md,
    paddingVertical: t.space.sm,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.surfaceRaised,
    borderWidth: t.hairline,
    borderColor: t.colors.border,
  },
}));
