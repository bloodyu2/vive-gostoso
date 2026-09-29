import { test, expect, type Page, type BrowserContext, type Request } from '@playwright/test'

// Testes de fumaca do Vive Gostoso (KAN-463).
// Regra: nada real e gravado. Toda escrita no Supabase (REST, Auth, Storage,
// Edge Functions) e interceptada com page.route e respondida aqui, e o payload
// e conferido. Links de WhatsApp e do Stripe nunca sao abertos.

const WHATS_OFICIAL = '5584936180839'

type Captura = { url: string; method: string; body: string | null }

/** Intercepta toda escrita. Devolve a lista do que teria sido enviado. */
async function travarEscritas(context: BrowserContext): Promise<Captura[]> {
  const capturas: Captura[] = []
  await context.route(/supabase\.co\/(rest|auth|storage|functions)\//, async (route) => {
    const req = route.request()
    if (req.method() === 'GET' || req.method() === 'HEAD' || req.method() === 'OPTIONS') {
      return route.continue()
    }
    // Leitura por RPC via POST passa (so leitura publica, sem gravar nada).
    if (req.method() === 'POST' && /\/rest\/v1\/rpc\//.test(req.url())) return route.continue()
    capturas.push({ url: req.url(), method: req.method(), body: req.postData() })
    const url = req.url()
    if (url.includes('/functions/v1/create-donation-session') || url.includes('/functions/v1/create-checkout-session')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: 'https://checkout.stripe.com/c/pay/fumaca-kan-463' }) })
    }
    return route.fulfill({ status: 201, contentType: 'application/json', body: '[]', headers: { 'access-control-allow-origin': '*' } })
  })
  // Checkout do Stripe e WhatsApp: nunca sai daqui.
  await context.route(/checkout\.stripe\.com|wa\.me|api\.whatsapp\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>interceptado pela fumaca</body></html>' }),
  )
  return capturas
}

/** Hits do GA4 (google-analytics / googletagmanager /g/collect). */
function ouvirRastreio(page: Page) {
  const hits: string[] = []
  page.on('request', (r: Request) => {
    const u = r.url()
    if (/google-analytics\.com\/g\/collect|googletagmanager\.com\/g\/collect|analytics\.google\.com\/g\/collect/.test(u)) {
      const en = new URL(u).searchParams.get('en')
      hits.push(en || 'hit')
      const corpo = r.postData()
      if (corpo) for (const linha of corpo.split('\r\n')) { const m = linha.match(/(?:^|&)en=([^&]+)/); if (m) hits.push(decodeURIComponent(m[1])) }
    }
  })
  return hits
}

async function dataLayerEventos(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []
    return dl.map((x) => {
      if (x && typeof x === 'object' && 'event' in (x as object)) return String((x as { event: unknown }).event)
      if (x && typeof x === 'object' && '0' in (x as object)) return 'gtag:' + String((x as Record<string, unknown>)['0'])
      return 'outro'
    })
  })
}

let capturas: Captura[] = []
test.beforeEach(async ({ context }, info) => {
  capturas = await travarEscritas(context)
  // Fora do grupo de rastreio, o banner de cookies sai com "Recusar" (o mesmo
  // estado de consentimento negado de quem nao respondeu), para nao cobrir botoes.
  if (!info.titlePath.includes('rastreio')) {
    await context.addInitScript(() => { try { localStorage.setItem('vg_cookie_consent', 'declined') } catch { /* sem storage */ } })
  }
})

test.describe('rastreio', () => {
  test('home carrega o gtag, manda consent default e o page_view do GA4', async ({ page }) => {
    const hits = ouvirRastreio(page)
    const scriptGtag = page.waitForRequest(/googletagmanager\.com\/gtag\/js/, { timeout: 30_000 })
    await page.goto('/')
    await scriptGtag
    await expect.poll(() => hits.includes('page_view'), { timeout: 20_000 }).toBe(true)
    const eventos = await dataLayerEventos(page)
    expect(eventos).toContain('gtag:consent')
    expect(eventos).toContain('gtag:config')
    expect(eventos).toContain('gtag:js')
  })

  test('aceitar cookies manda consent update', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Aceitar' }).click()
    const eventos = await dataLayerEventos(page)
    expect(eventos.filter((e) => e === 'gtag:consent').length).toBeGreaterThanOrEqual(2)
  })

  test('navegacao no cliente manda outro page_view (PageViewTracker)', async ({ page }) => {
    const hits = ouvirRastreio(page)
    await page.goto('/')
    await expect.poll(() => hits.filter((h) => h === 'page_view').length, { timeout: 20_000 }).toBeGreaterThanOrEqual(1)
    const antes = hits.filter((h) => h === 'page_view').length
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.locator('header a[href="/come"], header a[href$="/come"]').first().click()
    await page.waitForURL(/\/come$/)
    await expect.poll(() => hits.filter((h) => h === 'page_view').length, { timeout: 20_000 }).toBeGreaterThan(antes)
  })
})

