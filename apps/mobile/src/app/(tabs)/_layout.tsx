import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useColors } from '@/design/theme';

// Tab set from ADR-013. Icons arrive with the design system (slice 2).
export default function TabLayout() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentText,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.explore') }} />
      <Tabs.Screen name="map" options={{ title: t('tabs.map') }} />
      <Tabs.Screen name="events" options={{ title: t('tabs.events') }} />
      <Tabs.Screen name="saved" options={{ title: t('tabs.saved') }} />
    </Tabs>
  );
}
