// Security-only ESLint flat config (SCA/SAST pipeline).
// Ignores style/type debt so CI fails only on security plugin findings.
import pluginSecurity from 'eslint-plugin-security'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

const securityRules = {
  ...pluginSecurity.configs.recommended.rules,
  // Too noisy for Vue/Nuxt dynamic property access patterns
  'security/detect-object-injection': 'off',
}

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '**/*.min.js',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: { security: pluginSecurity },
    rules: securityRules,
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: { security: pluginSecurity },
    rules: securityRules,
  },
]