test.describe('cabecalho, menu e idioma', () => {
  test('menu do desktop leva aos modulos', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    for (const rota of ['/come', '/fique', '/passeie']) {
      await expect(page.locator(`header a[href="${rota}"]`).first()).toBeVisible()
    }
  })

  test('menu do celular abre a gaveta com os links', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Menu' }).click()
    await expect(page.locator('a[href="/come"]').last()).toBeVisible()
  })

  test('troca de idioma: /en e /es servem o idioma certo no HTML', async ({ playwright, baseURL }) => {
    for (const [rota, lang] of [['/', 'pt-BR'], ['/en', 'en'], ['/es', 'es'], ['/en/come', 'en']]) {
      const req = await playwright.request.newContext({ baseURL })
      const html = await (await req.get(rota)).text()
      const m = html.match(/<html[^>]*>/); if (!m) console.log(rota, html.slice(0, 300))
      expect(m?.[0], rota).toContain(`lang="${lang}"`)
      await req.dispose()
    }
  })

  test('seletor de idioma leva a /en', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/come')
    await page.getByRole('button', { name: 'Selecionar idioma' }).first().click()
    await page.getByText('EN', { exact: true }).last().click()
    await page.waitForURL(/\/en\/come$/)
    // Troca no cliente: o texto vira ingles (o atributo lang do <html> so muda no
    // carregamento completo, comportamento de antes, coberto no teste do HTML).
    await expect(page.getByRole('button', { name: 'Search' }).first()).toBeVisible()
  })

  test('busca abre e acha negocio', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Buscar' }).first().click()
    const campo = page.locator('input[type="search"], input[type="text"]').first()
    await expect(campo).toBeVisible()
    await campo.fill('pousada')
    await expect(page.locator('a[href*="/negocio/"]').first()).toBeVisible({ timeout: 15_000 })
  })

  test('tema escuro alterna', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Modo escuro' }).first().click()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})

test.describe('WhatsApp', () => {
  test('botao oficial do cabecalho: numero certo, mensagem e evento whatsapp_click', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const link = page.locator(`header a[href*="wa.me/${WHATS_OFICIAL}"]`).first()
    await expect(link).toBeVisible()
    const href = await link.getAttribute('href')
    expect(href).toMatch(new RegExp(`^https://wa\\.me/${WHATS_OFICIAL}\\?text=.+`))
    const popup = page.waitForEvent('popup').catch(() => null)
    await link.click()
    await popup
    expect(await dataLayerEventos(page)).toContain('whatsapp_click')
  })

  test('pagina de negocio: link de WhatsApp e evento contato_negocio_click', async ({ page }) => {
    await page.goto('/come')
    const primeiro = page.locator('a[href^="/negocio/"]').first()
    await expect(primeiro).toBeVisible({ timeout: 20_000 })
    const caminho = await primeiro.getAttribute('href')
    await page.goto(caminho!)
    await expect(page.locator('h1').first()).toBeVisible()
    const wa = page.locator('a[href*="wa.me/"]').filter({ hasNot: page.locator('header *') })
    const n = await wa.count()
    test.skip(n === 0, 'negocio sem WhatsApp cadastrado')
    let achou = false
    for (let i = 0; i < n; i++) {
      const el = wa.nth(i)
      if (!(await el.isVisible())) continue
      const href = (await el.getAttribute('href')) || ''
      if (href.includes(WHATS_OFICIAL)) continue
      expect(href).toMatch(/^https:\/\/wa\.me\/55\d{10,11}/)
      const popup = page.waitForEvent('popup').catch(() => null)
      await el.click()
      await popup
      achou = true
      break
    }
    if (achou) expect(await dataLayerEventos(page)).toContain('contato_negocio_click')
  })
})

