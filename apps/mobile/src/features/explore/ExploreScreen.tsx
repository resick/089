import { CITY_TIMEZONE, dayPartAt } from '@089/core';
import { router } from 'expo-router';
import { Palette } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CATEGORY_TOKENS } from '@/design/categories';
import {
  AttributionFooter,
  CategoryTile,
  ListRow,
  Screen,
  SearchBarButton,
  SectionHeader,
  Text,
} from '@/design/components';
import { makeStyles } from '@/design/theme';
import { env } from '@/lib/env';
import { useNow } from '@/lib/useNow';

import { NowCard } from './NowCard';

export function ExploreScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const now = useNow();
  const greeting = t(`explore.greeting.${dayPartAt(now, CITY_TIMEZONE)}`);

  return (
    <Screen>
      <View style={styles.intro}>
        <Text variant="title1" accessibilityRole="header">
          {greeting}
        </Text>
        <SearchBarButton onPress={() => router.push('/search')} />
      </View>

      <NowCard />

      <View style={styles.section}>
        <SectionHeader
          title={t('explore.categoriesTitle')}
          subtitle={t('explore.categoriesSubtitle')}
        />
        <View style={styles.grid}>
          {CATEGORY_TOKENS.map((token) => (
            <View key={token} style={styles.cell}>
              <CategoryTile
                category={token}
                label={t(`categories.${token}`)}
                onPress={() =>
                  router.push({ pathname: '/category/[slug]', params: { slug: token } })
                }
              />
            </View>
          ))}
        </View>
      </View>

      <View>
        <AttributionFooter credits={[t('explore.weatherCredit')]} />
        {env.EXPO_PUBLIC_APP_ENV !== 'production' && (
          <ListRow
            label={t('gallery.open')}
            icon={Palette}
            onPress={() => router.push('/gallery')}
          />
        )}
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  intro: { gap: t.space.md },
  section: { gap: t.space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs },
  // Two columns: half the row minus half the gap.
  cell: { flexBasis: '48%', flexGrow: 1 },
}));
