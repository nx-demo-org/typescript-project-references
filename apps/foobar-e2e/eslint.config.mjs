import cypress from 'eslint-plugin-cypress/flat';
import baseConfig from '../../eslint.config.mjs';

export default [
  cypress.configs['recommended'],
  ...baseConfig,
  {
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/support/commands.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },
];
