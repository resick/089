import { MAX_FONT_SCALE, MIN_TOUCH_TARGET } from '@089/tokens';
import { Search, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { fontFamily, makeStyles, useTheme } from '../theme';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { PressableArea } from './PressableArea';
import { Text } from './Text';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
};

/** Editable search field with a clear button. */
export function SearchBar({ value, onChangeText, placeholder, onSubmit, autoFocus }: Props) {
  const { t } = useTranslation();
  const styles = useStyles();
  const theme = useTheme();
  const label = placeholder ?? t('search.placeholder');
  return (
    <View style={styles.field} accessibilityRole="search">
      <Icon icon={Search} size="md" color="textSecondary" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={label}
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textTertiary}
        returnKeyType="search"
        autoCorrect={false}
        autoFocus={autoFocus}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        selectionColor={theme.colors.accentText}
        style={styles.input}
      />
      {value.length > 0 && (
        <IconButton
          icon={X}
          accessibilityLabel={t('search.clear')}
          onPress={() => onChangeText('')}
        />
      )}
    </View>
  );
}

/** Non-editable look-alike that opens the Search screen (used on Explore). */
export function SearchBarButton({ onPress, label }: { onPress: () => void; label?: string }) {
  const { t } = useTranslation();
  const styles = useStyles();
  const text = label ?? t('search.placeholder');
  return (
    <PressableArea onPress={onPress} accessibilityLabel={text} accessibilityRole="search">
      <View style={styles.field}>
        <Icon icon={Search} size="md" color="textSecondary" />
        <Text variant="body" color="textTertiary" numberOfLines={1} style={styles.flex}>
          {text}
        </Text>
      </View>
    </PressableArea>
  );
}

const useStyles = makeStyles((t) => ({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.xs,
    minHeight: MIN_TOUCH_TARGET,
    paddingLeft: t.space.sm,
    paddingRight: t.space.xxs,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.surface,
  },
  input: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    color: t.colors.text,
    fontFamily: fontFamily[400],
    fontSize: t.type.body.fontSize,
  },
  flex: { flex: 1 },
}));
