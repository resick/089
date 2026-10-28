import { palette } from '@089/tokens';
import { useColorScheme } from 'react-native';

// Minimal theme access for the scaffold. Slice 2 replaces this with the full
// token theme (typography, spacing, radius) on Unistyles — see ADR-005.
export function useColors() {
  return palette[useColorScheme() === 'light' ? 'light' : 'dark'];
}
