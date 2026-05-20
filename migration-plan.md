# Vive Gostoso -- Migração Vite 8 → Next.js 15 App Router

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o Vive Gostoso de React 19 + Vite 8 SPA para Next.js 15 App Router com SSR/SSG, eliminando o FCP de 3-4s causado pelo bundle vendor mínimo (React + Supabase + Mapbox) que bloqueia o bootstrap da SPA.

**Architecture:** Scaffold Next.js 15 no mesmo repositório em branch separado. Manter todos os componentes/hooks existentes sem alteração. Páginas públicas (Come, Fique, Passeie, Home, Blog, Negocio) ficam SSG com ISR -- o HTML já chega pronto ao browser, FCP cai para < 1s. Mapbox carregado com `next/dynamic ssr:false`. Supabase Auth via `@supabase/ssr` (middleware + cookies HTTP-only). i18n migrado de react-router nested routes para `next-intl` com `localePrefix: 'as-needed'` (URL `/come` para PT, `/en/come` para EN -- mantém URLs existentes). Stripe permanece via Supabase Edge Functions sem mudança.

**Tech Stack:** Next.js 15.3, React 19, TypeScript, Tailwind CSS v4, `@supabase/ssr`, TanStack Query v5 (client-side), Mapbox GL (`next/dynamic`), Stripe via Supabase Edge Functions, `next-intl` (i18n), `@ducanh2912/next-pwa` (PWA)

---

## Estratégia SSR vs SSG por Página

| Página | Rota atual | Rota Next.js | Estratégia | `revalidate` |
|--------|-----------|--------------|------------|-------------|
| Home | `/` | `/` | SSG + ISR | 3600s |
| Come | `/come` | `/come` | SSG + ISR | 1800s |
| Fique | `/fique` | `/fique` | SSG + ISR | 1800s |
| Passeie | `/passeie` | `/passeie` | SSG + ISR | 1800s |
| Explore | `/explore` | `/explore` | Client-only | -- |
| Participe | `/participe` | `/participe` | SSG shell + client form | static |
| Conheca | `/conheca` | `/conheca` | SSG completo | static |
| Apoie | `/apoie` | `/apoie` | SSG + ISR + client Stripe | 3600s |
| Contrate | `/contrate` | `/contrate` | SSG + ISR + client forms | 1800s |
| Sobre | `/sobre` | `/sobre` | SSG completo | static |
| Blog | `/blog` | `/blog` | SSG + ISR | 3600s |
| Blog/[slug] | `/blog/:slug` | `/blog/[slug]` | SSG + ISR | 86400s |
| Negocio/[slug] | `/negocio/:slug` | `/negocio/[slug]` | SSG + ISR | 3600s |
| Evento/[id] | `/evento/:id` | `/evento/[id]` | SSG + ISR | 3600s |
| Transfer | `/transfer` | `/transfer` | SSG + ISR | 1800s |
| Bio | `/bio` | `/bio` | SSG completo | static |
| Login | `/cadastre` | `/cadastre` | Client-side | -- |
| Painel | `/cadastre/painel` | `/cadastre/painel` | SSR (auth) | -- |
| Perfil | `/cadastre/perfil` | `/cadastre/perfil` | SSR (auth) | -- |
| MeusNegocios | `/cadastre/negocios` | `/cadastre/negocios` | SSR (auth) | -- |
| Preview | `/cadastre/preview` | `/cadastre/preview` | SSR (auth) | -- |
| Claim/[slug] | `/cadastre/claim/:slug` | `/cadastre/claim/[slug]` | SSR (auth) | -- |
| ResetarSenha | `/cadastre/resetar-senha` | `/cadastre/resetar-senha` | Client-side | -- |
| Admin | `/cadastre/admin` | `/cadastre/admin` | SSR (admin) | -- |
| AdminClaims | `/cadastre/admin/claims` | `/cadastre/admin/claims` | SSR (admin) | -- |
| AdminReviews | `/cadastre/admin/reviews` | `/cadastre/admin/reviews` | SSR (admin) | -- |
| AdminEvents | `/cadastre/admin/events` | `/cadastre/admin/events` | SSR (admin) | -- |
| AdminServices | `/cadastre/admin/services` | `/cadastre/admin/services` | SSR (admin) | -- |
| AdminJobs | `/cadastre/admin/jobs` | `/cadastre/admin/jobs` | SSR (admin) | -- |
| AdminTransfers | `/cadastre/admin/transfers` | `/cadastre/admin/transfers` | SSR (admin) | -- |
| AdminBusinesses | `/cadastre/admin/businesses` | `/cadastre/admin/businesses` | SSR (admin) | -- |

---

## Mapeamento de Arquivos -- Criados e Modificados

### Novos (Next.js scaffold)
```
app/
  layout.tsx                          -- Root layout (HTML, body, providers)
  not-found.tsx                       -- 404 global
  [lang]/
    layout.tsx                        -- Layout localizado (next-intl, hreflang)
    page.tsx                          -- Home SSG+ISR
    come/page.tsx
    fique/page.tsx
    passeie/page.tsx
    explore/page.tsx                  -- Client-only (Mapbox)
    participe/page.tsx
    conheca/page.tsx
    apoie/page.tsx
    contrate/page.tsx
    sobre/page.tsx
    bio/page.tsx
    transfer/page.tsx
    blog/
      page.tsx                        -- Listagem blog SSG+ISR
      [slug]/page.tsx                 -- Post individual SSG+ISR
    negocio/[slug]/page.tsx           -- Negócio SSG+ISR
    evento/[id]/page.tsx              -- Evento SSG+ISR
  cadastre/
    page.tsx                          -- Login (client)
    resetar-senha/page.tsx
    painel/page.tsx                   -- SSR auth
    perfil/page.tsx
    negocios/page.tsx
    preview/page.tsx
    claim/[slug]/page.tsx
    admin/
      page.tsx                        -- Admin dashboard SSR
      claims/page.tsx
      reviews/page.tsx
      events/page.tsx
      services/page.tsx
      jobs/page.tsx
      transfers/page.tsx
      businesses/page.tsx
  auth/
    callback/route.ts                 -- Supabase OAuth callback (server)
  api/
    csp-report/route.ts               -- CSP handler (migrado de api/csp-report.ts)
    sitemap.xml/route.ts              -- Sitemap dinâmico (substitui script prebuild)

lib/
  supabase/
    server.ts                         -- createServerClient (server components + actions)
    client.ts                         -- createBrowserClient (client components)
    middleware.ts                     -- updateSession helper
  query-client.ts                     -- TanStack Query singleton para SSR

middleware.ts                         -- Auth session refresh + locale redirect
i18n/
  request.ts                          -- next-intl: getRequestConfig
  routing.ts                          -- next-intl: defineRouting

components/
  providers.tsx                       -- QueryClientProvider + ThemeProvider (client)
  i18n/
    navigation.ts                     -- next-intl typed navigation helpers
```

