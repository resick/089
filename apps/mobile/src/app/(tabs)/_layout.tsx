import { Tabs } from 'expo-router';
import {
  Bookmark,
  CalendarDays,
  Compass,
  Map as MapIcon,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';

import { fontFamily, useTheme } from '@/design/theme';

// Tab set from ADR-013.
function tabIcon(Glyph: LucideIcon) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Glyph color={color} size={size} strokeWidth={2} />;
  };
}

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accentText,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: { backgroundColor: theme.colors.bg, borderTopColor: theme.colors.border },
        tabBarLabelStyle: { fontFamily: fontFamily[500], fontSize: theme.type.caption.fontSize },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.explore'), tabBarIcon: tabIcon(Compass) }}
      />
      <Tabs.Screen name="map" options={{ title: t('tabs.map'), tabBarIcon: tabIcon(MapIcon) }} />
      <Tabs.Screen
        name="events"
        options={{ title: t('tabs.events'), tabBarIcon: tabIcon(CalendarDays) }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: t('tabs.saved'), tabBarIcon: tabIcon(Bookmark) }}
      />
    </Tabs>
  );
}
