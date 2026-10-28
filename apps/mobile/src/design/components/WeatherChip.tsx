import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Moon,
  Snowflake,
  Sun,
  Wind,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { makeStyles } from '../theme';
import { Icon } from './Icon';
import { PressableArea } from './PressableArea';
import { Text } from './Text';

export type WeatherCondition =
  | 'clear'
  | 'clearNight'
  | 'partlyCloudy'
  | 'partlyCloudyNight'
  | 'cloudy'
  | 'fog'
  | 'windy'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

const conditionIcon: Record<WeatherCondition, LucideIcon> = {
  clear: Sun,
  clearNight: Moon,
  partlyCloudy: CloudSun,
  partlyCloudyNight: CloudMoon,
  cloudy: Cloud,
  fog: CloudFog,
  windy: Wind,
  rain: CloudRain,
  snow: Snowflake,
  thunderstorm: CloudLightning,
};

type Props = {
  temperatureC: number;
  /** Omitted when the source has no condition: show the temperature alone. */
  condition?: WeatherCondition;
  /** Opens the source credit (DWD via Bright Sky). */
  onPress?: () => void;
};

export function WeatherChip({ temperatureC, condition, onPress }: Props) {
  const { t } = useTranslation();
  const styles = useStyles();
  const degrees = Math.round(temperatureC);
  const conditionLabel = condition ? t(`weather.${condition}`) : undefined;
  const text = conditionLabel ? `${degrees}° · ${conditionLabel}` : `${degrees}°`;
  const label = conditionLabel
    ? t('weather.a11y', { temperature: degrees, condition: conditionLabel })
    : t('weather.a11yTemperatureOnly', { temperature: degrees });

  const body = (
    <View style={styles.chip}>
      {condition && <Icon icon={conditionIcon[condition]} size="sm" color="textSecondary" />}
      <Text variant="callout" color="textSecondary">
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
