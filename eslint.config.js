// ESLint 9 (Flat Config) — Vite + React + TypeScript + a11y + Hooks + Prettier
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Ignore build + vendor
  {
    ignores: ['dist/**', 'node_modules/**', 'supabase/generated/**'],
  },

  // Browser app code (React + TS)
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      // ✅ Proper browser globals (window, document, etc.)
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Baseline JS recommendations
      ...js.configs.recommended.rules,

      // React + a11y + hooks (merge just the rules from legacy configs)
      ...(reactPlugin.configs?.recommended?.rules ?? {}),
      ...(jsxA11y.configs?.recommended?.rules ?? {}),
      ...(reactHooks.configs?.recommended?.rules ?? {}),

      // Project prefs
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'warn',
      'no-console': 'warn',

      // TS: soften for now so you can get green
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Node-side code (scripts, config files, Supabase functions, etc.)
  {
    files: [
      '*.cjs',
      '*.mjs',
      '*.js',
      'vite.config.*',
      'postcss.config.*',
      'tailwind.config.*',
      'supabase/**/*.{ts,js}',
      'scripts/**/*.{ts,js}',
    ],
    ignores: ['supabase/generated/**'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      // ✅ Proper node globals (process, __dirname, etc.)
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Prettier keeps formatting conflicts out of ESLint
  prettier,
];

