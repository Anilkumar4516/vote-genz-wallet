/**
 * ESLint configuration tailored for Vote Wallet React & Next.js frontend apps
 * (apps/web, apps/admin)
 */
module.exports = {
  extends: [
    './index.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  env: {
    browser: true,
    es2022: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off', // Not needed for modern React 17+ / Next.js
    'react/prop-types': 'off', // Types are enforced via TypeScript
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
  },
};
