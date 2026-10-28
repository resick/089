import { render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { CityMap } from './CityMap';

const mockNativeMapLoaded = jest.fn();

jest.mock('@/lib/runtime', () => ({ isExpoGo: true }));
jest.mock('./NativeCityMap', () => {
  mockNativeMapLoaded();
  return { __esModule: true, default: () => null };
});

describe('CityMap in Expo Go', () => {
  it('explains that the map needs the full app', async () => {
    await i18n.changeLanguage('en');
    await render(<CityMap />);

    expect(
      screen.getByText("The map needs the full app build and isn't available in Expo Go."),
    ).toBeOnTheScreen();
  });

  it('never loads the MapLibre module', async () => {
    await render(<CityMap />);

    expect(mockNativeMapLoaded).not.toHaveBeenCalled();
  });
});
