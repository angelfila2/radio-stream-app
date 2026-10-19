const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expo,
  {
    files: ['tests/**/*.cjs'],
    languageOptions: { globals: { __dirname: 'readonly' } },
  },
  { ignores: ['android/**', 'ios/**', '.expo/**', 'node_modules/**'] },
]);
