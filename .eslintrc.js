module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-unused-vars': 'off', // Turn off base rule as it conflicts with TypeScript rule
  },
  overrides: [
    {
      files: ['packages/frontend/**/*'],
      env: {
        browser: true,
        es2020: true,
        node: true,
      },
      extends: [
        'next/core-web-vitals',
        'prettier',
      ],
      globals: {
        React: 'readonly',
      },
    },
    {
      files: ['packages/backend/**/*'],
      env: {
        node: true,
        es2020: true,
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts'],
      env: {
        jest: true,
        node: true,
        es2020: true,
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  ],
}; 