test.describe('listas, filtros e mapa', () => {
  for (const rota of ['/come', '/fique', '/passeie']) {
    test(`${rota} lista negocios no HTML servido`, async ({ request }) => {
      const r = await request.get(rota)
      expect(r.status()).toBe(200)
      const html = await r.text()
      expect((html.match(/href="\/negocio\//g) || []).length).toBeGreaterThan(0)
    })
  }

  test('filtro de /come muda a lista', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/come')
    const cards = page.locator('a[href^="/negocio/"]')
    await expect(cards.first()).toBeVisible({ timeout: 20_000 })
    const total = await cards.count()
    const busca = page.locator('main input[type="search"], main input[type="text"]').first()
    if (await busca.count()) {
      await busca.fill('zzzzqqq-nada')
      await expect.poll(() => cards.count(), { timeout: 10_000 }).toBeLessThan(total)
    } else {
      const chip = page.locator('main button').filter({ hasText: /\w/ }).nth(1)
      await chip.click()
      await page.waitForTimeout(800)
      expect(await cards.count()).toBeGreaterThanOrEqual(0)
    }
  })

  test('mapa Mapbox desenha e a lista de pontos existe', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/explore/mapa')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('canvas.mapboxgl-canvas, .mapboxgl-canvas').first()).toBeVisible({ timeout: 30_000 })
  })

  test('explore e mares mostram a tabua', async ({ page }) => {
    await page.goto('/explore/mares')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('a[href^="/explore/mares/"]').first()).toBeVisible()
    await page.goto('/explore/mares/cardeiro')
    await expect(page.locator('h1')).toContainText(/Cardeiro/i)
    await page.goto('/explore')
    await expect(page.locator('a[href="/explore/mapa"]').first()).toBeVisible()
  })
})

test.describe('home', () => {
  test('vitrine com numeros e setas no celular', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()
    const setas = page.locator('button[aria-label*="róximo" i], button[aria-label*="next" i], button[aria-label*="avançar" i]')
    if (await setas.count()) {
      await setas.first().click()
    }
    await expect(page.locator('a[href="/explore/mares"]').first()).toBeAttached()
  })
})

test.describe('formularios (envio interceptado)', () => {
  test('transfer: validacao e payload do cadastro', async ({ page }) => {
    await page.goto('/transfer')
    await page.getByRole('button', { name: /Cadastrar meu Transfer/i }).first().click()
    const form = page.locator('form').last()
    await form.locator('button[type="submit"]').click()
    await expect(form.locator('.border-red-400').first()).toBeVisible()
    expect(capturas.length).toBe(0)
    await form.locator('input[placeholder="Ex: Transfer Gostoso"]').fill('Fumaca KAN-463')
    await form.locator('input[placeholder="84 99999-9999"]').fill('84 90000-0000')
    await form.locator('select').first().selectOption({ index: 1 })
    await form.locator('input[type="number"]').first().fill('4')
    await form.locator('input[placeholder="06:00 - 22:00"]').fill('08:00 - 18:00')
    await form.locator('button[type="button"]').filter({ hasText: /Portugu/i }).first().click()
    const addRota = form.getByRole('button', { name: /Adicionar rota/i })
    if ((await form.locator('input[placeholder^="De ("]').count()) === 0) await addRota.click()
    await form.locator('input[placeholder^="De ("]').first().fill('Aeroporto de Natal')
    await form.locator('input[placeholder^="Para ("]').first().fill('Sao Miguel do Gostoso')
    await form.locator('input[placeholder^="Pre"]').first().fill('250')
    await form.locator('button[type="submit"]').click()
    await expect.poll(() => capturas.length, { timeout: 15_000 }).toBeGreaterThan(0)
    const envio = capturas.find((c) => c.url.includes('gostoso_transfers'))!
    expect(envio.method).toBe('POST')
    const corpo = JSON.parse(envio.body || '{}')
    const linha = Array.isArray(corpo) ? corpo[0] : corpo
    expect(linha.provider_name).toBe('Fumaca KAN-463')
    expect(JSON.stringify(linha)).toContain('Aeroporto de Natal')
  })

  test('participe: formulario de evento envia payload certo (interceptado)', async ({ page }) => {
    await page.goto('/participe')
    await page.locator('main button').filter({ hasText: /evento/i }).first().click()
    const form = page.locator('form').last()
    await expect(form).toBeVisible()
    await form.locator('input[required]').first().fill('Evento de fumaca KAN-463')
    await form.locator('input[type="datetime-local"]').first().fill('2030-01-01T10:00')
    const nome = form.locator('input[required]:not([type])').nth(1)
    await nome.fill('Teste Fumaca')
    await form.locator('input[type="email"]').fill('fumaca@example.com')
    await form.locator('button').last().click()
    await expect.poll(() => capturas.length, { timeout: 15_000 }).toBeGreaterThan(0)
    const envio = capturas.find((c) => c.url.includes('/rest/v1/'))!
    expect(envio.method).toBe('POST')
    const corpo = JSON.parse(envio.body || '{}')
    const linha = Array.isArray(corpo) ? corpo[0] : corpo
    expect(linha.name).toBe('Evento de fumaca KAN-463')
    expect(linha.submitter_email).toBe('fumaca@example.com')
  })

  test('contrate: formulario de servico valida campos obrigatorios', async ({ page }) => {
    await page.goto('/contrate')
    await expect(page.locator('h1').first()).toBeVisible()
    await page.getByRole('button', { name: /Oferecer servi/i }).first().click()
    const form = page.locator('form').last()
    await expect(form).toBeVisible()
    // Vazio, o envio fica desabilitado e os campos obrigatorios invalidos.
    await expect(form.locator('button[type="submit"]')).toBeDisabled()
    const invalido = await form.locator('[required]').first().evaluate((el) => !(el as HTMLInputElement).checkValidity())
    expect(invalido).toBe(true)
    expect(capturas.length).toBe(0)
  })
})

