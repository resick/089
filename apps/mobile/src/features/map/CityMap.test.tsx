import { mapPalette } from '@089/tokens';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { CityMap } from './CityMap';
import { buildMapHtml, MAPLIBRE_GL_VERSION } from './mapHtml';

const mockNativeMapLoaded = jest.fn();

jest.mock('@/lib/runtime', () => ({ isExpoGo: true }));
// The app is dark-first; pin the scheme so the expected colours are fixed.
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => 'dark',
}));
jest.mock('./NativeCityMap', () => {
  mockNativeMapLoaded();
  return { __esModule: true, default: () => null };
});
jest.mock('react-native-webview', () => {
  const { View } = jest.requireActual('react-native');
  return {
    WebView: (props: { accessibilityLabel?: string; source: { html: string } }) => (
      <View
        testID="web-map"
        accessibilityLabel={props.accessibilityLabel}
        accessibilityHint={props.source.html}
      />
    ),
  };
});

const fixtureStyle = {
  version: 8,
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#123456' } }],
};

const fetchMock = jest.fn();
const realFetch = globalThis.fetch;
beforeAll(() => {
  globalThis.fetch = fetchMock;
});
afterAll(() => {
  globalThis.fetch = realFetch;
});

async function renderMap() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await render(
    <QueryClientProvider client={client}>
      <CityMap />
    </QueryClientProvider>,
  );
  // The hook retries a failed style once (about a second) before falling back.
  return screen.findByTestId('web-map', {}, { timeout: 4000 });
}

describe('CityMap in Expo Go', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => fixtureStyle });
  });

  it('shows the WebView map with our restyled basemap', async () => {
    await i18n.changeLanguage('en');
    const map = await renderMap();

    expect(map).toHaveProp('accessibilityLabel', 'Map of Munich');
    expect(map.props.accessibilityHint).toContain(mapPalette.dark.land);
    expect(map.props.accessibilityHint).not.toContain('#123456');
  });

  it('falls back to the stock style URL when the style cannot be fetched', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    const map = await renderMap();

    expect(map.props.accessibilityHint).toContain('tiles.example.test/dark');
  });

  it('never loads the MapLibre native module', async () => {
    await renderMap();

    expect(mockNativeMapLoaded).not.toHaveBeenCalled();
  });
});

describe('buildMapHtml', () => {
  const html = buildMapHtml({
    style: 'https://tiles.example.test/style.json',
    center: [11.5755, 48.1374],
    zoom: 12.5,
    background: '#0B0B0C',
  });

  it('pins the MapLibre GL version', () => {
    expect(html).toContain(`maplibre-gl@${MAPLIBRE_GL_VERSION}/dist/maplibre-gl.js`);
  });

  it('keeps the attribution control (OSM requires a visible credit)', () => {
    expect(html).toContain('attributionControl: { compact: true }');
  });

  it('cannot break out of the script tag through the style URL', () => {
    const hostile = buildMapHtml({
      style: 'https://x.test/</script><script>alert(1)</script>',
      center: [0, 0],
      zoom: 1,
      background: '#000000',
    });
    expect(hostile).not.toContain('</script><script>alert(1)');
  });
});
