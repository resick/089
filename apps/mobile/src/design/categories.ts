import type { CategoryColorToken } from '@089/tokens';
import {
  CalendarDays,
  Flower2,
  Gamepad2,
  Landmark,
  Martini,
  Palette,
  ShoppingBag,
  Trees,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Icon per top-level category. Every place that shows a category colour also
 * shows this icon, so colour is never the only signal (DESIGN_SYSTEM §1).
 * Labels live in the locale files under `categories.<token>`.
 */
export const categoryIcons: Record<CategoryColorToken, LucideIcon> = {
  food: UtensilsCrossed,
  nightlife: Martini,
  entertainment: Gamepad2,
  culture: Palette,
  tourism: Landmark,
  activities: Zap,
  outdoors: Trees,
  shopping: ShoppingBag,
  wellness: Flower2,
  events: CalendarDays,
};

export const CATEGORY_TOKENS = Object.keys(categoryIcons) as CategoryColorToken[];

export const isCategoryToken = (value: unknown): value is CategoryColorToken =>
  typeof value === 'string' && (CATEGORY_TOKENS as string[]).includes(value);
