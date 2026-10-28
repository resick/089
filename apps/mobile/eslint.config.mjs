import { createRequire } from 'node:module';

import { projectRules, prettier } from '@089/config/eslint';
import { defineConfig } from 'eslint/config';

const require = createRequire(import.meta.url);
const expoConfig = require('eslint-config-expo/flat');

export default defineConfig([
  { ignores: ['dist/**', '.expo/**'] },
  expoConfig,
  projectRules,
  prettier,
]);
