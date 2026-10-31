import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { MapScreen } from './MapScreen';

jest.mock('./CityMap', () => ({ CityMap: () => null }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Fixture taxonomy rows as PostgREST returns them.
const rows = [
  { id: 'c1', parent_id: null, slug: 'food', name: { en: 'Test Food' }, sort: 1 },
  { id: 'c2', parent_id: 'c1', slug: 'cafes', name: { en: 'Test Cafés' }, sort: 2 },
  { id: 'c3', parent_id: 'c1', slug: 'not-a-map-filter', name: { en: 'Test Other' }, sort: 3 },
];

const fetchMock = jest.fn();
const realFetch = globalThis.fetch;
beforeAll(async () => {
  globalThis.fetch = fetchMock;
  await i18n.changeLanguage('en');
});
afterAll(() => {
  globalThis.fetch = realFetch;
});

async function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await render(
    <QueryClientProvider client={client}>
      <MapScreen />
    </QueryClientProvider>,
  );
}

describe('MapScreen', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => rows });
  });

  it('shows quick filters from the taxonomy and an honest empty map', async () => {
    await renderScreen();

    expect(await screen.findByLabelText('Test Cafés')).toBeTruthy();
    expect(screen.queryByLabelText('Test Other')).toBeNull();
    expect(screen.getByText('No places on the map yet')).toBeTruthy();
  });

  it('selects a filter and names it in the empty state, then clears it', async () => {
    await renderScreen();
    const chip = await screen.findByLabelText('Test Cafés');

    await fireEvent.press(chip);
    expect(screen.getByText('No Test Cafés on the map yet')).toBeTruthy();
    expect(chip).toBeSelected();

    await fireEvent.press(chip);
    expect(screen.getByText('No places on the map yet')).toBeTruthy();
  });

  it('offers a retry when the categories cannot be loaded', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    await renderScreen();

    // The hook retries once before reporting the error.
    expect(
      await screen.findByLabelText("Couldn't load categories. Try again", {}, { timeout: 4000 }),
    ).toBeTruthy();
  });
});
