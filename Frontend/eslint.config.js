import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      // eslint-plugin-react-hooks v5's "recommended" config uses the legacy
      // string-shorthand "plugins" array, which this ESLint version rejects.
      // Expand it manually into the flat object form instead.
      {
        plugins: { 'react-hooks': reactHooks },
        rules: reactHooks.configs.recommended.rules,
      },
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
