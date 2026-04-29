# Login Comerciante + Admin Hub — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar a página de login para comerciantes com UX de boas-vindas e criar um hub de administração unificado com contadores de pendências por módulo.

**Architecture:** O hook `useProfile` centraliza a busca do perfil (role) do usuário autenticado, substituindo a busca inline do Painel.tsx. O `AdminGuard` usa esse hook para proteger as páginas de admin. O hub `/cadastre/admin` agrega contadores via `useAdminStats` e exibe cards de acesso rápido. O Login é redesenhado com header teal, proposta de valor e fluxo de magic link mais claro.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Supabase JS, React Router v6, Tailwind CSS v4 (tokens via `@theme`)

---

## File Map

**Criar:**
- `src/hooks/useProfile.ts` — hook centralizado que busca `gostoso_profiles` do usuário logado
- `src/components/auth/admin-guard.tsx` — redireciona não-admins para `/cadastre/painel`
- `src/hooks/useAdminStats.ts` — busca contadores de pendências (reviews, claims, services, jobs)
- `src/pages/cadastre/Admin.tsx` — hub admin com cards de módulo e contadores
- `docs/superpowers/plans/2026-04-28-login-admin-hub.md` — este arquivo

**Modificar:**
- `src/pages/cadastre/Login.tsx` — redesign completo da UI
- `src/pages/cadastre/Painel.tsx` — trocar fetch inline por `useProfile`
- `src/pages/cadastre/AdminClaims.tsx` — trocar `AuthGuard` por `AdminGuard`
- `src/pages/cadastre/AdminReviews.tsx` — trocar `AuthGuard` por `AdminGuard`
- `src/App.tsx` — adicionar rota `/cadastre/admin`

---

## Task 0: Criar usuário admin no Supabase

**Pré-requisito manual — não é código.**

- [ ] **Step 1: Abrir Supabase Authentication > Users**

  Acessar: `https://supabase.com/dashboard/project/wppsmvgbagalczoardfl/auth/users`

