import { Cloud, CloudRain, CloudSun, Snowflake, Sun, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { makeStyles } from '../theme';
import { Icon } from './Icon';
import { PressableArea } from './PressableArea';
import { Text } from './Text';

export type WeatherCondition = 'clear' | 'partlyCloudy' | 'cloudy' | 'rain' | 'snow';

const conditionIcon: Record<WeatherCondition, LucideIcon> = {
  clear: Sun,
  partlyCloudy: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  snow: Snowflake,
};

type Props = {
  temperatureC: number;
  condition: WeatherCondition;
  /** Opens the source credit (DWD via Bright Sky). */
  onPress?: () => void;
};

export function WeatherChip({ temperatureC, condition, onPress }: Props) {
  const { t } = useTranslation();
  const styles = useStyles();
  const conditionLabel = t(`weather.${condition}`);
  const text = `${Math.round(temperatureC)}° · ${conditionLabel}`;
  const label = t('weather.a11y', {
    temperature: Math.round(temperatureC),
    condition: conditionLabel,
  });

  const body = (
    <View style={styles.chip}>
      <Icon icon={conditionIcon[condition]} size="sm" color="textSecondary" />
      <Text variant="caption" color="textSecondary">
        {text}
      </Text>
    </View>
  );
  if (!onPress)
    return (
      <View accessible accessibilityLabel={label}>
        {body}
      </View>
    );
  return (
    <PressableArea
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityHint={t('weather.sourceHint')}
    >
      {body}
    </PressableArea>
  );
}

const useStyles = makeStyles((t) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.xxs,
    alignSelf: 'flex-start',
  },
}));
