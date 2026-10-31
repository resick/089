import { pickLocale } from '@089/core';
import { MIN_TOUCH_TARGET } from '@089/tokens';
import { router } from 'expo-router';
import { RotateCw, Search } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, GlassView, Icon, PressableArea, Skeleton, Text } from '@/design/components';
import { makeStyles } from '@/design/theme';
import { useCategoryGroups, useContentLocale } from '@/features/categories/useCategoryGroups';

import { CityMap } from './CityMap';
import { resolveMapFilters } from './mapFilters';

const SKELETON_CHIPS = 5;

/**
 * Home screen (ADR-032): the full-screen map with a search pill and
 * category quick filters floating on frosted glass.
 */
export function MapScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const locale = useContentLocale();
  const categories = useCategoryGroups();
  const [selected, setSelected] = useState<string | null>(null);

  const filters = categories.data ? resolveMapFilters(categories.data) : [];
  const selectedFilter = filters.find((filter) => filter.slug === selected);

  return (
    <View style={styles.root}>
      <CityMap />

      <View style={[styles.top, { paddingTop: insets.top }]} pointerEvents="box-none">
        <PressableArea
          onPress={() => router.push('/search')}
          accessibilityLabel={t('map.search')}
          style={styles.searchPress}
        >
          <GlassView style={styles.search}>
            <Icon icon={Search} size="md" color="textSecondary" />
            <Text variant="body" color="textSecondary" numberOfLines={1}>
              {t('map.search')}
            </Text>
          </GlassView>
        </PressableArea>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          accessibilityLabel={t('map.filtersA11y')}
        >
          {categories.isPending &&
            Array.from({ length: SKELETON_CHIPS }, (_, index) => (
              <Skeleton key={index} width={96} height={34} radius="full" />
            ))}
          {categories.isError && (
            <Chip
              glass
              icon={RotateCw}
              label={t('map.filtersError')}
              onPress={() => void categories.refetch()}
            />
          )}
          {filters.map((filter) => (
            <Chip
              key={filter.slug}
              glass
              icon={filter.icon}
              label={pickLocale(filter.name, locale)}
              selected={filter.slug === selected}
              onPress={() =>
                setSelected((current) => (current === filter.slug ? null : filter.slug))
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Honest state until places exist: no fake pins (CLAUDE.md rule 3). */}
      <View style={styles.bottom} pointerEvents="box-none">
        <GlassView style={styles.notice}>
          <Text variant="callout" accessibilityRole="header">
            {selectedFilter
              ? t('map.emptyTitleFiltered', { category: pickLocale(selectedFilter.name, locale) })
              : t('map.emptyTitle')}
          </Text>
          <Text variant="footnote" color="textSecondary">
            {t('map.emptyBody')}
          </Text>
        </GlassView>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, gap: t.space.xs },
  searchPress: { marginHorizontal: t.space.md, marginTop: t.space.xs },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.xs,
    minHeight: MIN_TOUCH_TARGET + t.space.xxs,
    paddingHorizontal: t.space.md,
    borderRadius: t.radius.full,
    borderWidth: t.hairline,
    borderColor: t.colors.border,
  },
  chips: { gap: t.space.xs, paddingHorizontal: t.space.md, paddingVertical: t.space.xxs },
  // Clears the map's attribution button in the bottom corner.
  bottom: { position: 'absolute', left: 0, right: 0, bottom: t.space.xxxl },
  notice: {
    marginHorizontal: t.space.md,
    padding: t.space.md,
    gap: t.space.xxs,
    borderRadius: t.radius.md,
    borderCurve: 'continuous',
    borderWidth: t.hairline,
    borderColor: t.colors.border,
  },
}));
