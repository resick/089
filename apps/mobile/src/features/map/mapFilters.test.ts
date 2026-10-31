import type { CategoryGroup } from '@/features/categories/categories';

import { resolveMapFilters } from './mapFilters';

// Fixture taxonomy: a top-level category and one of its subcategories.
const groups: CategoryGroup[] = [
  {
    slug: 'food',
    name: { en: 'Test Food', de: 'Test Essen' },
    subcategories: [{ slug: 'cafes', name: { en: 'Test Cafés' } }],
  },
  { slug: 'tourism', name: { en: 'Test Sights' }, subcategories: [] },
];

describe('resolveMapFilters', () => {
  it('names filters from top-level and subcategories, in the map order', () => {
    expect(resolveMapFilters(groups).map((filter) => [filter.slug, filter.name.en])).toEqual([
      ['cafes', 'Test Cafés'],
      ['tourism', 'Test Sights'],
    ]);
  });

  it('leaves out filters the taxonomy does not have', () => {
    expect(resolveMapFilters([])).toEqual([]);
  });
});
