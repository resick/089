import '@/lib/i18n';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ToastProvider } from '@/design/components/Toast';
import { useTheme } from '@/design/theme';

// Keep the splash screen up until Inter is loaded, so text never re-flows
// from the system font to Inter on first paint.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const theme = useTheme();
  // A font failure must not block the app: fall back to the system font.
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const base = theme.scheme === 'light' ? DefaultTheme : DarkTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.accentText,
      background: theme.colors.bg,
      card: theme.colors.bg,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <ToastProvider>
        <StatusBar style={theme.scheme === 'light' ? 'dark' : 'light'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="gallery/index" options={{ headerShown: true, title: 'Gallery' }} />
          <Stack.Screen
            name="gallery/sheet"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.4, 0.9],
              sheetGrabberVisible: true,
              sheetCornerRadius: theme.radius.lg,
              contentStyle: { backgroundColor: theme.colors.surfaceRaised },
            }}
          />
        </Stack>
      </ToastProvider>
    </ThemeProvider>
  );
}
