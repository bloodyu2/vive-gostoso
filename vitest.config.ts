// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      // KAN-463: next/font so existe dentro do compilador do Next.
      'next/font/google': path.resolve(import.meta.dirname, './src/test/next-font-google.ts'),
    },
  },
})
