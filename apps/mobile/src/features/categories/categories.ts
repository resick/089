import { i18nTextSchema, type I18nText } from '@089/core';
import type { CategoryColorToken } from '@089/tokens';
import { z } from 'zod';

import { isCategoryToken } from '@/design/categories';
import { supabaseGet } from '@/lib/supabaseRest';

// The taxonomy is our own data in the `categories` table (spec 3.1). Top-level
// slugs double as design tokens, which give each one its icon and colour.

const rowSchema = z.object({
  id: z.string(),
  parent_id: z.string().nullable(),
  slug: z.string(),
  name: i18nTextSchema,
  sort: z.number(),
});

export type Subcategory = { slug: string; name: I18nText };

export type CategoryGroup = {
  slug: CategoryColorToken;
  name: I18nText;
  subcategories: Subcategory[];
};

/**
 * Validates the rows and nests subcategories under their top-level category.
 * Top-level categories the app has no icon/colour for yet are left out rather
 * than drawn wrong; so are subcategories whose parent is left out.
 */
export function buildCategoryGroups(body: unknown): CategoryGroup[] {
  const rows = [...z.array(rowSchema).parse(body)].sort((a, b) => a.sort - b.sort);
  const groups = new Map<string, CategoryGroup>();
  for (const row of rows) {
    if (row.parent_id === null && isCategoryToken(row.slug)) {
      groups.set(row.id, { slug: row.slug, name: row.name, subcategories: [] });
    }
  }
  for (const row of rows) {
    if (row.parent_id === null) continue;
    groups.get(row.parent_id)?.subcategories.push({ slug: row.slug, name: row.name });
  }
  return [...groups.values()];
}

export async function fetchCategoryGroups(signal?: AbortSignal): Promise<CategoryGroup[]> {
  // RLS only returns active categories.
  const body = await supabaseGet(
    'categories',
    { select: 'id,parent_id,slug,name,sort', order: 'sort.asc' },
    signal,
  );
  return buildCategoryGroups(body);
}
