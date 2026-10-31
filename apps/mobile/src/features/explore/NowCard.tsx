import { CITY_TIMEZONE, dayPartAt } from '@089/core';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Skeleton, Text, useToast, WeatherChip, Wordmark } from '@/design/components';
import { makeStyles } from '@/design/theme';
import { useCurrentWeather } from '@/features/weather/useCurrentWeather';
import { useNow } from '@/lib/useNow';

/**
 * "Munich right now": only live, real information (local time, date,
 * DWD weather). Content sections join it once real data exists.
 */
export function NowCard() {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const toast = useToast();
  const now = useNow();
  const weather = useCurrentWeather();
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-GB';

  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CITY_TIMEZONE,
  }).format(now);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: CITY_TIMEZONE,
  }).format(now);
  const dayPart = dayPartAt(now, CITY_TIMEZONE);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Wordmark size="lg" />
        {weather.isPending ? (
          <Skeleton width={88} height={20} />
        ) : (
          weather.data && (
            <WeatherChip
              temperatureC={weather.data.temperatureC}
              condition={weather.data.condition}
              onPress={() => toast.show(t('weather.credit', { station: weather.data?.station }))}
            />
          )
        )}
      </View>
      <View style={styles.bottom}>
        <Text
          variant="hero"
          style={styles.time}
          accessibilityLabel={t('explore.timeA11y', { time })}
        >
          {time}
        </Text>
        <Text variant="title3">{t(`explore.dayPart.${dayPart}`)}</Text>
        <Text variant="footnote" color="textSecondary">
          {date}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    padding: t.space.lg,
    gap: t.space.xxl,
    borderRadius: t.radius.lg,
    borderCurve: 'continuous',
    backgroundColor: t.colors.surface,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottom: { gap: t.space.xxs },
  time: { fontVariant: ['tabular-nums'] },
}));
