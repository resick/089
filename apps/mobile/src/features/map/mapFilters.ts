import type { I18nText } from '@089/core';
import {
  Beer,
  Coffee,
  Disc3,
  Flower2,
  Frame,
  Landmark,
  ShoppingBag,
  Ticket,
  Trees,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from 'lucide-react-native';

import type { CategoryGroup } from '@/features/categories/categories';

/**
 * Quick filters floating over the map, in order. Each is a taxonomy slug
 * (top-level or subcategory); labels come from the database.
 */
export const MAP_FILTERS: { slug: string; icon: LucideIcon }[] = [
  { slug: 'restaurants', icon: UtensilsCrossed },
  { slug: 'cafes', icon: Coffee },
  { slug: 'bars', icon: Wine },
  { slug: 'clubs', icon: Disc3 },
  { slug: 'beer-gardens', icon: Beer },
  { slug: 'tourism', icon: Landmark },
  { slug: 'museums', icon: Frame },
  { slug: 'entertainment', icon: Ticket },
  { slug: 'parks', icon: Trees },
  { slug: 'shopping', icon: ShoppingBag },
  { slug: 'wellness', icon: Flower2 },
];

export type MapFilter = { slug: string; icon: LucideIcon; name: I18nText };

/** The quick filters whose slug exists in the loaded taxonomy, with names. */
export function resolveMapFilters(groups: CategoryGroup[]): MapFilter[] {
  const names = new Map<string, I18nText>();
  for (const group of groups) {
    names.set(group.slug, group.name);
    for (const sub of group.subcategories) names.set(sub.slug, sub.name);
  }
  return MAP_FILTERS.flatMap((filter) => {
    const name = names.get(filter.slug);
    return name ? [{ ...filter, name }] : [];
  });
}
