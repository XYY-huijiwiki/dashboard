import js from '@eslint/js'
// import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfig from '@electron-toolkit/eslint-config'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettierConfig from '@vue/eslint-config-prettier'

export default defineConfigWithVueTs([
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  eslintConfig,
  // tseslint.configs.recommended,
  vueTsConfigs.recommended,
  prettierConfig,
  {
    ignores: ['node_modules', 'dist', 'out', '.gitignore']
  }
])
