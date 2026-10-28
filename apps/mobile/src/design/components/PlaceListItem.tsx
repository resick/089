import { View } from 'react-native';

import { makeStyles } from '../theme';
import type { PlaceSummary } from './PlaceCard';
import { PlaceArt } from './PlaceArt';
import { PressableArea } from './PressableArea';
import { SaveButton } from './SaveButton';
import { StatusLine } from './StatusLine';
import { Text } from './Text';

type Props = PlaceSummary & {
  saved?: boolean;
  onToggleSave?: () => void;
  onPress: () => void;
};

/** Compact row for lists, search results and the map's list view. */
export function PlaceListItem({
  name,
  category,
  categoryLabel,
  meta,
  status,
  distance,
  photo,
  saved = false,
  onToggleSave,
  onPress,
}: Props) {
  const styles = useStyles();
  const subtitle = [categoryLabel, meta, distance].filter(Boolean).join(' · ');
  const label = [name, subtitle, status?.text].filter(Boolean).join(', ');

  // Save button sits beside the pressable row, never inside it (no nested buttons).
  return (
    <View style={styles.row}>
      <PressableArea onPress={onPress} accessibilityLabel={label} style={styles.main}>
        <View style={styles.thumb}>
          <PlaceArt category={category} photo={photo} aspectRatio={1} />
        </View>
        <View style={styles.body}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {name}
          </Text>
          <Text variant="footnote" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </Text>
          {status && <StatusLine status={status.status} text={status.text} />}
        </View>
      </PressableArea>
      {onToggleSave && <SaveButton saved={saved} onToggle={onToggleSave} variant="plain" />}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.xs },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.sm,
    paddingVertical: t.space.xs,
  },
  thumb: { width: 64 },
  body: { flex: 1, gap: t.space.xxs },
}));
