// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import pluginSecurity from 'eslint-plugin-security'

export default withNuxt({
  plugins: {
    security: pluginSecurity,
  },
  rules: {
    // Keep security hints in day-to-day lint; CI uses eslint.security.config.mjs
    ...pluginSecurity.configs.recommended.rules,
    'security/detect-object-injection': 'off',
  },
})