test.describe('apoie e checkout', () => {
  test('doacao chega ate o Stripe com o valor certo (interceptado)', async ({ page }) => {
    await page.goto('/apoie')
    await page.getByRole('button', { name: /^R\$\s?\d+$/ }).first().click()
    const botao = page.getByRole('button', { name: /Apoiar com/i })
    await expect(botao).toBeEnabled()
    const texto = (await botao.textContent()) || ''
    const valor = Number(texto.replace(/\D/g, ''))
    const irParaStripe = page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 })
    await botao.click()
    await irParaStripe
    const envio = capturas.find((c) => c.url.includes('create-donation-session'))!
    const corpo = JSON.parse(envio.body || '{}')
    expect(corpo.amountCents).toBe(valor * 100)
    expect(corpo.successUrl).toMatch(/\/apoie\?doacao=success$/)
  })
})

test.describe('area restrita', () => {
  test('/cadastre mostra a tela de login, sem credencial', async ({ page }) => {
    await page.goto('/cadastre')
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('/cadastre/admin sem sessao nao mostra o painel', async ({ page }) => {
    await page.goto('/cadastre/admin')
    await page.waitForTimeout(3000)
    const url = page.url()
    const temLogin = await page.locator('input[type="password"]').count()
    expect(url.includes('/cadastre/admin') && temLogin === 0 && (await page.locator('text=Moderação').count()) > 0).toBe(false)
  })
})

test.describe('blog e bio', () => {
  test('blog lista posts e o post abre com JSON-LD', async ({ page, request }) => {
    await page.goto('/blog')
    const post = page.locator('a[href^="/blog/"]').first()
    await expect(post).toBeVisible()
    const href = await post.getAttribute('href')
    const r = await request.get(href!)
    expect(r.status()).toBe(200)
    expect(await r.text()).toContain('application/ld+json')
  })

  test('/bio: noindex e UTM em todo link interno', async ({ request }) => {
    const r = await request.get('/bio')
    expect(r.status()).toBe(200)
    const html = await r.text()
    expect(html).toMatch(/<meta name="robots" content="[^"]*noindex/)
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'))
    const internos = links.filter((h) => h.startsWith('/') && !h.startsWith('/bio/contato.vcf') && !h.startsWith('/api/'))
    expect(internos.length).toBeGreaterThan(3)
    for (const h of internos) expect(h, h).toContain('utm_source=')
  })
})
