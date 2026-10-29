// Prints generated Supabase types in a canonical form, so CI's type-drift
// check compares the schema, not the generator. Types generated from the
// hosted project (`pnpm db:types`) and from CI's local database differ in
// formatting, comments and the PostgREST version block.
//
// The local generator is also newer: it marks NOT NULL jsonb columns as
// `NonNullable<Json>` and adds `ComputedFields: never` per table. Both are
// folded away here; columns, types and nullability still have to match.
//
// Usage: node supabase/scripts/normalize-types.mjs <database.types.ts>
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

const file = process.argv[2];
const source = readFileSync(file, 'utf8')
  .replace(/__InternalSupabase:\s*\{[^}]*\}/, '')
  // Whole lines, newline included: Prettier keeps blank lines.
  .replace(/^[ \t]*\/\/.*\r?\n/gm, '')
  .replace(/NonNullable<Json>/g, 'Json')
  .replace(/^[ \t]*ComputedFields: never;?[ \t]*\r?\n/gm, '');

// Resolved from this script's location: the input may live outside the repo.
const config = (await resolveConfig(fileURLToPath(import.meta.url))) ?? {};
process.stdout.write(await format(source, { ...config, parser: 'typescript' }));
