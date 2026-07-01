import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default [
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  ...await createConfigForNuxt(),
]
