import { render, screen } from '@testing-library/react-native';

import i18n from '@/lib/i18n';

import { PlaceholderScreen } from './PlaceholderScreen';

describe('PlaceholderScreen', () => {
  it('renders the title as a header and the translated slice note', async () => {
    await i18n.changeLanguage('en');
    await render(<PlaceholderScreen title="Events" slice={10} />);

    expect(screen.getByRole('header', { name: 'Events' })).toBeOnTheScreen();
    expect(screen.getByText('Coming in roadmap slice 10.')).toBeOnTheScreen();
  });

  it('switches language', async () => {
    await i18n.changeLanguage('de');
    await render(<PlaceholderScreen title="Events" slice={10} />);

    expect(screen.getByText('Kommt in Abschnitt 10 der Roadmap.')).toBeOnTheScreen();
  });
});
