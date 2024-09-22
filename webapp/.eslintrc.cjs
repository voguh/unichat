module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'import',
    'vitest',
    '@typescript-eslint',
    'react',
    'react-hooks',
    'prettier',
    'eslint-plugin-import-helpers'
  ],
  rules: {
    'prettier/prettier': 'warn',

    /* ============================== REACT ============================== */
    // /* React hooks config */
    // 'react-hooks/rules-of-hooks': 'error',
    // 'react-hooks/exhaustive-deps': 'warn',

    // /* Enable tags and exoressuibs in same line on JSX */
    // 'react/jsx-one-expression-per-line': 'off',

    // /* Enable '...props' */
    // 'react/jsx-props-no-spreading': 'off',

    /* Disable need to specify protypes */
    'react/prop-types': 'off',

    // /* Enable jsx syntax in tsx */
    // 'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
    /* ============================ END REACT ============================ */

    /* ============================ TYPESCRIPT ============================ */
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],

    /* Enable any type */
    '@typescript-eslint/no-explicit-any': 'off',

    /* Enable empty functions */
    '@typescript-eslint/no-empty-function': 'off',

    /* Enable require */
    '@typescript-eslint/no-var-requires': 'off',

    // '@typescript-eslint/explicit-module-boundary-types': 'off',
    /* ========================== END TYPESCRIPT ========================== */

    /* ============================== IMPORT ============================== */
    'import/newline-after-import': 'warn',

    /* Enable devDependencies import */
    // 'import/no-extraneous-dependencies': 'off',

    /* Disable force default export */
    // 'import/prefer-default-export': 'off',

    /* Disable need of extension */
    // 'import/extensions': 'off',
    // 'import/no-unresolved': 'off',

    /* Enable and add import order helpers */
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'always',
        groups: [['/^react/', '/^node:/'], 'module', '/^~//', ['parent', 'sibling', 'index']],
        alphabetize: { order: 'asc', ignoreCase: true }
      }
    ],
    /* ============================ END IMPORT ============================ */

    /* ============================== COMMON ============================== */
    'prefer-const': 'warn',

    'newline-before-return': 'warn',

    'array-callback-return': 'off',

    /* Enable use of globals */
    // 'no-restricted-globals': 'off',

    /* Disable force compact arrow functions */
    // 'arrow-body-style': 'off',

    /* Enable nameless functions */
    // 'func-names': 'off',

    /* Enable plus plus */
    // 'no-plusplus': 'off',

    /* Disable object new life forced */
    // 'object-curly-newline': 'off',

    /* Disable error on class methods without this */
    // 'class-methods-use-this': 'off',

    /* Fix unused vars */
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
    ],

    /* Fix use before define */
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',

    /* Enable empty constructors */
    'no-useless-constructor': 'off'

    /* Remove need for empty line in classes */
    // 'lines-between-class-members': 'off',
    /* ============================ END COMMON ============================ */
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
