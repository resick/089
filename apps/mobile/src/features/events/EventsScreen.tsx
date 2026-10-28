import { CITY_TIMEZONE, upcomingDays, type CityDay } from '@089/core';
import { CalendarDays } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Chip, EmptyState, Screen, Text } from '@/design/components';
import { makeStyles } from '@/design/theme';
import { useNow } from '@/lib/useNow';

const DAYS_SHOWN = 14;

export function EventsScreen() {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const now = useNow();
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-GB';

  const days = useMemo(() => upcomingDays(now, DAYS_SHOWN, CITY_TIMEZONE), [now]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // Falls back to today, also after midnight when yesterday's key drops out.
  const selected = days.find((d) => d.key === selectedKey) ?? days[0]!;

  // 'short' labels the chips ("Today"), 'long' sits mid-sentence ("for today").
  const label = (day: CityDay, style: 'short' | 'long') => {
    if (day.offset === 0) return t(style === 'short' ? 'events.today' : 'events.todayInSentence');
    if (day.offset === 1)
      return t(style === 'short' ? 'events.tomorrow' : 'events.tomorrowInSentence');
    return new Intl.DateTimeFormat(locale, {
      weekday: style,
      day: 'numeric',
      month: style === 'short' ? 'numeric' : 'long',
      timeZone: CITY_TIMEZONE,
    }).format(day.date);
  };

  return (
    <Screen
      header={
        <View style={styles.header}>
          <Text variant="title1" accessibilityRole="header">
            {t('events.title')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.strip}
            accessibilityRole="tablist"
          >
            {days.map((day) => (
              <Chip
                key={day.key}
                label={label(day, 'short')}
                selected={day.key === selected.key}
                onPress={() => setSelectedKey(day.key)}
              />
            ))}
          </ScrollView>
        </View>
      }
    >
      <EmptyState
        icon={CalendarDays}
        title={t('events.emptyTitle', { day: label(selected, 'long') })}
        body={t('events.emptyBody', { slice: 10 })}
      />
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  header: { gap: t.space.md },
  strip: { gap: t.space.xs, paddingRight: t.space.md },
}));