- [ ] **Step 2: Criar usuário**

  Clicar em "Add user" → "Create new user"
  - Email: `victor.lima@balaio.net`
  - Password: qualquer senha temporária (não usada — login é via magic link)
  - Marcar "Auto confirm user"

  Copiar o UUID gerado (ex: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

- [ ] **Step 3: Inserir perfil admin via SQL Editor**

  Acessar: `https://supabase.com/dashboard/project/wppsmvgbagalczoardfl/sql/new`

  ```sql
  INSERT INTO gostoso_profiles (auth_user_id, role)
  VALUES ('[UUID_DO_PASSO_2]', 'admin')
  ON CONFLICT (auth_user_id) DO UPDATE SET role = 'admin';
  ```

- [ ] **Step 4: Verificar**

  ```sql
  SELECT auth_user_id, role FROM gostoso_profiles WHERE role = 'admin';
  ```

  Esperado: 1 linha com o UUID inserido.

---

## Task 1: Hook `useProfile`

**Files:**
- Create: `src/hooks/useProfile.ts`
- Modify: `src/pages/cadastre/Painel.tsx` (linhas 14-26 — remover fetch inline)

- [ ] **Step 1: Criar o hook**

  ```typescript
  // src/hooks/useProfile.ts
  import { useQuery } from '@tanstack/react-query'
  import { supabase } from '@/lib/supabase'
  import { useAuth } from '@/hooks/useAuth'

  export interface GostsoProfile {
    id: string
    auth_user_id: string
    role: 'admin' | 'owner' | null
    full_name: string | null
    business_id: string | null
    created_at: string
  }

  export function useProfile() {
    const { user } = useAuth()
    return useQuery<GostsoProfile | null>({
      queryKey: ['profile', user?.id],
      enabled: !!user,
      staleTime: 5 * 60 * 1000,
      queryFn: async () => {
        if (!user) return null
        const { data, error } = await supabase
          .from('gostoso_profiles')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle()
        if (error) throw error
        return data
      },
    })
  }
  ```

- [ ] **Step 2: Atualizar Painel.tsx para usar o hook**

  Substituir o `useEffect` manual do Painel (linhas 14-26) pelo hook:

  ```typescript
  // src/pages/cadastre/Painel.tsx
  import { useEffect, useState } from 'react'  // remover estas imports não mais usadas
  import { Link } from 'react-router-dom'
  import { AuthGuard } from '@/components/auth/auth-guard'
  import { useAuth } from '@/hooks/useAuth'
  import { useProfile } from '@/hooks/useProfile'
  import { Button } from '@/components/ui/button'

  export default function Painel() {
    return <AuthGuard><PainelInner /></AuthGuard>
  }

  function PainelInner() {
    const { user, signOut } = useAuth()
    const { data: profile } = useProfile()
    const role = profile?.role ?? null

    return (
      <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-display text-3xl font-semibold">Painel do Prestador</h1>
            <p className="text-sm text-[#737373] mt-1">{user?.email}</p>
          </div>
          <Button variant="ghost" onClick={signOut}>Sair</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/cadastre/perfil" className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="text-2xl mb-2">🏠</div>
            <h2 className="font-semibold text-lg">Meu Negócio</h2>
            <p className="text-sm text-[#737373] mt-1">Edite as informações do seu negócio.</p>
          </Link>
          <Link to="/cadastre/preview" className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="text-2xl mb-2">👁</div>
            <h2 className="font-semibold text-lg">Preview</h2>
            <p className="text-sm text-[#737373] mt-1">Como seu negócio aparece no diretório.</p>
          </Link>
          {role === 'admin' && (
            <Link
              to="/cadastre/admin"
              className="bg-teal/10 border border-teal/20 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all col-span-full"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <h2 className="font-semibold text-lg text-teal">Painel Admin</h2>
              <p className="text-sm text-[#737373] mt-1">Moderar avaliações, reivindicações, serviços e vagas.</p>
            </Link>
          )}
        </div>
      </main>
    )
  }
  ```

- [ ] **Step 3: Verificar que o app builda sem erros**

  ```bash
  cd gostoso/vive-gostoso && npx tsc --noEmit 2>&1 | head -30
  ```

  Esperado: sem erros de TypeScript.

- [ ] **Step 4: Commit**

  ```bash
  git add src/hooks/useProfile.ts src/pages/cadastre/Painel.tsx
  git commit -m "feat: add useProfile hook, simplify Painel role check"
  ```

---

## Task 2: AdminGuard

**Files:**
- Create: `src/components/auth/admin-guard.tsx`
- Modify: `src/pages/cadastre/AdminClaims.tsx` (linha 8)
- Modify: `src/pages/cadastre/AdminReviews.tsx` (linha 8)

- [ ] **Step 1: Criar o componente**

  ```typescript
  // src/components/auth/admin-guard.tsx
  import { Navigate } from 'react-router-dom'
  import { useAuth } from '@/hooks/useAuth'
  import { useProfile } from '@/hooks/useProfile'

  export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth()
    const { data: profile, isLoading: profileLoading } = useProfile()

    if (authLoading || profileLoading) return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
    if (!user) return <Navigate to="/cadastre" replace />
    if (profile?.role !== 'admin') return <Navigate to="/cadastre/painel" replace />
    return <>{children}</>
  }
  ```

- [ ] **Step 2: Aplicar AdminGuard em AdminClaims**

  Em `src/pages/cadastre/AdminClaims.tsx`, linha 1-2, adicionar import e trocar `AuthGuard` por `AdminGuard`:

  ```typescript
  import { AdminGuard } from '@/components/auth/admin-guard'
  // remover: import { AuthGuard } from '@/components/auth/auth-guard'

  export default function AdminClaims() {
    return <AdminGuard><AdminClaimsInner /></AdminGuard>
  }
  ```

- [ ] **Step 3: Aplicar AdminGuard em AdminReviews**

  Em `src/pages/cadastre/AdminReviews.tsx`, mesma troca:

  ```typescript
  import { AdminGuard } from '@/components/auth/admin-guard'
  // remover: import { AuthGuard } from '@/components/auth/auth-guard'

  export default function AdminReviews() {
    return <AdminGuard><AdminReviewsInner /></AdminGuard>
  }
  ```

- [ ] **Step 4: Verificar TypeScript**

  ```bash
  npx tsc --noEmit 2>&1 | head -20
  ```

  Esperado: sem erros.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/auth/admin-guard.tsx src/pages/cadastre/AdminClaims.tsx src/pages/cadastre/AdminReviews.tsx
  git commit -m "feat: add AdminGuard, protect admin pages from non-admins"
  ```

---

## Task 3: Hook `useAdminStats`

**Files:**
- Create: `src/hooks/useAdminStats.ts`

- [ ] **Step 1: Criar o hook**

  ```typescript
  // src/hooks/useAdminStats.ts
  import { useQuery } from '@tanstack/react-query'
  import { supabase } from '@/lib/supabase'
  import { useProfile } from '@/hooks/useProfile'

  export interface AdminStats {
    pendingReviews: number
    pendingClaims: number
    pendingServices: number
    pendingJobs: number
    totalBusinesses: number
  }

  export function useAdminStats() {
    const { data: profile } = useProfile()
    return useQuery<AdminStats>({
      queryKey: ['admin-stats'],
      enabled: profile?.role === 'admin',
      staleTime: 60 * 1000,
      queryFn: async () => {
        const [reviews, claims, services, jobs, businesses] = await Promise.all([
          supabase
            .from('gostoso_reviews')
            .select('id', { count: 'exact', head: true })
            .is('approved', null),
          supabase
            .from('gostoso_claims')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase
            .from('gostoso_service_listings')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', false),
          supabase
            .from('gostoso_job_listings')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', false),
          supabase
            .from('gostoso_businesses')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true),
        ])
        return {
          pendingReviews: reviews.count ?? 0,
          pendingClaims: claims.count ?? 0,
          pendingServices: services.count ?? 0,
          pendingJobs: jobs.count ?? 0,
          totalBusinesses: businesses.count ?? 0,
        }
      },
    })
  }
  ```

- [ ] **Step 2: Verificar TypeScript**

  ```bash
  npx tsc --noEmit 2>&1 | head -20
  ```

  Esperado: sem erros.

- [ ] **Step 3: Commit**

  ```bash
  git add src/hooks/useAdminStats.ts
  git commit -m "feat: add useAdminStats hook for admin dashboard counts"
  ```

---

## Task 4: Redesign da página Login

**Files:**
- Modify: `src/pages/cadastre/Login.tsx` (reescrita completa)

A nova página tem: header teal com logo, três cards de proposta de valor, input de email + botão, estado pós-envio.

- [ ] **Step 1: Reescrever Login.tsx**

  ```typescript
  // src/pages/cadastre/Login.tsx
  import { useState } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { Logo } from '@/components/brand/logo'
  import { Button } from '@/components/ui/button'
  import { supabase } from '@/lib/supabase'
  import { useAuth } from '@/hooks/useAuth'

  const VALUE_PROPS = [
    { icon: '🏠', title: 'Seu perfil completo', desc: 'Fotos, horários, contato e localização no mapa.' },
    { icon: '⭐', title: 'Avaliações reais', desc: 'Gerencie o que clientes dizem sobre seu negócio.' },
    { icon: '📊', title: 'Visibilidade local', desc: 'Apareça para turistas e moradores que buscam o que você oferece.' },
  ]

  export default function Login() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { user } = useAuth()

    if (user) { navigate('/cadastre/painel'); return null }

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      setLoading(true)
      setError(null)
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/cadastre/painel` },
      })
      if (err) setError('Não foi possível enviar o link. Tente novamente.')
      else setSent(true)
      setLoading(false)
    }

    return (
      <div className="min-h-screen bg-areia flex flex-col">
        {/* Header */}
        <div className="bg-teal px-5 py-8 text-center">
          <Logo height={36} className="mx-auto mb-3 brightness-0 invert" />
          <h1 className="font-display text-2xl font-bold text-white">Área dos Negócios</h1>
          <p className="text-white/75 text-sm mt-1">Gerencie seu negócio no Vive Gostoso</p>
        </div>

        <div className="flex-1 flex flex-col items-center px-5 py-10 max-w-md mx-auto w-full">
          {sent ? (
            <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full text-center shadow-sm">
              <div className="text-6xl mb-4">📬</div>
              <h2 className="font-display text-2xl font-semibold mb-2 text-[#1A1A1A]">Link enviado!</h2>
              <p className="text-[#737373] text-sm leading-relaxed">
                Enviamos um link de acesso para <br />
                <strong className="text-[#1A1A1A]">{email}</strong>.
              </p>
              <p className="text-[#B0A99F] text-xs mt-4">
                Verifique sua caixa de entrada (e o spam). O link expira em 1 hora.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-xs text-teal underline mt-6 hover:text-teal-dark transition-colors"
              >
                Usar outro e-mail
              </button>
            </div>
          ) : (
            <>
              {/* Value props */}
              <div className="grid grid-cols-3 gap-3 w-full mb-8">
                {VALUE_PROPS.map(vp => (
                  <div key={vp.title} className="bg-white rounded-2xl border border-[#E8E4DF] p-4 text-center">
                    <div className="text-2xl mb-1">{vp.icon}</div>
                    <p className="text-xs font-semibold text-[#1A1A1A] leading-snug">{vp.title}</p>
                  </div>
                ))}
              </div>

              {/* Login form */}
              <div className="bg-white rounded-2xl border border-[#E8E4DF] p-8 w-full shadow-sm">
                <h2 className="font-display text-xl font-semibold mb-1 text-[#1A1A1A]">Entrar no painel</h2>
                <p className="text-[#737373] text-sm mb-6">
                  Informe seu e-mail e receba um link de acesso — sem senha.
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                  />
                  {error && (
                    <p className="text-xs text-coral">{error}</p>
                  )}
                  <Button variant="primary" className="w-full" disabled={loading}>
                    {loading ? 'Enviando...' : 'Receber link de acesso'}
                  </Button>
                </form>
                <p className="text-xs text-[#B0A99F] text-center mt-4">
                  Ainda não tem cadastro?{' '}
                  <a href="mailto:contato@balaio.net" className="text-teal underline hover:text-teal-dark transition-colors">
                    Fale com a gente
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 2: Verificar TypeScript**

  ```bash
  npx tsc --noEmit 2>&1 | head -20
  ```

  Esperado: sem erros.

- [ ] **Step 3: Testar visualmente no browser**

  ```bash
  npm run dev
  ```

  Navegar para `http://localhost:5173/cadastre` e confirmar:
  - Header teal com logo
  - 3 cards de proposta de valor
  - Formulário com input + botão
  - Ao enviar: tela de confirmação com email preenchido

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/cadastre/Login.tsx
  git commit -m "feat: redesign Login page with brand header and value props"
  ```

---

## Task 5: Admin Hub page

**Files:**
- Create: `src/pages/cadastre/Admin.tsx`
- Modify: `src/App.tsx` (adicionar rota `/cadastre/admin`)

- [ ] **Step 1: Criar Admin.tsx**

  ```typescript
  // src/pages/cadastre/Admin.tsx
  import { Link } from 'react-router-dom'
  import { ArrowLeft } from 'lucide-react'
  import { AdminGuard } from '@/components/auth/admin-guard'
  import { useAdminStats } from '@/hooks/useAdminStats'
  import { useAuth } from '@/hooks/useAuth'
  import { Button } from '@/components/ui/button'

  export default function Admin() {
    return <AdminGuard><AdminInner /></AdminGuard>
  }

  interface AdminCardProps {
    emoji: string
    title: string
    desc: string
    count?: number
    to: string
    urgent?: boolean
  }

  function AdminCard({ emoji, title, desc, count, to, urgent }: AdminCardProps) {
    return (
      <Link
        to={to}
        className={`bg-white border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-4 ${
          urgent && (count ?? 0) > 0 ? 'border-coral/30 bg-coral/5' : 'border-[#E8E4DF]'
        }`}
      >
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg text-[#1A1A1A]">{title}</h2>
            {count !== undefined && count > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                urgent ? 'bg-coral text-white' : 'bg-teal/15 text-teal'
              }`}>
                {count}
              </span>
            )}
          </div>
          <p className="text-sm text-[#737373] mt-0.5">{desc}</p>
        </div>
        <div className="text-[#B0A99F] self-center">→</div>
      </Link>
    )
  }

  function AdminInner() {
    const { user, signOut } = useAuth()
    const { data: stats, isLoading } = useAdminStats()

    return (
      <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <Link
              to="/cadastre/painel"
              className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Painel
            </Link>
            <h1 className="font-display text-3xl font-semibold text-[#1A1A1A]">Admin</h1>
            <p className="text-sm text-[#737373] mt-1">{user?.email}</p>
          </div>
          <Button variant="ghost" onClick={signOut} className="mt-7">Sair</Button>
        </div>

        {/* Stats overview */}
        {!isLoading && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <div className="bg-white border border-[#E8E4DF] rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-teal">{stats.totalBusinesses}</p>
              <p className="text-xs text-[#737373] mt-1">Negócios ativos</p>
            </div>
            <div className={`border rounded-2xl p-4 text-center ${stats.pendingReviews > 0 ? 'bg-coral/5 border-coral/20' : 'bg-white border-[#E8E4DF]'}`}>
              <p className={`text-2xl font-bold ${stats.pendingReviews > 0 ? 'text-coral' : 'text-[#1A1A1A]'}`}>{stats.pendingReviews}</p>
              <p className="text-xs text-[#737373] mt-1">Avaliações pendentes</p>
            </div>
            <div className={`border rounded-2xl p-4 text-center ${stats.pendingClaims > 0 ? 'bg-ocre/10 border-ocre/20' : 'bg-white border-[#E8E4DF]'}`}>
              <p className={`text-2xl font-bold ${stats.pendingClaims > 0 ? 'text-ocre' : 'text-[#1A1A1A]'}`}>{stats.pendingClaims}</p>
              <p className="text-xs text-[#737373] mt-1">Reivindicações</p>
            </div>
            <div className={`border rounded-2xl p-4 text-center ${(stats.pendingServices + stats.pendingJobs) > 0 ? 'bg-teal/5 border-teal/20' : 'bg-white border-[#E8E4DF]'}`}>
              <p className={`text-2xl font-bold ${(stats.pendingServices + stats.pendingJobs) > 0 ? 'text-teal' : 'text-[#1A1A1A]'}`}>{stats.pendingServices + stats.pendingJobs}</p>
              <p className="text-xs text-[#737373] mt-1">CONTRATE a revisar</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-[#E8E4DF] rounded-2xl h-20" />
            ))}
          </div>
        )}

        {/* Admin modules */}
        <div className="space-y-3">
          <AdminCard
            emoji="⭐"
            title="Avaliações"
            desc="Aprovar ou rejeitar avaliações pendentes de publicação."
            count={stats?.pendingReviews}
            to="/cadastre/admin/reviews"
            urgent
          />
          <AdminCard
            emoji="🏷️"
            title="Reivindicações"
            desc="Verificar pedidos de donos de negócio e aprovar vínculo."
            count={stats?.pendingClaims}
            to="/cadastre/admin/claims"
            urgent
          />
          <AdminCard
            emoji="🔧"
            title="Serviços (CONTRATE)"
            desc="Revisar e publicar serviços submetidos por moradores."
            count={stats?.pendingServices}
            to="/cadastre/admin/services"
          />
          <AdminCard
            emoji="💼"
            title="Vagas (CONTRATE)"
            desc="Revisar e publicar vagas abertas por negócios."
            count={stats?.pendingJobs}
            to="/cadastre/admin/jobs"
          />
          <AdminCard
            emoji="🏢"
            title="Negócios"
            desc="Ver e editar todos os negócios cadastrados na plataforma."
            to="/cadastre/admin/businesses"
          />
        </div>

        <p className="text-xs text-[#B0A99F] text-center mt-8">
          Módulos de admin de serviços, vagas e negócios — em breve.
        </p>
      </main>
    )
  }
  ```

- [ ] **Step 2: Adicionar rota no App.tsx**

  Em `src/App.tsx`, após a linha de `AdminReviews` (linha 57), adicionar:

  ```typescript
  // Adicionar import no topo (junto com os outros imports de cadastre):
  import Admin from '@/pages/cadastre/Admin'

  // Adicionar rota (após linha 58, antes do `path="*"`):
  <Route path="/cadastre/admin" element={<PageWrapper><Admin /></PageWrapper>} />
  ```

- [ ] **Step 3: Verificar TypeScript e que o app builda**

  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```

  Esperado: sem erros de TypeScript.

- [ ] **Step 4: Testar visualmente**

  Com usuário admin logado, navegar para `http://localhost:5173/cadastre/admin`.

  Verificar:
  - Contadores aparecem (podem ser 0 se não houver pendências)
  - Cards de módulo renderizam com contadores
  - Seta "→" aparece em cada card
  - Link "← Painel" funciona
  - Com usuário não-admin, a rota redireciona para `/cadastre/painel`

- [ ] **Step 5: Commit**

  ```bash
  git add src/pages/cadastre/Admin.tsx src/App.tsx
  git commit -m "feat: add Admin hub page with stats and module cards"
  ```

---

## Task 6: Push e deploy

- [ ] **Step 1: Verificar build limpo**

  ```bash
  npx tsc --noEmit 2>&1
  ```

  Esperado: zero erros.

- [ ] **Step 2: Push**

  ```bash
  git push origin main
  ```

- [ ] **Step 3: Monitorar deploy Vercel**

  Verificar em `https://vercel.com/victor-limas-projects-a5f7c94a/vive-gostoso` que o deploy fica READY sem erros de build.

---

## Self-Review

**Spec coverage:**
- [x] Criar usuário admin no Supabase (Task 0)
- [x] `useProfile` hook centralizado (Task 1)
- [x] `AdminGuard` protegendo admin pages (Task 2)
- [x] `useAdminStats` com contadores por módulo (Task 3)
- [x] Login redesenhado para comerciante (Task 4)
- [x] Admin hub com stats + cards de módulo (Task 5)
- [x] Rotas atualizadas no App.tsx (Task 5 Step 2)

**Notas de implementação:**
- Os cards de Admin para serviços/vagas/negócios linkam para rotas (`/cadastre/admin/services`, etc.) que ainda não existem — a nota de rodapé "em breve" foi adicionada para deixar isso explícito.
- O Logo no header do Login usa `className` para `brightness-0 invert` (filtro CSS) para renderizar em branco sobre o fundo teal — verificar se o componente Logo aceita className ou se precisa de wrapper.
- `useAdminStats` usa `.is('approved', null)` para reviews pendentes (approved IS NULL) — confirmar que esse é o estado correto da tabela `gostoso_reviews`.
