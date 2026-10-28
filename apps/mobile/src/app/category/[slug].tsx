import type { CategoryColorToken } from '@089/tokens';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { MapPinned } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CATEGORY_TOKENS } from '@/design/categories';
import { BackButton, EmptyState, PlaceArt, Screen, Text } from '@/design/components';
import { makeStyles } from '@/design/theme';

const isCategory = (value: unknown): value is CategoryColorToken =>
  typeof value === 'string' && (CATEGORY_TOKENS as string[]).includes(value);

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();
  const styles = useStyles();

  if (!isCategory(slug)) return <Redirect href="/" />;

  return (
    <Screen header={<BackButton />}>
      <View style={styles.hero}>
        <PlaceArt category={slug} aspectRatio={21 / 9} />
        <Text variant="title1" accessibilityRole="header">
          {t(`categories.${slug}`)}
        </Text>
      </View>
      <EmptyState
        icon={MapPinned}
        title={t('category.emptyTitle')}
        body={t('category.emptyBody', { slice: 4 })}
      />
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  hero: { gap: t.space.md },
}));