### Modificados (adaptações para Next.js)
```
src/lib/supabase.ts         -- Renomear para lib/supabase/client.ts (browser only)
src/components/map/explore-map.tsx  -- Envolver com dynamic() no page.tsx
src/hooks/useAuth.ts        -- Adaptar para @supabase/ssr browser client
src/components/auth/auth-guard.tsx  -- Substituído por middleware
src/components/auth/admin-guard.tsx -- Substituído por middleware
src/components/i18n/        -- Substituído por next-intl navigation
```

### Preservados sem mudança
Todos os arquivos em `src/components/` (exceto auth/* e i18n/*), `src/hooks/` (exceto useAuth), `src/types/`, `src/styles/`, `src/locales/`, `supabase/functions/`

### Removidos
```
src/App.tsx                 -- Substituído por file-based routing
src/main.tsx                -- Substituído por app/layout.tsx
src/i18n.ts                 -- Substituído por i18n/request.ts
vercel.json                 -- SPA rewrites não são mais necessários
scripts/generate-sitemap.mjs -- Substituído por app/api/sitemap.xml/route.ts
```

### Novos arquivos de config
```
next.config.ts              -- Config Next.js 15 (i18n, images, headers)
```

---

## Task 1: Instalar Dependências e Configurar next.config.ts

**Files:**
- Create: `next.config.ts`
- Modify: `package.json`

- [ ] **Step 1.1: Instalar Next.js 15 e dependências novas**

```bash
cd "C:\Users\Victor Lima\Desktop\sites\gostoso\vive-gostoso"
npm install next@15.3 @supabase/ssr next-intl @ducanh2912/next-pwa
npm uninstall react-router-dom @vitejs/plugin-react vite-plugin-pwa vite
```

> Manter: `react`, `react-dom`, `@supabase/supabase-js`, `@tanstack/react-query`, `mapbox-gl`, `react-map-gl`, `supercluster`, `i18next`, `react-i18next`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite` (vai mudar para postcss), `clsx`, `tailwind-merge`

- [ ] **Step 1.2: Atualizar devDependencies para Next.js**

```bash
npm install -D @types/node eslint-config-next
```

- [ ] **Step 1.3: Criar next.config.ts**

```typescript
// next.config.ts
import type { NextConfig } from 'next'
import withPWA from '@ducanh2912/next-pwa'

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wppsmvgbagalczoardfl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})(config)
```

- [ ] **Step 1.4: Atualizar scripts no package.json**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

- [ ] **Step 1.5: Verificar que Next.js compila**

```bash
npx next --version
```

Expected: `Next.js v15.3.x`

- [ ] **Step 1.6: Commit**

```bash
git add package.json next.config.ts
git commit -m "chore: scaffold Next.js 15 -- instalar deps e next.config"
```

---

## Task 2: Tailwind CSS v4 para Next.js

**Files:**
- Create: `postcss.config.mjs`
- Modify: `src/styles/globals.css`

- [ ] **Step 2.1: Instalar integração Tailwind v4 para Next.js (postcss)**

```bash
npm install @tailwindcss/postcss
```

> Tailwind v4 para Next.js usa PostCSS, não o plugin Vite. O `@tailwindcss/vite` é removido.

- [ ] **Step 2.2: Criar postcss.config.mjs**

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
export default config
```

- [ ] **Step 2.3: Verificar globals.css -- o @theme já está correto**

O arquivo `src/styles/globals.css` com `@import "tailwindcss"` e `@theme { ... }` funciona sem alteração no Next.js. Apenas confirmar que o import no layout raiz aponta para o caminho certo.

```css
/* src/styles/globals.css -- sem alterações necessárias */
@import "tailwindcss";

@theme {
  --color-teal: #0D7C7C;
  --color-teal-dark: #0a6363;
  /* ... demais tokens preservados ... */
}
```

- [ ] **Step 2.4: Commit**

```bash
git add postcss.config.mjs
git commit -m "chore: tailwind v4 via postcss para Next.js"
```

---

## Task 3: Supabase SSR Client + Middleware de Auth

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `middleware.ts` (raiz do projeto)

- [ ] **Step 3.1: Criar lib/supabase/server.ts**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component -- cookies só podem ser setados em Server Actions ou Route Handlers
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3.2: Criar lib/supabase/client.ts**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3.3: Criar lib/supabase/middleware.ts**

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rotas protegidas -- redirecionar se não autenticado
  const isProtected = request.nextUrl.pathname.startsWith('/cadastre/painel') ||
    request.nextUrl.pathname.startsWith('/cadastre/perfil') ||
    request.nextUrl.pathname.startsWith('/cadastre/negocios') ||
    request.nextUrl.pathname.startsWith('/cadastre/preview') ||
    request.nextUrl.pathname.startsWith('/cadastre/claim') ||
    request.nextUrl.pathname.startsWith('/cadastre/admin')

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/cadastre'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

- [ ] **Step 3.4: Criar middleware.ts na raiz**

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 3.5: Atualizar hooks/useAuth.ts para usar browser client**

```typescript
// src/hooks/useAuth.ts
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, session, loading, supabase }
}
```

- [ ] **Step 3.6: Commit**

```bash
git add lib/ middleware.ts src/hooks/useAuth.ts
git commit -m "feat: supabase SSR client + middleware de auth"
```

---

## Task 4: i18n com next-intl

**Files:**
- Create: `i18n/routing.ts`
- Create: `i18n/request.ts`
- Create: `components/i18n/navigation.ts`

- [ ] **Step 4.1: Criar i18n/routing.ts**

```typescript
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['pt', 'en', 'es'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed', // /come para PT, /en/come para EN -- mantém URLs existentes
})
```

- [ ] **Step 4.2: Criar i18n/request.ts**

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as 'pt' | 'en' | 'es')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../src/locales/${locale}.json`)).default,
  }
})
```

- [ ] **Step 4.3: Criar components/i18n/navigation.ts**

```typescript
// components/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from '@/i18n/routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
```

- [ ] **Step 4.4: Adicionar plugin next-intl ao next.config.ts**

```typescript
// next.config.ts -- adicionar import e plugin
import type { NextConfig } from 'next'
import withPWA from '@ducanh2912/next-pwa'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wppsmvgbagalczoardfl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})(withNextIntl(config))
```

- [ ] **Step 4.5: Atualizar middleware.ts para incluir next-intl**

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // Rotas autenticadas: supabase session primeiro
  if (request.nextUrl.pathname.startsWith('/cadastre')) {
    return await updateSession(request)
  }

  // Demais rotas: i18n + session refresh passivo
  const intlResponse = intlMiddleware(request)
  if (intlResponse) return intlResponse

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 4.6: Commit**

```bash
git add i18n/ components/i18n/navigation.ts next.config.ts middleware.ts
git commit -m "feat: next-intl com localePrefix as-needed (PT sem prefixo)"
```

---

## Task 5: Root Layout + Providers

**Files:**
- Create: `app/layout.tsx`
- Create: `app/[lang]/layout.tsx`
- Create: `components/providers.tsx`
- Create: `lib/query-client.ts`

- [ ] **Step 5.1: Criar lib/query-client.ts**

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
```

