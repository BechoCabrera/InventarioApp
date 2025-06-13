// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Reglas generales
      'max-len': 'off',
      'object-shorthand': 'off',
      'quote-props': 'off',
      'quotes': 'off',
      'semi': 'off',

      // TypeScript
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Angular
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/directive-class-suffix': 'off',
      '@angular-eslint/no-host-metadata-property': 'off',
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-output-on-prefix': 'off',
      '@angular-eslint/no-inputs-metadata-property': 'off',
      '@angular-eslint/no-outputs-metadata-property': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // Reglas visuales de templates
      '@angular-eslint/template/prefer-self-closing-tags': 'off',
      '@angular-eslint/template/attributes-order': 'off',
      '@angular-eslint/template/no-negated-async': 'off',
      '@angular-eslint/template/banana-in-box': 'off',
      '@angular-eslint/template/eqeqeq': 'off',
      '@angular-eslint/template/no-any': 'off',
      '@angular-eslint/template/cyclomatic-complexity': 'off',
    },
  }
);
