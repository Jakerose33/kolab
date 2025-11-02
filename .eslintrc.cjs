/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'react-refresh',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react-refresh/recommended',
    'plugin:@typescript-eslint/stylistic',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: false,
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': ['warn', { fixToUnknown: true, ignoreRestArgs: true }],
    '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-ignore': 'allow-with-description' }],
    'react-refresh/only-export-components': 'warn',
    'no-useless-escape': 'warn',
  },
  overrides: [
    {
      files: ['**/supabase/functions/**/*.{ts,tsx}'],
      rules: { '@typescript-eslint/no-explicit-any': 'off' },
    },
    {
      files: [
        '**/*config.{js,ts,mjs,cjs}',
        'vite.config.*',
        'postcss.config.*',
        'tailwind.config.*',
      ],
      rules: { '@typescript-eslint/no-require-imports': 'off' },
    },
    {
      files: ['src/lib/**/*.{ts,tsx}'],
      rules: { 'react-hooks/rules-of-hooks': 'off' },
    },
  ],
};