- [ ] **Step 5.2: Criar components/providers.tsx**

```typescript
// components/providers.tsx
'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { type ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

- [ ] **Step 5.3: Criar app/layout.tsx (root)**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import '@/src/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://vivegostoso.com.br'),
  title: { default: 'Vive Gostoso', template: '%s | Vive Gostoso' },
  description: 'A infraestrutura digital de São Miguel do Gostoso, RN.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-areia text-[#1A1A1A] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 5.4: Criar app/[lang]/layout.tsx**

```typescript
// app/[lang]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params

  if (!routing.locales.includes(lang as 'pt' | 'en' | 'es')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
```

- [ ] **Step 5.5: Verificar compilação TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: Poucos erros (serão resolvidos nas tasks seguintes). Zero é improvável neste ponto.

- [ ] **Step 5.6: Commit**

```bash
git add app/ lib/query-client.ts components/providers.tsx
git commit -m "feat: root layout + providers (QueryClient + NextIntl)"
```

---

## Task 6: Páginas Estáticas Simples (Conheca, Sobre, Bio)

**Files:**
- Create: `app/[lang]/conheca/page.tsx`
- Create: `app/[lang]/sobre/page.tsx`
- Create: `app/[lang]/bio/page.tsx`

> Estas páginas são totalmente estáticas -- conteúdo editorial fixo, sem dados do Supabase. Servem como template para as demais páginas.

- [ ] **Step 6.1: Criar app/[lang]/conheca/page.tsx**

```typescript
// app/[lang]/conheca/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Conheca from '@/src/pages/Conheca'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('conheca')
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default function ConhecaPage() {
  return <Conheca />
}
```

> O componente `src/pages/Conheca.tsx` precisa da diretiva `'use client'` adicionada ao topo se usar hooks. Verificar e adicionar se necessário.

- [ ] **Step 6.2: Adicionar 'use client' em src/pages/Conheca.tsx se necessário**

```typescript
// src/pages/Conheca.tsx -- adicionar ao topo se usar hooks/eventos
'use client'
// ... resto do arquivo sem mudança
```

- [ ] **Step 6.3: Criar app/[lang]/sobre/page.tsx (mesmo padrão)**

```typescript
// app/[lang]/sobre/page.tsx
import type { Metadata } from 'next'
import Sobre from '@/src/pages/Sobre'

export const metadata: Metadata = {
  title: 'Sobre o Projeto',
  description: 'Conheça o projeto Vive Gostoso e sua missão para São Miguel do Gostoso.',
}

export default function SobrePage() {
  return <Sobre />
}
```

- [ ] **Step 6.4: Criar app/[lang]/bio/page.tsx**

```typescript
// app/[lang]/bio/page.tsx
import Bio from '@/src/pages/Bio'

export default function BioPage() {
  return <Bio />
}
```

- [ ] **Step 6.5: Criar app/not-found.tsx**

```typescript
// app/not-found.tsx
import NotFound from '@/src/pages/NotFound'

export default function NotFoundPage() {
  return <NotFound />
}
```

- [ ] **Step 6.6: Rodar build e verificar que estas páginas compilam**

```bash
npx next build 2>&1 | grep -E "(error|warning|✓)" | head -40
```

- [ ] **Step 6.7: Commit**

```bash
git add app/[lang]/conheca/ app/[lang]/sobre/ app/[lang]/bio/ app/not-found.tsx
git commit -m "feat: páginas estáticas -- Conheca, Sobre, Bio, NotFound"
```

---

## Task 7: Home com SSG + ISR

**Files:**
- Create: `app/[lang]/page.tsx`

- [ ] **Step 7.1: Criar app/[lang]/page.tsx com ISR**

```typescript
// app/[lang]/page.tsx
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Home from '@/src/pages/Home'

export const revalidate = 3600 // ISR: re-gerar a cada 1 hora

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Vive Gostoso -- São Miguel do Gostoso, RN',
    description: 'A infraestrutura digital de São Miguel do Gostoso. Restaurantes, pousadas, passeios, eventos e mais.',
    openGraph: {
      title: 'Vive Gostoso',
      description: 'O sistema operacional de São Miguel do Gostoso, RN.',
      url: 'https://vivegostoso.com.br',
      siteName: 'Vive Gostoso',
      locale: 'pt_BR',
      type: 'website',
    },
  }
}

// Buscar dados server-side para pre-render
async function getHomeData() {
  const supabase = await createClient()

  const [businessesRes, eventsRes, statsRes] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, slug, cover_url, category_id, is_featured, is_verified, lat, lng')
      .eq('active', true)
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .limit(8),
    supabase
      .from('gostoso_events')
      .select('id, name, starts_at, ends_at, location, cover_url, is_featured')
      .eq('active', true)
      .gte('ends_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(4),
    supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .eq('active', true),
  ])

  return {
    featuredBusinesses: businessesRes.data ?? [],
    upcomingEvents: eventsRes.data ?? [],
    totalBusinesses: statsRes.count ?? 0,
  }
}

export default async function HomePage() {
  const initialData = await getHomeData()
  // Passar como props para o componente client
  return <Home initialData={initialData} />
}
```

- [ ] **Step 7.2: Adaptar src/pages/Home.tsx para receber initialData**

```typescript
// src/pages/Home.tsx -- adicionar 'use client' e prop initialData
'use client'
import { useBusinesses } from '@/src/hooks/useBusinesses'
import { useEvents } from '@/src/hooks/useEvents'
// ... imports existentes

type HomeProps = {
  initialData?: {
    featuredBusinesses: Business[]
    upcomingEvents: GostosoEvent[]
    totalBusinesses: number
  }
}

export default function Home({ initialData }: HomeProps) {
  // TanStack Query usa initialData para hidratação -- sem loading state no first render
  const { data: businesses } = useBusinesses(undefined, {
    initialData: initialData?.featuredBusinesses,
  })
  const { data: events } = useEvents(true, {
    initialData: initialData?.upcomingEvents,
  })

  // ... resto do componente sem mudança
}
```

- [ ] **Step 7.3: Verificar que ISR funciona -- inspecionar output do build**

```bash
npx next build 2>&1 | grep -A2 "/"
```

Expected: `○ /` com nota `(ISR: 3600s)` ou similar.

- [ ] **Step 7.4: Commit**

```bash
git add app/[lang]/page.tsx src/pages/Home.tsx
git commit -m "feat: home SSG+ISR (revalidate 3600s)"
```

---

## Task 8: Listagens com SSG+ISR (Come, Fique, Passeie)

**Files:**
- Create: `app/[lang]/come/page.tsx`
- Create: `app/[lang]/fique/page.tsx`
- Create: `app/[lang]/passeie/page.tsx`

> As três páginas seguem o mesmo padrão -- apenas a `category` muda. Task completa com o template Come.

- [ ] **Step 8.1: Criar helper de dados de listagem**

```typescript
// lib/supabase/queries.ts
import { createClient } from '@/lib/supabase/server'

