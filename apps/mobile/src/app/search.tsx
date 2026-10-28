import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, EmptyState, Screen, SearchBar } from '@/design/components';
import { makeStyles } from '@/design/theme';

export default function SearchScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const [query, setQuery] = useState('');

  return (
    <Screen
      header={
        <View style={styles.bar}>
          <View style={styles.field}>
            <SearchBar value={query} onChangeText={setQuery} autoFocus />
          </View>
          <Button label={t('search.cancel')} variant="ghost" onPress={() => router.back()} />
        </View>
      }
    >
      <EmptyState
        icon={Search}
        title={t('search.emptyTitle')}
        body={t('search.emptyBody', { slice: 8 })}
      />
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  bar: { flexDirection: 'row', alignItems: 'center', gap: t.space.xs },
  field: { flex: 1 },
}));
