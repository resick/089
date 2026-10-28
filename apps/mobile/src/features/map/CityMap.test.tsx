import { render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { CityMap } from './CityMap';
import { buildMapHtml, MAPLIBRE_GL_VERSION } from './mapHtml';

const mockNativeMapLoaded = jest.fn();

jest.mock('@/lib/runtime', () => ({ isExpoGo: true }));
jest.mock('./NativeCityMap', () => {
  mockNativeMapLoaded();
  return { __esModule: true, default: () => null };
});
jest.mock('react-native-webview', () => {
  const { View } = jest.requireActual('react-native');
  return {
    WebView: (props: { accessibilityLabel?: string; source: { html: string } }) => (
      <View testID="web-map" accessibilityLabel={props.accessibilityLabel} />
    ),
  };
});

describe('CityMap in Expo Go', () => {
  it('shows the WebView map', async () => {
    await i18n.changeLanguage('en');
    await render(<CityMap />);

    expect(screen.getByTestId('web-map')).toHaveProp('accessibilityLabel', 'Map of Munich');
  });

  it('never loads the MapLibre native module', async () => {
    await render(<CityMap />);

    expect(mockNativeMapLoaded).not.toHaveBeenCalled();
  });
});

describe('buildMapHtml', () => {
  const html = buildMapHtml({
    styleUrl: 'https://tiles.example.test/style.json',
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
      styleUrl: 'https://x.test/</script><script>alert(1)</script>',
      center: [0, 0],
      zoom: 1,
      background: '#000000',
    });
    expect(hostile).not.toContain('</script><script>alert(1)');
  });
});
