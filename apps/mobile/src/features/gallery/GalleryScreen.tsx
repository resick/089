import { palette, type ColorScheme, type ColorToken, type TypeVariant } from '@089/tokens';
import { router } from 'expo-router';
import { Inbox, Info, Map as MapIcon, Settings, Share2 } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { CATEGORY_TOKENS } from '@/design/categories';
import {
  AttributionFooter,
  Avatar,
  Button,
  CategoryTile,
  Chip,
  CollectionCard,
  Divider,
  EmptyState,
  ErrorState,
  EventCard,
  HoursTable,
  IconButton,
  ListRow,
  OfflineBanner,
  PlaceCard,
  PlaceListItem,
  SaveButton,
  SearchBar,
  SearchBarButton,
  SectionHeader,
  SegmentedControl,
  Skeleton,
  StatusLine,
  Text,
  Toggle,
  TransitStops,
  WeatherChip,
  useToast,
} from '@/design/components';
import { makeStyles, ThemeOverride, useTheme } from '@/design/theme';

import { fixtureEvent, fixtureHours, fixturePlace, fixtureStops } from './fixtures';

// Developer tool, not product UI: headings are English-only on purpose and
// all content comes from obviously fake fixtures (CLAUDE.md rule 3).

type SchemeChoice = 'system' | ColorScheme;

export function GalleryScreen() {
  const [choice, setChoice] = useState<SchemeChoice>('system');
  return (
    <ThemeOverride scheme={choice === 'system' ? null : choice}>
      <GalleryBody choice={choice} onChoice={setChoice} />
    </ThemeOverride>
  );
}

