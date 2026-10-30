import { pickLocale } from '@089/core';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { MapPinned } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { isCategoryToken } from '@/design/categories';
import {
  BackButton,
  Chip,
  EmptyState,
  PlaceArt,
  Screen,
  Skeleton,
  Text,
} from '@/design/components';
import { makeStyles } from '@/design/theme';
import { useCategoryGroups, useContentLocale } from '@/features/categories/useCategoryGroups';

const SKELETON_CHIPS = 4;

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();
  const styles = useStyles();
  const locale = useContentLocale();
  const { data: groups, isPending, isError, refetch } = useCategoryGroups();
  // null = "All".
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  if (!isCategoryToken(slug)) return <Redirect href="/" />;

  const subcategories = groups?.find((group) => group.slug === slug)?.subcategories ?? [];
  const selected = subcategories.find((sub) => sub.slug === selectedSlug);

  return (
    <Screen header={<BackButton />}>
      <View style={styles.hero}>
        <PlaceArt category={slug} aspectRatio={21 / 9} />
        <Text variant="title1" accessibilityRole="header">
          {t(`categories.${slug}`)}
        </Text>
      </View>

      {/* Filters for the place list. The page still works without them, so a
          failed load is a quiet inline note, not a full error screen. */}
      {isPending ? (
        <View style={styles.strip}>
          {Array.from({ length: SKELETON_CHIPS }, (_, index) => (
            <Skeleton key={index} width={88} height={32} radius="full" />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.errorRow}>
          <Text variant="footnote" color="textSecondary" style={styles.errorText}>
            {t('category.loadError')}
          </Text>
          <Chip label={t('error.retry')} onPress={() => void refetch()} />
        </View>
      ) : (
        subcategories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.strip}
            accessibilityLabel={t('category.filterA11y')}
          >
            <Chip
              label={t('category.all')}
              selected={!selected}
              onPress={() => setSelectedSlug(null)}
            />
            {subcategories.map((sub) => (
              <Chip
                key={sub.slug}
                label={pickLocale(sub.name, locale)}
                selected={sub.slug === selected?.slug}
                onPress={() => setSelectedSlug(sub.slug)}
              />
            ))}
          </ScrollView>
        )
      )}

      <EmptyState
        icon={MapPinned}
        title={
          selected
            ? t('category.emptyTitleIn', { name: pickLocale(selected.name, locale) })
            : t('category.emptyTitle')
        }
        body={t('category.emptyBody', { slice: 4 })}
      />
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  hero: { gap: t.space.md },
  strip: { flexDirection: 'row', gap: t.space.xs, paddingRight: t.space.md },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
  errorText: { flex: 1 },
}));
