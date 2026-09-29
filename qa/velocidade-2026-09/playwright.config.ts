import { defineConfig } from '@playwright/test'

// Fumaca do KAN-463. Roda contra qualquer URL: BASE_URL=https://www.vivegostoso.com.br
// ou BASE_URL=http://localhost:3000. Nada e gravado: todo POST, PATCH, PUT e DELETE
// para o Supabase e para as funcoes de pagamento e interceptado em fumaca.spec.ts.
export default defineConfig({
  testDir: '.',
  testMatch: 'fumaca.spec.ts',
  outputDir: process.env.FUMACA_SAIDA || '../../test-results/fumaca',
  timeout: 90_000,
  retries: 1,
  workers: 3,
  reporter: [['list'], ['json', { outputFile: process.env.FUMACA_JSON || 'resultado-fumaca.json' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.vivegostoso.com.br',
    serviceWorkers: 'block',
    locale: 'pt-BR',
    timezoneId: 'America/Fortaleza',
    trace: 'off',
  },
})
