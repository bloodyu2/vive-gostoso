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
      // As Edge Functions importam por URL (Deno). Nos testes, trocadas por substitutos locais.
      'https://deno.land/std@0.168.0/http/server.ts': path.resolve(import.meta.dirname, './src/test/deno/std-http-server.ts'),
      'https://esm.sh/stripe@14.21.0?target=deno': path.resolve(import.meta.dirname, './src/test/deno/stripe.ts'),
      'https://esm.sh/@supabase/supabase-js@2': path.resolve(import.meta.dirname, './src/test/deno/supabase-js.ts'),
    },
  },
})
