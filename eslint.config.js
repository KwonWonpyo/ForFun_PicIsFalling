import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import sveltePlugin from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  ...sveltePlugin.configs['flat/recommended'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tsparser,
      },
    },
    rules: {
      'svelte/no-dom-manipulating': 'off',
    },
  },
  prettier,
  ...sveltePlugin.configs['flat/prettier'],
  {
    ignores: ['dist/', 'node_modules/', 'legacy/'],
  },
]
