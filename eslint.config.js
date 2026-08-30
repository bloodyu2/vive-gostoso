import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // 'dist' e herança do setup Vite original. '.next' e o output do build do
  // Next (inclusive .next/types/**, que sozinho gerava ~1400 erros de tipos
  // gerados) e public/sw.js + public/workbox-*.js sao o service worker
  // minificado que o next-pwa emite -- nenhum dos tres e codigo-fonte nosso.
  globalIgnores(['dist', '.next', 'public/sw.js', 'public/workbox-*.js']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      // reactRefresh.configs.vite removido: e a regra do preset do Vite
      // (react-refresh/only-export-components) aplicada a um projeto Next.js
      // App Router. Ela nao entende que page.tsx/layout.tsx legitimamente
      // exportam metadata/generateMetadata/viewport/generateStaticParams junto
      // com o componente -- isso e convencao do Next, nao problema de Fast
      // Refresh. Gerava 29 falsos positivos.
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
