import { palette } from '@089/tokens';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { fixturePlace } from '@/features/gallery/fixtures';
import { GalleryScreen } from '@/features/gallery/GalleryScreen';
import i18n from '@/lib/i18n';

import { ThemeOverride } from '../theme';
import {
  Button,
  Chip,
  CollectionCard,
  ErrorState,
  PlaceCard,
  SearchBar,
  StatusLine,
  Text,
  ToastProvider,
  useToast,
} from './index';

const safeArea = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={safeArea}>
      <ToastProvider>{children}</ToastProvider>
    </SafeAreaProvider>
  );
}

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

describe('Button', () => {
  it('calls onPress', async () => {
    const onPress = jest.fn();
    await render(<Button label="Go" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Go' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is busy and disabled while loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Go" onPress={onPress} loading />);
    const button = screen.getByRole('button', { name: 'Go' });
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Chip', () => {
  it('exposes its selected state to screen readers', async () => {
    await render(<Chip label="Free" selected onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Free' })).toBeSelected();
  });
});

describe('PlaceCard', () => {
  it('reads as one sentence, with save as its own button beside it', async () => {
    const onPress = jest.fn();
    const onToggleSave = jest.fn();
    await render(<PlaceCard {...fixturePlace} onPress={onPress} onToggleSave={onToggleSave} />);

    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Test Place 1, Food & Drinks · Testburg Mitte · €€, Open · closes 23:00, 850 m',
      }),
    );
    expect(onPress).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onToggleSave).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('SearchBar', () => {
  it('shows a clear button only when there is text', async () => {
    const onChangeText = jest.fn();
    const { rerender } = await render(<SearchBar value="" onChangeText={onChangeText} />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();

    await rerender(<SearchBar value="biergarten" onChangeText={onChangeText} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChangeText).toHaveBeenCalledWith('');
  });
});

describe('StatusLine', () => {
  it('reads the status as one phrase', async () => {
    await render(<StatusLine status="open" text="Open · closes 23:00" />);
    expect(screen.getByLabelText('Open, closes 23:00')).toBeOnTheScreen();
  });
});

describe('CollectionCard', () => {
  it('labels sponsored collections in both languages', async () => {
    await render(
      <CollectionCard
        title="T"
        itemCount={2}
        category="food"
        sponsorName="Test Sponsor"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText('Sponsored · Test Sponsor')).toBeOnTheScreen();

    await act(() => i18n.changeLanguage('de'));
    expect(screen.getByText('Anzeige · Test Sponsor')).toBeOnTheScreen();
  });
});

describe('ErrorState', () => {
  it('distinguishes offline from server errors and retries', async () => {
    const onRetry = jest.fn();
    await render(<ErrorState kind="offline" onRetry={onRetry} />);
    expect(screen.getByRole('header', { name: 'No connection' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('Toast', () => {
  it('shows a message', async () => {
    function Trigger() {
      const toast = useToast();
      return <Button label="Save" onPress={() => toast.show('Saved to Test list')} />;
    }
    await render(
      <Providers>
        <Trigger />
      </Providers>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved to Test list')).toBeOnTheScreen();
  });
});

describe('ThemeOverride', () => {
  it('switches token colours for its subtree', async () => {
    await render(
      <>
        <ThemeOverride scheme="light">
          <Text>light</Text>
        </ThemeOverride>
        <ThemeOverride scheme="dark">
          <Text>dark</Text>
        </ThemeOverride>
      </>,
    );
    expect(screen.getByText('light')).toHaveStyle({ color: palette.light.text });
    expect(screen.getByText('dark')).toHaveStyle({ color: palette.dark.text });
  });
});

describe('GalleryScreen', () => {
  it('renders every section without crashing', async () => {
    await render(
      <Providers>
        <GalleryScreen />
      </Providers>,
    );
    for (const section of [
      'Typography',
      'Buttons',
      'Places',
      'Empty, error, offline',
      'Overlays',
    ]) {
      expect(screen.getByRole('header', { name: section })).toBeOnTheScreen();
    }
  });
});