function GalleryBody({
  choice,
  onChoice,
}: {
  choice: SchemeChoice;
  onChoice: (c: SchemeChoice) => void;
}) {
  const { t } = useTranslation();
  const styles = useStyles();
  const theme = useTheme();
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [chips, setChips] = useState<string[]>(['open']);
  const [segment, setSegment] = useState<'today' | 'weekend'>('today');
  const [toggle, setToggle] = useState(true);
  const [query, setQuery] = useState('');
  const noop = () => undefined;
  const toggleChip = (id: string) =>
    setChips((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SegmentedControl
        accessibilityLabel="Theme"
        value={choice}
        onChange={onChoice}
        options={[
          { value: 'system', label: 'System' },
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ]}
      />

      <Section title="Typography">
        {(Object.keys(theme.type) as TypeVariant[]).map((variant) => (
          <Text key={variant} variant={variant}>
            {variant} · Grüße aus München
          </Text>
        ))}
      </Section>

      <Section title="Colours">
        <View style={styles.wrap}>
          {(Object.keys(palette.dark) as ColorToken[]).map((token) => (
            <Swatch key={token} label={token} color={theme.colors[token]} />
          ))}
        </View>
        <View style={styles.wrap}>
          {CATEGORY_TOKENS.map((token) => (
            <Swatch key={token} label={token} color={theme.category(token)} />
          ))}
        </View>
      </Section>

      <Section title="Buttons" hug>
        <Button label="Primary" onPress={noop} />
        <Button label="With icon" icon={MapIcon} onPress={noop} variant="secondary" />
        <Button label="Ghost" onPress={noop} variant="ghost" />
        <Button label="Delete account" onPress={noop} variant="destructive" />
        <Button label="Loading" onPress={noop} loading />
        <Button label="Disabled" onPress={noop} disabled />
        <Button label="Large, full width" onPress={noop} size="lg" fullWidth />
        <View style={styles.row}>
          <IconButton icon={Share2} accessibilityLabel="Share" onPress={noop} />
          <IconButton
            icon={Settings}
            accessibilityLabel="Settings"
            onPress={noop}
            variant="filled"
          />
          <SaveButton saved={saved} onToggle={() => setSaved((s) => !s)} />
        </View>
      </Section>

      <Section title="Chips & controls">
        <View style={styles.wrap}>
          {['open', 'free', 'rainy', 'date'].map((id) => (
            <Chip
              key={id}
              label={`Filter ${id}`}
              selected={chips.includes(id)}
              onPress={() => toggleChip(id)}
            />
          ))}
        </View>
        <View style={styles.wrap}>
          {CATEGORY_TOKENS.slice(0, 5).map((token) => (
            <Chip key={token} label={t(`categories.${token}`)} category={token} onPress={noop} />
          ))}
        </View>
        <SegmentedControl
          accessibilityLabel="When"
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'today', label: 'Today' },
            { value: 'weekend', label: 'This weekend' },
          ]}
        />
        <Toggle
          label="Weekly digest"
          description="Fixture setting, does nothing"
          value={toggle}
          onValueChange={setToggle}
        />
        <SearchBar value={query} onChangeText={setQuery} />
        <SearchBarButton onPress={noop} />
      </Section>

      <Section title="Status">
        <StatusLine status="open" text="Open · closes 23:00" />
        <StatusLine status="closesSoon" text="Closes soon · 18:30" />
        <StatusLine status="closed" text="Closed · opens Tue 11:00" />
        <StatusLine status="unknown" text="Hours unknown · check website" />
        <View style={styles.row}>
          <WeatherChip temperatureC={12} condition="rain" onPress={noop} />
          <Avatar name="Test User" />
          <Avatar name="Test User" size="sm" />
        </View>
      </Section>

      <Section title="Places">
        <PlaceCard
          size="L"
          {...fixturePlace}
          saved={saved}
          onToggleSave={() => setSaved((s) => !s)}
          onPress={noop}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {CATEGORY_TOKENS.slice(0, 4).map((token, i) => (
            <PlaceCard
              key={token}
              {...fixturePlace}
              name={`Test Place ${i + 2}`}
              category={token}
              categoryLabel={t(`categories.${token}`)}
              onToggleSave={noop}
              onPress={noop}
            />
          ))}
        </ScrollView>
        <PlaceListItem
          {...fixturePlace}
          saved={saved}
          onToggleSave={() => setSaved((s) => !s)}
          onPress={noop}
        />
        <Divider />
        <PlaceListItem
          {...fixturePlace}
          name="Test Place 9"
          status={{ status: 'unknown', text: 'Hours unknown' }}
          onPress={noop}
        />
      </Section>

      <Section title="Events & collections">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          <EventCard {...fixtureEvent} onPress={noop} />
          <EventCard {...fixtureEvent} title="Test Event 2 (cancelled)" cancelled onPress={noop} />
          <CollectionCard
            title="Test collection"
            subtitle="Fixture"
            itemCount={12}
            category="outdoors"
            onPress={noop}
          />
          <CollectionCard
            title="Sponsored test collection"
            itemCount={1}
            category="food"
            sponsorName="Test Sponsor GmbH"
            onPress={noop}
          />
        </ScrollView>
        <EventCard {...fixtureEvent} layout="row" onToggleSave={noop} onPress={noop} />
      </Section>

      <Section title="Categories">
        <View style={styles.grid}>
          {CATEGORY_TOKENS.map((token) => (
            <View key={token} style={styles.gridCell}>
              <CategoryTile category={token} label={t(`categories.${token}`)} onPress={noop} />
            </View>
          ))}
        </View>
      </Section>

      <Section title="Place details">
        <SectionHeader
          title="Section header"
          subtitle="With subtitle and action"
          action={{ label: 'See all', onPress: noop }}
        />
        <HoursTable rows={fixtureHours} note="Fixture hours, not a real place" />
        <TransitStops stops={fixtureStops} />
        <AttributionFooter credits={['Fixture data, not real']} lastVerified="1 Jan 2026" />
      </Section>

      <Section title="Rows">
        <ListRow label="Language" value="Deutsch" icon={Info} onPress={noop} />
        <Divider inset />
        <ListRow label="Delete account" destructive onPress={noop} />
      </Section>

      <Section title="Loading">
        <Skeleton height={180} radius="md" />
        <Skeleton height={18} width="60%" />
        <Skeleton height={14} width="40%" />
      </Section>

      <Section title="Empty, error, offline">
        <OfflineBanner cachedAt="14:05" />
        <EmptyState
          icon={Inbox}
          title="Nothing saved yet"
          body="Fixture empty state with one action."
          action={{ label: 'Browse', onPress: noop }}
        />
        <ErrorState kind="offline" onRetry={noop} />
        <ErrorState kind="server" onRetry={noop} />
      </Section>

      <Section title="Overlays" hug>
        <Button
          label="Show toast"
          variant="secondary"
          onPress={() => toast.show('Saved to Test list')}
        />
        <Button
          label="Open sheet"
          variant="secondary"
          onPress={() => router.push('/gallery/sheet')}
        />
      </Section>
    </ScrollView>
  );
}

function Section({ title, hug, children }: { title: string; hug?: boolean; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={[styles.section, hug && styles.hug]}>
      <Text variant="title2" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Swatch({ label, color }: { label: string; color: string }) {
  const styles = useStyles();
  return (
    <View style={styles.swatch}>
      <View style={[styles.chip, { backgroundColor: color }]} />
      <Text variant="caption" color="textSecondary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { backgroundColor: t.colors.bg },
  content: { padding: t.space.md, gap: t.space.xxl, paddingBottom: t.space.giant },
  section: { gap: t.space.sm },
  // Buttons take their parent's alignment; start-aligned sections let them hug their labels.
  hug: { alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs },
  carousel: { gap: t.space.md, paddingRight: t.space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs },
  gridCell: { width: '48%' },
  swatch: { width: 76, gap: t.space.xxs },
  chip: {
    height: 40,
    borderRadius: t.radius.sm,
    borderWidth: t.hairline,
    borderColor: t.colors.border,
  },
}));
