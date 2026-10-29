// Runs the pgTAP tests against the linked hosted project, for machines without
// Docker (`supabase test db` needs it). CI still runs `supabase test db` on a
// fresh Docker database; this is the local check.
//
// Each test file becomes one DO block sent through `supabase db query`. The
// block collects the TAP output and ends by raising it as an error, so all of
// the test's writes are rolled back. Only failures and diagnostics are
// returned, because the API truncates long error messages.
//
// Test files must end every statement with `;` at the end of a line.
//
// Usage (repo root): node supabase/scripts/test-linked.mjs [file…]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const testDir = 'supabase/tests/database';
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(testDir)
      .filter((name) => name.endsWith('.test.sql'))
      .sort()
      .map((name) => join(testDir, name));

function toDoBlock(source) {
  const statements = [];
  let current = [];
  for (const line of source.split(/\r?\n/)) {
    if (!current.length && (line.trim() === '' || line.trim().startsWith('--'))) continue;
    current.push(line);
    if (/;\s*$/.test(line)) {
      statements.push(current.join('\n').trim().replace(/;$/, ''));
      current = [];
    }
  }
  const body = statements
    .filter((statement) => !/^(begin|rollback)$/i.test(statement))
    .map((statement) => {
      if (/^select \* from finish\(\)$/i.test(statement))
        return `_out := concat_ws(E'\\n', _out, (select string_agg(f, E'\\n') from finish() f));`;
      if (/^select /i.test(statement)) return `_out := concat_ws(E'\\n', _out, (${statement}));`;
      return `${statement};`;
    })
    .join('\n');
  return [
    'do $tap$',
    'declare _out text;',
    'begin',
    body,
    "raise exception 'TAP-RESULT passed=% %',",
    "  (select count(*) from regexp_split_to_table(_out, E'\\n') l where l ~ '^ok '),",
    "  coalesce((select string_agg(l, ' | ') from regexp_split_to_table(_out, E'\\n') l where l !~ '^(ok |1\\.\\.|[{])'), 'no failures');",
    'end',
    '$tap$;',
  ].join('\n');
}

const workDir = mkdtempSync(join(tmpdir(), '089-pgtap-'));
let failed = false;

for (const file of files) {
  const planned = Number(readFileSync(file, 'utf8').match(/select plan\((\d+)\)/)?.[1] ?? NaN);
  const sqlFile = join(workDir, 'run.sql');
  writeFileSync(sqlFile, toDoBlock(readFileSync(file, 'utf8')));
  let output = '';
  try {
    output = execFileSync('npx', ['supabase', 'db', 'query', '--linked', '-f', sqlFile], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });
  } catch (error) {
    output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
  const match = output.match(/TAP-RESULT passed=(\d+) (.*?)(?:\\\\n|\\n|")/);
  if (!match) {
    failed = true;
    console.error(`✗ ${file}: test did not complete\n${output.slice(0, 1500)}`);
    continue;
  }
  const passed = Number(match[1]);
  const ok = passed === planned && match[2] === 'no failures';
  failed ||= !ok;
  console.log(
    `${ok ? '✓' : '✗'} ${file}: ${passed}/${planned} passed${ok ? '' : `\n  ${match[2]}`}`,
  );
}

process.exit(failed ? 1 : 0);
