// Shared ESLint rules for every TypeScript workspace. Apps compose this with
// their framework config (eslint-config-expo, eslint-config-next).
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/** Rules we enforce on top of the framework presets. */
export const projectRules = {
  files: ['**/*.{ts,tsx}'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
};

/** Full config for plain TypeScript packages (no framework preset). */
export const libraryConfig = tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  projectRules,
  prettier,
);

export { prettier };
