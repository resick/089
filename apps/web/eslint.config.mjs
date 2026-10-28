import { projectRules, prettier } from '@089/config/eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  projectRules,
  prettier,
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts']),
]);
