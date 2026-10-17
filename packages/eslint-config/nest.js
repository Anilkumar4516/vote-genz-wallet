/**
 * ESLint configuration tailored for Vote Wallet NestJS microservices
 * (auth-service, voting-service, admin-service)
 */
module.exports = {
  extends: ['./index.js'],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    // Permit NestJS parameter property injection in constructors
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',

    // Relax any in DTOs and decorators where NestJS metadata relies on dynamic types
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',

    // Enforce clean naming conventions for NestJS controllers and services
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'class',
        format: ['PascalCase'],
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
      },
    ],
  },
};