export async function getBusinessesByVerb(verb: string) {
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('gostoso_categories')
    .select('id')
    .eq('verb', verb.toUpperCase())
    .single()

  if (!category) return []

  const { data } = await supabase
    .from('businesses')
    .select(`
      id, name, slug, description, cover_url, photos,
      is_featured, is_verified, plan, price_range,
      phone, whatsapp, instagram, opening_hours,
      lat, lng, address
    `)
    .eq('active', true)
    .eq('is_published', true)
    .eq('category_id', category.id)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })

  return data ?? []
}
```

- [ ] **Step 8.2: Criar app/[lang]/come/page.tsx**

```typescript
// app/[lang]/come/page.tsx
import type { Metadata } from 'next'
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import Come from '@/src/pages/Come'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'COME. -- Restaurantes e Gastronomia',
  description: 'Restaurantes, bares, churrascarias e experiências gastronômicas em São Miguel do Gostoso, RN.',
}

export default async function ComePage() {
  const businesses = await getBusinessesByVerb('COME')
  return <Come initialBusinesses={businesses} />
}
```

- [ ] **Step 8.3: Adicionar prop initialBusinesses em src/pages/Come.tsx**

```typescript
// src/pages/Come.tsx
'use client'
import { useBusinesses } from '@/src/hooks/useBusinesses'

type ComeProps = {
  initialBusinesses?: Business[]
}

export default function Come({ initialBusinesses }: ComeProps) {
  const { data: businesses, isLoading } = useBusinesses('COME', {
    initialData: initialBusinesses,
  })
  // ... resto sem mudança -- isLoading será false no first render com initialData
}
```

- [ ] **Step 8.4: Repetir padrão para Fique e Passeie**

```typescript
// app/[lang]/fique/page.tsx
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import Fique from '@/src/pages/Fique'

export const revalidate = 1800

export default async function FiquePage() {
  const businesses = await getBusinessesByVerb('FIQUE')
  return <Fique initialBusinesses={businesses} />
}
```

```typescript
// app/[lang]/passeie/page.tsx
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import Passeie from '@/src/pages/Passeie'

export const revalidate = 1800

export default async function PasseiePage() {
  const businesses = await getBusinessesByVerb('PASSEIE')
  return <Passeie initialBusinesses={businesses} />
}
```

- [ ] **Step 8.5: Verificar build**

```bash
npx next build 2>&1 | grep -E "come|fique|passeie"
```

- [ ] **Step 8.6: Commit**

```bash
git add app/[lang]/come/ app/[lang]/fique/ app/[lang]/passeie/ lib/supabase/queries.ts src/pages/Come.tsx src/pages/Fique.tsx src/pages/Passeie.tsx
git commit -m "feat: Come, Fique, Passeie SSG+ISR com dados server-side"
```

---

## Task 9: Negócio/[slug] com generateStaticParams

**Files:**
- Create: `app/[lang]/negocio/[slug]/page.tsx`

- [ ] **Step 9.1: Criar app/[lang]/negocio/[slug]/page.tsx**

```typescript
// app/[lang]/negocio/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Negocio from '@/src/pages/Negocio'

export const revalidate = 3600

type Props = {
  params: Promise<{ lang: string; slug: string }>
}

// Pre-render os 50 negócios mais visitados; demais ficam on-demand
export async function generateStaticParams() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('businesses')
    .select('slug')
    .eq('active', true)
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .limit(50)

  const slugs = data?.map((b) => b.slug) ?? []
  const langs = ['pt', 'en', 'es']

  return langs.flatMap((lang) => slugs.map((slug) => ({ lang, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('name, description, cover_url')
    .eq('slug', slug)
    .single()

  if (!business) return { title: 'Negócio não encontrado' }

  return {
    title: business.name,
    description: business.description,
    openGraph: {
      images: business.cover_url ? [{ url: business.cover_url }] : [],
    },
  }
}

export default async function NegocioPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!business) notFound()

  return <Negocio initialBusiness={business} slug={slug} />
}
```

- [ ] **Step 9.2: Adaptar src/pages/Negocio.tsx**

```typescript
// src/pages/Negocio.tsx
'use client'
import { useBusiness } from '@/src/hooks/useBusiness'
import type { Business } from '@/src/types/database'

type NegocioProps = {
  slug: string
  initialBusiness?: Business
}

export default function Negocio({ slug, initialBusiness }: NegocioProps) {
  // useParams() do React Router não existe mais -- slug vem como prop
  const { data: business } = useBusiness(slug, { initialData: initialBusiness })
  // ... resto sem mudança
}
```

- [ ] **Step 9.3: Commit**

```bash
git add app/[lang]/negocio/ src/pages/Negocio.tsx
git commit -m "feat: Negocio/[slug] SSG+ISR com generateStaticParams"
```

---

## Task 10: Blog (Listagem + Post Individual)

**Files:**
- Create: `app/[lang]/blog/page.tsx`
- Create: `app/[lang]/blog/[slug]/page.tsx`

- [ ] **Step 10.1: Adicionar query de blog ao queries.ts**

```typescript
// lib/supabase/queries.ts -- adicionar
export async function getBlogPosts(limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts') // confirmar nome exato da tabela no projeto
    .select('id, title, slug, excerpt, cover_url, published_at, tags')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getBlogPost(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}
```

- [ ] **Step 10.2: Criar app/[lang]/blog/page.tsx**

```typescript
// app/[lang]/blog/page.tsx
import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/supabase/queries'
import Blog from '@/src/pages/Blog'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog -- Histórias de São Miguel do Gostoso',
  description: 'Artigos, guias e histórias sobre São Miguel do Gostoso, RN.',
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <Blog initialPosts={posts} />
}
```

- [ ] **Step 10.3: Criar app/[lang]/blog/[slug]/page.tsx**

```typescript
// app/[lang]/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPost, getBlogPosts } from '@/lib/supabase/queries'
import BlogPost from '@/src/pages/BlogPost'

export const revalidate = 86400

type Props = { params: Promise<{ lang: string; slug: string }> }

export async function generateStaticParams() {
  const posts = await getBlogPosts(100)
  const langs = ['pt', 'en', 'es']
  return langs.flatMap((lang) => posts.map((p) => ({ lang, slug: p.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return { title: 'Post não encontrado' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: post.cover_url ? [{ url: post.cover_url }] : [] },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()
  return <BlogPost initialPost={post} slug={slug} />
}
```

- [ ] **Step 10.4: Adaptar Blog.tsx e BlogPost.tsx com initialData**

Em `src/pages/Blog.tsx` e `src/pages/BlogPost.tsx`: adicionar `'use client'`, receber `initialPosts/initialPost` como prop, passar para os hooks correspondentes.

- [ ] **Step 10.5: Commit**

```bash
git add app/[lang]/blog/ src/pages/Blog.tsx src/pages/BlogPost.tsx
git commit -m "feat: Blog SSG+ISR (listagem + post individual)"
```

---

## Task 11: Evento/[id] + Transfer + Apoie + Contrate + Participe

**Files:**
- Create: `app/[lang]/evento/[id]/page.tsx`
- Create: `app/[lang]/transfer/page.tsx`
- Create: `app/[lang]/apoie/page.tsx`
- Create: `app/[lang]/contrate/page.tsx`
- Create: `app/[lang]/participe/page.tsx`

- [ ] **Step 11.1: Criar app/[lang]/evento/[id]/page.tsx**

```typescript
// app/[lang]/evento/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Evento from '@/src/pages/Evento'

export const revalidate = 3600

type Props = { params: Promise<{ lang: string; id: string }> }

export async function generateStaticParams() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gostoso_events')
    .select('id')
    .eq('active', true)
    .limit(100)
  const langs = ['pt', 'en', 'es']
  return langs.flatMap((lang) => (data ?? []).map((e) => ({ lang, id: e.id })))
}

export default async function EventoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('gostoso_events')
    .select('*')
    .eq('id', id)
    .single()
  if (!event) notFound()
  return <Evento initialEvent={event} id={id} />
}
```

- [ ] **Step 11.2: Criar Transfer, Apoie, Contrate e Participe (SSG+ISR simples)**

```typescript
// app/[lang]/transfer/page.tsx
import { getBusinessesByVerb } from '@/lib/supabase/queries'
import Transfer from '@/src/pages/Transfer'
export const revalidate = 1800
export default async function TransferPage() {
  const transfers = await getBusinessesByVerb('TRANSFER')
  return <Transfer initialTransfers={transfers} />
}
```

```typescript
// app/[lang]/apoie/page.tsx
import { createClient } from '@/lib/supabase/server'
import Apoie from '@/src/pages/Apoie'
export const revalidate = 3600
export default async function ApoiePage() {
  const supabase = await createClient()
  const { data: entries } = await supabase
    .from('gostoso_fund')
    .select('*')
    .order('entry_date', { ascending: false })
  return <Apoie initialEntries={entries ?? []} />
}
```

```typescript
// app/[lang]/contrate/page.tsx
import { createClient } from '@/lib/supabase/server'
import Contrate from '@/src/pages/Contrate'
export const revalidate = 1800
export default async function ContratePage() {
  const supabase = await createClient()
  const [{ data: services }, { data: jobs }] = await Promise.all([
    supabase.from('gostoso_service_listings').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('gostoso_job_listings').select('*').eq('is_active', true).order('created_at', { ascending: false }),
  ])
  return <Contrate initialServices={services ?? []} initialJobs={jobs ?? []} />
}
```

```typescript
// app/[lang]/participe/page.tsx
import Participe from '@/src/pages/Participe'
// Shell estático -- o formulário de submissão é client
export default function ParticipePage() {
  return <Participe />
}
```

- [ ] **Step 11.3: Adicionar 'use client' e props initialData nas páginas afetadas**

Para cada `src/pages/*.tsx` das páginas acima: adicionar `'use client'` e receber `initialData` como prop.

- [ ] **Step 11.4: Commit**

```bash
git add app/[lang]/evento/ app/[lang]/transfer/ app/[lang]/apoie/ app/[lang]/contrate/ app/[lang]/participe/
git commit -m "feat: Evento, Transfer, Apoie, Contrate, Participe SSG+ISR"
```

---

## Task 12: Explore -- Mapbox com dynamic import ssr:false

**Files:**
- Create: `app/[lang]/explore/page.tsx`
- Modify: `src/pages/Explore.tsx`

> Esta é a única página que não pode ter SSG/ISR para o mapa -- Mapbox requer o browser. O shell da página pode ser SSG, mas o componente do mapa é carregado dinamicamente.

- [ ] **Step 12.1: Criar app/[lang]/explore/page.tsx**

```typescript
// app/[lang]/explore/page.tsx
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Explore from '@/src/pages/Explore'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'EXPLORE. -- Mapa de São Miguel do Gostoso',
  description: 'Explore restaurantes, pousadas e passeios em São Miguel do Gostoso no mapa interativo.',
}

export default async function ExplorePage() {
  // Buscar coordenadas dos negócios server-side (evita flash de loading no mapa)
  const supabase = await createClient()
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, lat, lng, cover_url, category_id, is_featured')
    .eq('active', true)
    .eq('is_published', true)
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  return <Explore initialBusinesses={businesses ?? []} />
}
```

- [ ] **Step 12.2: Adaptar src/pages/Explore.tsx para usar dynamic import**

```typescript
// src/pages/Explore.tsx
'use client'
import dynamic from 'next/dynamic'
import type { Business } from '@/src/types/database'

// ExploreMap carregado APENAS no browser -- Mapbox não funciona no Node.js
const ExploreMap = dynamic(
  () => import('@/src/components/map/explore-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-teal/10 rounded-2xl animate-pulse flex items-center justify-center">
        <span className="text-teal font-medium">Carregando mapa...</span>
      </div>
    ),
  }
)

type ExploreProps = {
  initialBusinesses?: Business[]
}

export default function Explore({ initialBusinesses = [] }: ExploreProps) {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl text-teal mb-8">EXPLORE.</h1>
      <ExploreMap businesses={initialBusinesses} />
    </div>
  )
}
```

- [ ] **Step 12.3: Verificar que explore-map.tsx NÃO tem 'use client' no topo (não precisa -- já é carregado via dynamic)**

O componente `src/components/map/explore-map.tsx` não precisa de `'use client'` porque é importado via `next/dynamic`. O `'use client'` do `Explore.tsx` já cobre.

- [ ] **Step 12.4: Verificar que mapbox-gl não aparece no bundle SSR**

```bash
npx next build 2>&1 | grep "mapbox"
```

Expected: `mapbox-gl` não deve aparecer nos chunks de servidor.

- [ ] **Step 12.5: Commit**

```bash
git add app/[lang]/explore/ src/pages/Explore.tsx
git commit -m "feat: Explore com Mapbox dynamic ssr:false"
```

---

## Task 13: Área Cadastre -- Login e ResetarSenha

**Files:**
- Create: `app/cadastre/page.tsx`
- Create: `app/cadastre/resetar-senha/page.tsx`
- Create: `app/auth/callback/route.ts`

> Rotas de cadastre são PT-only (sem prefixo de idioma). Todas as páginas cadastre são client-side.

- [ ] **Step 13.1: Criar app/auth/callback/route.ts**

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/cadastre/painel'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/cadastre?error=auth_callback_failed`)
}
```

- [ ] **Step 13.2: Criar app/cadastre/page.tsx**

```typescript
// app/cadastre/page.tsx
import Login from '@/src/pages/cadastre/Login'

export default function CadastrePage() {
  return <Login />
}
```

- [ ] **Step 13.3: Atualizar src/pages/cadastre/Login.tsx**

```typescript
// src/pages/cadastre/Login.tsx -- adicionar 'use client' e usar next/navigation
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
// Substituir useNavigate do react-router por useRouter do next/navigation
// Substituir Link do react-router por next/link
// Resto da lógica de auth sem mudança
```

- [ ] **Step 13.4: Criar app/cadastre/resetar-senha/page.tsx**

```typescript
// app/cadastre/resetar-senha/page.tsx
import ResetarSenha from '@/src/pages/cadastre/ResetarSenha'

export default function ResetarSenhaPage() {
  return <ResetarSenha />
}
```

- [ ] **Step 13.5: Commit**

```bash
git add app/cadastre/ app/auth/
git commit -m "feat: cadastre login + auth callback"
```

---

## Task 14: Páginas Autenticadas do Prestador

**Files:**
- Create: `app/cadastre/painel/page.tsx`
- Create: `app/cadastre/perfil/page.tsx`
- Create: `app/cadastre/negocios/page.tsx`
- Create: `app/cadastre/preview/page.tsx`
- Create: `app/cadastre/claim/[slug]/page.tsx`

> O middleware já redireciona para /cadastre se não autenticado. As páginas recebem o user server-side.

- [ ] **Step 14.1: Criar app/cadastre/painel/page.tsx**

```typescript
// app/cadastre/painel/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Painel from '@/src/pages/cadastre/Painel'

export default async function PainelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/cadastre')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, businesses(*)')
    .eq('auth_user_id', user.id)
    .single()

  return <Painel user={user} profile={profile} />
}
```

- [ ] **Step 14.2: Repetir padrão para Perfil, MeusNegocios, Preview**

```typescript
// app/cadastre/perfil/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Perfil from '@/src/pages/cadastre/Perfil'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
  return <Perfil user={user} initialProfile={profile} />
}
```

```typescript
// app/cadastre/negocios/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MeusNegocios from '@/src/pages/cadastre/MeusNegocios'

export default async function MeusNegociosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
  return <MeusNegocios user={user} initialBusinesses={businesses ?? []} />
}
```

```typescript
// app/cadastre/preview/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Preview from '@/src/pages/cadastre/Preview'

export default async function PreviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  return <Preview user={user} />
}
```

- [ ] **Step 14.3: Criar app/cadastre/claim/[slug]/page.tsx**

```typescript
// app/cadastre/claim/[slug]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Claim from '@/src/pages/cadastre/Claim'

type Props = { params: Promise<{ slug: string }> }

export default async function ClaimPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, is_verified')
    .eq('slug', slug)
    .single()
  if (!business) notFound()
  return <Claim user={user} business={business} slug={slug} />
}
```

- [ ] **Step 14.4: Adaptar páginas src/pages/cadastre/*.tsx**

Para cada página: adicionar `'use client'`, remover hooks de routing do react-router (`useNavigate`, `useParams`), substituir por `useRouter` e `usePathname` do `next/navigation`.

```typescript
// src/pages/cadastre/Painel.tsx -- exemplo de adaptação
'use client'
import { useRouter } from 'next/navigation'
// Remover: import { useNavigate } from 'react-router-dom'

type PainelProps = {
  user: User
  profile: Profile | null
}

export default function Painel({ user, profile }: PainelProps) {
  const router = useRouter()
  // Substituir navigate('/cadastre') por router.push('/cadastre')
  // Resto da lógica sem mudança
}
```

- [ ] **Step 14.5: Commit**

```bash
git add app/cadastre/ src/pages/cadastre/
git commit -m "feat: páginas autenticadas do prestador (painel, perfil, negocios, preview, claim)"
```

---

## Task 15: Painel Admin

**Files:**
- Create: `app/cadastre/admin/page.tsx` e sub-páginas

- [ ] **Step 15.1: Criar helper de verificação de role admin**

```typescript
// lib/supabase/queries.ts -- adicionar
export async function requireAdmin(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', userId)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/cadastre/painel')
  }

  return profile
}
```

- [ ] **Step 15.2: Criar app/cadastre/admin/page.tsx**

```typescript
// app/cadastre/admin/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/queries'
import Admin from '@/src/pages/cadastre/Admin'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  await requireAdmin(supabase, user.id)

  const [
    { data: businesses, count: bizCount },
    { data: claims },
    { data: pendingServices },
    { data: pendingJobs },
  ] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact' }).eq('active', true),
    supabase.from('claims').select('*').eq('status', 'pending'),
    supabase.from('gostoso_service_listings').select('*').eq('is_active', false),
    supabase.from('gostoso_job_listings').select('*').eq('is_active', false),
  ])

  return <Admin
    user={user}
    stats={{ totalBusinesses: bizCount ?? 0 }}
    pendingClaims={claims ?? []}
    pendingServices={pendingServices ?? []}
    pendingJobs={pendingJobs ?? []}
  />
}
```

- [ ] **Step 15.3: Criar sub-páginas admin (Claims, Reviews, Events, Services, Jobs, Transfers, Businesses)**

Cada sub-página segue o padrão:

```typescript
// app/cadastre/admin/claims/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/queries'
import AdminClaims from '@/src/pages/cadastre/AdminClaims'

export default async function AdminClaimsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cadastre')
  await requireAdmin(supabase, user.id)
  const { data: claims } = await supabase
    .from('claims')
    .select('*, businesses(*), profiles(*)')
    .order('created_at', { ascending: false })
  return <AdminClaims user={user} initialClaims={claims ?? []} />
}
```

> Repetir o padrão para AdminReviews, AdminEvents, AdminServices, AdminJobs, AdminTransfers, AdminBusinesses -- apenas muda a query e o componente importado.

- [ ] **Step 15.4: Adaptar src/pages/cadastre/Admin*.tsx**

Todos os componentes Admin: adicionar `'use client'`, remover react-router, receber dados como props, usar `useRouter` do next/navigation.

- [ ] **Step 15.5: Commit**

```bash
git add app/cadastre/admin/ src/pages/cadastre/Admin*.tsx
git commit -m "feat: painel admin completo com SSR + role guard"
```

---

## Task 16: Sitemap Dinâmico + API Routes

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/api/csp-report/route.ts`

- [ ] **Step 16.1: Criar app/sitemap.ts (substitui scripts/generate-sitemap.mjs)**

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://vivegostoso.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: businesses }, { data: blogPosts }, { data: events }] = await Promise.all([
    supabase.from('businesses').select('slug, updated_at').eq('active', true).eq('is_published', true),
    supabase.from('blog_posts').select('slug, updated_at').eq('published', true),
    supabase.from('gostoso_events').select('id, updated_at').eq('active', true),
  ])

  const staticPages = ['', '/come', '/fique', '/passeie', '/explore', '/participe', '/conheca', '/apoie', '/contrate', '/sobre', '/blog', '/transfer']

  return [
    ...staticPages.map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...(businesses ?? []).map((b) => ({
      url: `${BASE_URL}/negocio/${b.slug}`,
      lastModified: new Date(b.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...(blogPosts ?? []).map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...(events ?? []).map((e) => ({
      url: `${BASE_URL}/evento/${e.id}`,
      lastModified: new Date(e.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
```

- [ ] **Step 16.2: Criar app/api/csp-report/route.ts**

```typescript
// app/api/csp-report/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (body) {
    console.warn('[CSP Violation]', JSON.stringify(body))
  }
  return NextResponse.json({ ok: true }, { status: 204 })
}
```

- [ ] **Step 16.3: Commit**

```bash
git add app/sitemap.ts app/api/
git commit -m "feat: sitemap dinâmico + CSP handler como API routes"
```

---

## Task 17: PWA -- Manifest e Service Worker

**Files:**
- Modify: `next.config.ts`
- Create: `public/manifest.json`

- [ ] **Step 17.1: Criar public/manifest.json**

```json
{
  "name": "Vive Gostoso",
  "short_name": "Vive Gostoso",
  "description": "A infraestrutura digital de São Miguel do Gostoso, RN. A cidade online.",
  "theme_color": "#0D7C7C",
  "background_color": "#F5F2EE",
  "display": "standalone",
  "start_url": "/",
  "scope": "/",
  "lang": "pt-BR",
  "orientation": "portrait-primary",
  "categories": ["travel", "local", "community"],
  "icons": [
    { "src": "/icons/pwa/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/pwa/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/pwa/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "COME.", "url": "/come", "description": "Restaurantes" },
    { "name": "FIQUE.", "url": "/fique", "description": "Hospedagem" },
    { "name": "EXPLORE.", "url": "/explore", "description": "Mapa interativo" },
    { "name": "APOIE.", "url": "/apoie", "description": "Fundo público" }
  ]
}
```

- [ ] **Step 17.2: Adicionar manifest ao app/layout.tsx**

```typescript
// app/layout.tsx -- adicionar ao metadata
export const metadata: Metadata = {
  // ... existente
  manifest: '/manifest.json',
  themeColor: '#0D7C7C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vive Gostoso',
  },
}
```

- [ ] **Step 17.3: Verificar que @ducanh2912/next-pwa gera service worker no build**

```bash
npx next build 2>&1 | grep -E "(sw|service-worker|pwa)"
```

Expected: Mensagem confirmando geração de `sw.js` em `public/`.

- [ ] **Step 17.4: Commit**

```bash
git add public/manifest.json app/layout.tsx
git commit -m "feat: PWA manifest + service worker next-pwa"
```

---

## Task 18: Variáveis de Ambiente + vercel.json

**Files:**
- Create: `.env.local` (atualizar nomes para Next.js)
- Modify/Delete: `vercel.json`

- [ ] **Step 18.1: Atualizar .env.local**

```bash
# .env.local -- variáveis Next.js (NEXT_PUBLIC_ em vez de VITE_)
NEXT_PUBLIC_SUPABASE_URL=https://wppsmvgbagalczoardfl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYmxvb2R5dTIiLCJhIjoiY21vaHVpMmVnMDUzOTJ3cHdneXEwbjV2dCJ9...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

- [ ] **Step 18.2: Atualizar todas as referências de import.meta.env para process.env**

```bash
# Buscar todas as ocorrências de import.meta.env no projeto
grep -r "import.meta.env" src/ --include="*.ts" --include="*.tsx" -l
```

Para cada arquivo encontrado, substituir:
- `import.meta.env.VITE_SUPABASE_URL` → `process.env.NEXT_PUBLIC_SUPABASE_URL`
- `import.meta.env.VITE_SUPABASE_ANON_KEY` → `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `import.meta.env.VITE_MAPBOX_TOKEN` → `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`
- `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY` → `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- [ ] **Step 18.3: Remover vercel.json (SPA rewrites não são mais necessários)**

```bash
rm vercel.json
```

Next.js é detectado automaticamente pelo Vercel -- nenhuma configuração extra necessária.

- [ ] **Step 18.4: Commit**

```bash
git add .env.local
git rm vercel.json
git commit -m "chore: env vars VITE_ → NEXT_PUBLIC_ + remover vercel.json SPA"
```

---

## Task 19: Substituir react-router por next/navigation

**Files:**
- Modify: todos os `src/pages/*.tsx` e `src/components/**/*.tsx` que usam react-router

> Esta task é a mais trabalhosa mas mecânica. Cada substituição segue o mesmo padrão.

- [ ] **Step 19.1: Mapear todas as ocorrências de react-router**

```bash
grep -r "react-router-dom" src/ --include="*.ts" --include="*.tsx" -l
```

- [ ] **Step 19.2: Substituições obrigatórias por arquivo**

| react-router-dom | next/navigation ou next/link |
|-----------------|------------------------------|
| `import { Link } from 'react-router-dom'` | `import Link from 'next/link'` |
| `import { useNavigate } from 'react-router-dom'` | `import { useRouter } from 'next/navigation'` |
| `import { useParams } from 'react-router-dom'` | Receber como prop do page.tsx |
| `import { useLocation } from 'react-router-dom'` | `import { usePathname } from 'next/navigation'` |
| `navigate('/path')` | `router.push('/path')` |
| `navigate(-1)` | `router.back()` |
| `useLocation().pathname` | `usePathname()` |

> Para i18n: usar `Link` e `useRouter` de `@/components/i18n/navigation` (typed next-intl navigation) nas páginas com prefixo de idioma.

- [ ] **Step 19.3: Verificar compilação TypeScript após substituições**

```bash
npx tsc --noEmit 2>&1 | head -50
```

Corrigir cada erro reportado.

- [ ] **Step 19.4: Commit**

```bash
git add src/
git commit -m "refactor: substituir react-router-dom por next/navigation em todos os componentes"
```

---

## Task 20: Header + Footer -- Adaptação para Next.js

**Files:**
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 20.1: Adaptar header.tsx**

```typescript
// src/components/layout/header.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
// Remover imports do react-router-dom
// Manter toda a lógica de popover, drawer mobile e logo
// O hook useLocalePath pode usar next-intl navigation direto
```

- [ ] **Step 20.2: Adaptar footer.tsx**

```typescript
// src/components/layout/footer.tsx
'use client'
import Link from 'next/link'
// Remover import do react-router-dom
// Resto sem mudança
```

- [ ] **Step 20.3: Integrar Header + Footer no layout**

```typescript
// app/[lang]/layout.tsx -- adicionar header e footer
import Header from '@/src/components/layout/header'
import Footer from '@/src/components/layout/footer'

export default async function LocaleLayout({ children, params }: Props) {
  // ... código existente ...
  return (
    <NextIntlClientProvider messages={messages}>
      <Header />
      <main>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  )
}
```

> Para o layout do cadastre (sem header/footer), criar `app/cadastre/layout.tsx` separado.

- [ ] **Step 20.4: Criar app/cadastre/layout.tsx (sem header/footer público)**

```typescript
// app/cadastre/layout.tsx
export default function CadastreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 20.5: Commit**

```bash
git add src/components/layout/ app/[lang]/layout.tsx app/cadastre/layout.tsx
git commit -m "feat: header + footer integrados no layout Next.js"
```

---

## Task 21: Build Final + Verificação de Performance

**Files:**
- Nenhum novo arquivo -- verificação e ajustes finais

- [ ] **Step 21.1: Build de produção completo**

```bash
npx next build 2>&1 | tail -50
```

Expected: `✓ Compiled successfully`. Verificar tamanho dos chunks -- o First Load JS da rota `/` deve ser < 100 KB.

- [ ] **Step 21.2: Verificar bundle analyzer (opcional mas recomendado)**

```bash
npm install -D @next/bundle-analyzer
ANALYZE=true npx next build
```

Verificar que `mapbox-gl` NÃO aparece no bundle de servidor e está isolado no chunk client-only.

- [ ] **Step 21.3: Rodar servidor de produção localmente**

```bash
npx next start -p 3001
```

Navegar em `http://localhost:3001` e verificar:
- [ ] Home carrega sem flash de conteúdo
- [ ] Come/Fique/Passeie carregam com dados pré-renderizados
- [ ] Explore mostra loading state enquanto Mapbox carrega
- [ ] Login/painel redirecionam corretamente
- [ ] i18n: `/en/come` funciona, `/come` funciona (PT sem prefixo)

- [ ] **Step 21.4: Atualizar variáveis de ambiente no Vercel**

No painel Vercel do projeto `prj_3yXMgm98eol49odpyhWxyKuSeZq2`:
- Remover variáveis `VITE_*`
- Adicionar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- [ ] **Step 21.5: Commit final e push**

```bash
git add .
git commit -m "chore: ajustes finais -- build limpo para deploy"
git push origin [branch-de-migração]
```

- [ ] **Step 21.6: Verificar Lighthouse na preview URL**

Após deploy Vercel estar READY:
1. Abrir Chrome DevTools → Lighthouse
2. Rodar para Desktop + Mobile em `https://[preview-url].vercel.app`
3. Verificar: Performance > 90, FCP < 1.5s (antes: 3-4s)

- [ ] **Step 21.7: Só após Lighthouse confirmado -- apontar domínio para o novo deploy**

No Vercel: promover preview para produção ou fazer merge do branch de migração para main.

---

## Rollback Plan

Se algo der errado após o switch de DNS:

1. **Reverter DNS:** No Vercel, redirecionar o domínio `vivegostoso.com.br` para o deploy Vite anterior (ficou em histórico do Vercel)
2. **Branch:** O branch Vite (`main` original) continua intacto durante toda a migração
3. **Tempo de rollback:** < 5 minutos (apenas DNS/assign no painel Vercel)
4. **Sem downtime:** A migração pode ser testada em preview URL antes de qualquer switch

---

## Estimativa de Esforço

| Fase | Tasks | Estimativa |
|------|-------|-----------|
| Foundation (Tasks 1-5) | Config, Supabase SSR, i18n, Layouts | 4-6h |
| Páginas públicas simples (Tasks 6-7) | Conheca, Sobre, Home | 2-3h |
| Listagens + SSG (Tasks 8-10) | Come/Fique/Passeie, Negocio, Blog | 4-6h |
| Demais páginas públicas (Task 11-12) | Evento, Transfer, Apoie, Contrate, Explore | 3-4h |
| Área autenticada (Tasks 13-15) | Login, Prestador, Admin | 4-6h |
| Infra final (Tasks 16-18) | Sitemap, PWA, Env vars | 2-3h |
| Refatoração react-router (Tasks 19-20) | Header, Footer, navegação | 3-4h |
| Validação + Deploy (Task 21) | Build, Lighthouse, Deploy | 2-3h |
| **Total** | | **24-35h** |

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| i18next em server components quebra | Média | next-intl abstrai isso -- usar `getTranslations()` server-side |
| TanStack Query hydration mismatch | Baixa | `initialData` pattern evita mismatch (dados já existem no client) |
| Mapbox SSR crash | Baixa | `dynamic(..., { ssr: false })` isola completamente |
| Supabase auth cookie loss | Baixa | `@supabase/ssr` + middleware handle isso nativamente |
| Build time longo (generateStaticParams) | Média | Limitar a 50 slugs; demais ficam on-demand com ISR |
| Tailwind v4 incompatibilidade com PostCSS | Baixa | `@tailwindcss/postcss` é o caminho oficial |
| PWA service worker conflito | Baixa | `@ducanh2912/next-pwa` é a versão mantida ativamente |
| import.meta.env não substituído | Alta | Grep exaustivo na Task 18 garante 100% de cobertura |

---

## Self-Review -- Cobertura da Spec

- [x] **Performance/FCP:** SSG+ISR resolve o problema -- HTML pré-renderizado, zero bootstrap Vite
- [x] **Rotas mapeadas:** Todas as 29 páginas têm equivalente em `app/`
- [x] **SSR vs SSG:** Estratégia definida por página na tabela do cabeçalho
- [x] **Mapbox:** Task 12 -- `next/dynamic` com `ssr: false`
- [x] **Supabase Auth:** Tasks 3 + 13 -- `@supabase/ssr` + middleware
- [x] **i18n:** Task 4 -- next-intl com `localePrefix: 'as-needed'`
- [x] **Stripe:** Supabase Edge Functions não mudam -- apenas `import.meta.env` → `process.env`
- [x] **PWA:** Task 17 -- `@ducanh2912/next-pwa`
- [x] **TanStack Query:** Task 5 -- provider + `initialData` pattern
- [x] **Rollback:** Descrito acima
- [x] **Estimativa de esforço:** Tabela detalhada por fase
