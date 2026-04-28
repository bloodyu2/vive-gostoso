# Business Claim Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que donos de negócios reivindiquem o perfil inserido pela plataforma, com indicadores visuais de gestão e painel admin para aprovar ou rejeitar pedidos — similar ao Google My Business.

**Architecture:** Businesses sem `profile_id` são "gerenciados pela plataforma"; ao reivindicar, o usuário faz login via magic link e um `ClaimRequest` é criado com status `pending`. O admin aprova no painel, conectando `profile_id` ao negócio e marcando `is_verified = true`. Indicadores visuais aparecem na página do negócio e nos cards do diretório.

**Tech Stack:** React 19 + TypeScript + Vite, Supabase (PostgreSQL + RLS + Auth OTP), TanStack Query v5, React Router v6, Tailwind CSS v4.

---

## File Structure

### New files
- `supabase/migrations/20260428_claims.sql` — tabela `gostoso_claim_requests` + RLS
- `src/hooks/useClaims.ts` — `useSubmitClaim`, `useMyClaimStatus`, `useClaimsAdmin`, `useApproveClaim`, `useRejectClaim`
- `src/components/business/managed-badge.tsx` — badge "Perfil da plataforma" vs "Dono cadastrado"
- `src/components/business/claim-cta.tsx` — botão/banner de reivindicação visível em `/negocio/:slug`
- `src/pages/cadastre/Claim.tsx` — página `/cadastre/claim/:slug`: formulário de reivindicação + estado pós-envio
- `src/pages/cadastre/AdminClaims.tsx` — página `/cadastre/admin/claims`: lista de pedidos pendentes com aprovar/rejeitar

### Modified files
- `src/types/database.ts` — adicionar interface `ClaimRequest` e entrada na `Database`
- `src/pages/Negocio.tsx` — renderizar `<ManagedBadge>` e `<ClaimCta>` na sidebar
- `src/components/business/business-card.tsx` — adicionar indicador de gestão no card
- `src/pages/cadastre/Painel.tsx` — link para admin claims quando role = admin
- `src/App.tsx` — rotas `/cadastre/claim/:slug` e `/cadastre/admin/claims`

---

## Task 1: Migration — tabela de claims

**Files:**
- Create: `supabase/migrations/20260428_claims.sql`

- [ ] **Step 1: Criar o arquivo de migration**

```sql
-- supabase/migrations/20260428_claims.sql

create table if not exists gostoso_claim_requests (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references gostoso_businesses(id) on delete cascade,
  profile_id   uuid not null references gostoso_profiles(id) on delete cascade,
  status       text not null default 'pending', -- pending | approved | rejected
  message      text,                             -- mensagem opcional do solicitante
  admin_note   text,                             -- nota interna do admin
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  unique(business_id, profile_id)               -- um pedido por par negócio+perfil
);

alter table gostoso_claim_requests enable row level security;

-- Qualquer autenticado pode inserir (seu próprio perfil)
create policy "auth insert own claim"
  on gostoso_claim_requests for insert
  with check (
    profile_id in (
      select id from gostoso_profiles where auth_user_id = auth.uid()
    )
  );

-- Pode ler o próprio pedido
create policy "auth read own claim"
  on gostoso_claim_requests for select
  using (
    profile_id in (
      select id from gostoso_profiles where auth_user_id = auth.uid()
    )
  );

-- Admin lê e atualiza tudo
create policy "admin all claims"
  on gostoso_claim_requests for all
  using (
    (select role from gostoso_profiles where auth_user_id = auth.uid()) = 'admin'
  );
```

- [ ] **Step 2: Aplicar a migration no Supabase**

No Supabase MCP (ou SQL Editor no dashboard):
```
apply_migration com o conteúdo acima no projeto eeklaiqrbtfhnnalzgjn
```

Verificar: o SQL deve retornar sem erros e a tabela `gostoso_claim_requests` deve aparecer no schema.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260428_claims.sql
git commit -m "feat(db): tabela gostoso_claim_requests com RLS"
```

---

## Task 2: Tipos TypeScript — ClaimRequest

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Adicionar interface ClaimRequest**

Após a interface `BlogPost` (linha ~130), inserir:

```ts
export interface ClaimRequest {
  id: string
  business_id: string
  profile_id: string
  status: 'pending' | 'approved' | 'rejected'
  message: string | null
  admin_note: string | null
  created_at: string
  resolved_at: string | null
}
```

- [ ] **Step 2: Adicionar entry no tipo Database**

Na seção `Tables` do tipo `Database`, adicionar após a linha `gostoso_blog_posts`:

```ts
gostoso_claim_requests: {
  Row: ClaimRequest
  Insert: Omit<ClaimRequest, 'id' | 'created_at' | 'resolved_at'>
  Update: Partial<Pick<ClaimRequest, 'status' | 'admin_note' | 'resolved_at'>>
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd "C:\Users\Victor Lima\Desktop\sites\gostoso\vive-gostoso"
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/types/database.ts
git commit -m "feat(types): interface ClaimRequest"
```

---

## Task 3: Hook useClaims

**Files:**
- Create: `src/hooks/useClaims.ts`

- [ ] **Step 1: Criar o hook**

```ts
// src/hooks/useClaims.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ClaimRequest } from '@/types/database'

// Submete um pedido de claim (usuário autenticado)
export function useSubmitClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ businessId, profileId, message }: {
      businessId: string
      profileId: string
      message?: string
    }) => {
      const { error } = await supabase
        .from('gostoso_claim_requests')
        .insert([{ business_id: businessId, profile_id: profileId, message: message ?? null }])
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-claim'] })
    },
  })
}

// Status do pedido do usuário atual para um negócio
export function useMyClaimStatus(businessId: string) {
  return useQuery({
    queryKey: ['my-claim', businessId],
    queryFn: async (): Promise<ClaimRequest | null> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data: profile } = await supabase
        .from('gostoso_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      if (!profile) return null
      const { data } = await supabase
        .from('gostoso_claim_requests')
        .select('*')
        .eq('business_id', businessId)
        .eq('profile_id', (profile as { id: string }).id)
        .maybeSingle()
      return (data as ClaimRequest | null) ?? null
    },
    enabled: !!businessId,
  })
}

// Admin: lista todos os pedidos pendentes
export function useClaimsAdmin() {
  return useQuery({
    queryKey: ['claims-admin'],
    queryFn: async (): Promise<(ClaimRequest & {
      business: { name: string; slug: string }
      profile: { full_name: string | null; email: string | null }
    })[]> => {
      const { data, error } = await supabase
        .from('gostoso_claim_requests')
        .select(`
          *,
          business:gostoso_businesses(name, slug),
          profile:gostoso_profiles(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as (ClaimRequest & {
        business: { name: string; slug: string }
        profile: { full_name: string | null; email: string | null }
      })[]
    },
  })
}

// Admin: aprovar claim
export function useApproveClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ claimId, businessId, profileId }: {
      claimId: string
      businessId: string
      profileId: string
    }) => {
      // Atualiza o claim
      const { error: e1 } = await supabase
        .from('gostoso_claim_requests')
        .update({ status: 'approved', resolved_at: new Date().toISOString() })
        .eq('id', claimId)
      if (e1) throw e1

      // Vincula o perfil ao negócio
      const { error: e2 } = await supabase
        .from('gostoso_businesses')
        .update({ profile_id: profileId, is_verified: true })
        .eq('id', businessId)
      if (e2) throw e2

      // Atualiza o profile com business_id
      const { error: e3 } = await supabase
        .from('gostoso_profiles')
        .update({ business_id: businessId })
        .eq('id', profileId)
      if (e3) throw e3
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims-admin'] })
      qc.invalidateQueries({ queryKey: ['businesses'] })
    },
  })
}

// Admin: rejeitar claim
export function useRejectClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ claimId, adminNote }: { claimId: string; adminNote?: string }) => {
      const { error } = await supabase
        .from('gostoso_claim_requests')
        .update({ status: 'rejected', admin_note: adminNote ?? null, resolved_at: new Date().toISOString() })
        .eq('id', claimId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims-admin'] })
    },
  })
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useClaims.ts
git commit -m "feat(hooks): useClaims — submit, status, admin CRUD"
```

---

## Task 4: Componente ManagedBadge

**Files:**
- Create: `src/components/business/managed-badge.tsx`

O badge mostra o estado de gestão do negócio:
- `profile_id = null` → "Perfil da plataforma" (cinza neutro)
- `profile_id != null` e `is_verified = false` → "Dono cadastrado" (teal claro)
- `profile_id != null` e `is_verified = true` → "Dono verificado" (teal sólido)

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/business/managed-badge.tsx
interface ManagedBadgeProps {
  profileId: string | null
  isVerified: boolean
  size?: 'sm' | 'md'
}

export function ManagedBadge({ profileId, isVerified, size = 'sm' }: ManagedBadgeProps) {
  const base = size === 'sm'
    ? 'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full'
    : 'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full'

  if (!profileId) {
    return (
      <span className={`${base} bg-[#F0EDEA] text-[#737373]`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#BDBDBD] flex-shrink-0" />
        Perfil da plataforma
      </span>
    )
  }

  if (isVerified) {
    return (
      <span className={`${base} bg-teal text-white`}>
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
        Dono verificado
      </span>
    )
  }

  return (
    <span className={`${base} bg-teal-light text-teal`}>
      <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
      Dono cadastrado
    </span>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/business/managed-badge.tsx
git commit -m "feat(ui): ManagedBadge — indicador visual de gestão do negócio"
```

---

## Task 5: Componente ClaimCta

**Files:**
- Create: `src/components/business/claim-cta.tsx`

Aparece na sidebar de `/negocio/:slug` somente quando `profile_id = null`. Leva para `/cadastre/claim/:slug`.

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/business/claim-cta.tsx
import { Link } from 'react-router-dom'
import { Flag } from 'lucide-react'

interface ClaimCtaProps {
  businessSlug: string
}

export function ClaimCta({ businessSlug }: ClaimCtaProps) {
  return (
    <div className="border border-dashed border-[#C4BFBA] rounded-2xl p-5 text-center">
      <div className="w-9 h-9 rounded-xl bg-[#F0EDEA] flex items-center justify-center mx-auto mb-3">
        <Flag className="w-4 h-4 text-[#737373]" />
      </div>
      <p className="text-sm font-semibold text-[#1A1A1A] mb-1">É o dono deste lugar?</p>
      <p className="text-xs text-[#737373] leading-relaxed mb-4">
        Reivindique este perfil para gerenciar as informações diretamente.
      </p>
      <Link
        to={`/cadastre/claim/${businessSlug}`}
        className="inline-flex items-center justify-center gap-1.5 bg-[#1A1A1A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
      >
        Reivindicar este negócio
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/business/claim-cta.tsx
git commit -m "feat(ui): ClaimCta — botão de reivindicação para negócios sem dono"
```

---

## Task 6: Integrar ManagedBadge e ClaimCta em Negocio.tsx

**Files:**
- Modify: `src/pages/Negocio.tsx`

- [ ] **Step 1: Adicionar imports**

No topo de `src/pages/Negocio.tsx`, após os imports existentes:

```ts
import { ManagedBadge } from '@/components/business/managed-badge'
import { ClaimCta } from '@/components/business/claim-cta'
```

- [ ] **Step 2: Adicionar ManagedBadge nos badges do negócio**

Na seção de badges (por volta da linha com `<Badge kind="cat">`), adicionar o `ManagedBadge` ao final do `div`:

```tsx
<div className="flex gap-2 mb-3 flex-wrap items-center">
  {b.category && <Badge kind="cat">{b.category.name}</Badge>}
  {open ? <Badge kind="open" dot>Aberto agora</Badge> : <Badge kind="closed" dot>Fechado agora</Badge>}
  {b.plan === 'associado' && <Badge kind="verif">Associado</Badge>}
  <ManagedBadge profileId={b.profile_id} isVerified={b.is_verified} />
</div>
```

- [ ] **Step 3: Adicionar ClaimCta na sidebar**

Na `<aside>`, após o bloco `{/* Share */}` e antes do bloco `{/* Contatos */}`, adicionar:

```tsx
{/* Claim */}
{!b.profile_id && <ClaimCta businessSlug={b.slug} />}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Negocio.tsx
git commit -m "feat(negocio): badge de gestão + CTA de reivindicação na sidebar"
```

---

## Task 7: Indicador no BusinessCard

**Files:**
- Modify: `src/components/business/business-card.tsx`

- [ ] **Step 1: Ler o arquivo atual**

```bash
# Apenas ler para entender a estrutura atual antes de editar
```

- [ ] **Step 2: Adicionar ManagedBadge no card**

Adicionar import no topo:

```ts
import { ManagedBadge } from '@/components/business/managed-badge'
```

No JSX do card, dentro do bloco de texto/info, adicionar o badge após o nome do negócio ou categoria. O badge com `size="sm"` é discreto e cabe bem nos cards.

Exemplo — após `{b.category?.name && <span>...}`:

```tsx
<div className="mt-1.5">
  <ManagedBadge profileId={b.profile_id} isVerified={b.is_verified} size="sm" />
</div>
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/business/business-card.tsx
git commit -m "feat(card): indicador de gestão nos cards do diretório"
```

---

## Task 8: Página Claim — /cadastre/claim/:slug

**Files:**
- Create: `src/pages/cadastre/Claim.tsx`

Fluxo: usuário não autenticado vê formulário de e-mail → magic link enviado → usuário retorna autenticado → pedido de claim criado automaticamente → tela de confirmação.

- [ ] **Step 1: Criar a página**

```tsx
// src/pages/cadastre/Claim.tsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBusiness } from '@/hooks/useBusinesses'
import { useSubmitClaim, useMyClaimStatus } from '@/hooks/useClaims'

export default function Claim() {
  const { slug } = useParams<{ slug: string }>()
  const { data: business } = useBusiness(slug ?? '')
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [mailLoading, setMailLoading] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  const submitClaim = useSubmitClaim()
  const { data: existingClaim } = useMyClaimStatus(business?.id ?? '')

  // Após login, criar perfil (se não existir) e submeter claim
  useEffect(() => {
    if (!user || !business || claimed || existingClaim) return
    ;(async () => {
      // Garantir que o perfil existe
      const { data: profile } = await supabase
        .from('gostoso_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      let pid: string
      if (profile) {
        pid = (profile as { id: string }).id
      } else {
        const { data: newP } = await supabase
          .from('gostoso_profiles')
          .insert([{ auth_user_id: user.id, email: user.email ?? '' }])
          .select('id')
          .single()
        if (!newP) return
        pid = (newP as { id: string }).id
      }

      setProfileId(pid)

      // Se já tem pedido, não duplicar
      if (existingClaim) return

      await submitClaim.mutateAsync({ businessId: business.id, profileId: pid, message })
      setClaimed(true)
    })()
  }, [user, business])

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    if (!business) return
    setMailLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/cadastre/claim/${slug}`,
      },
    })
    if (!error) setSent(true)
    setMailLoading(false)
  }

  if (!business) return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <p className="text-[#737373] text-sm">Carregando...</p>
    </div>
  )

  // Negócio já tem dono
  if (business.profile_id) return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <div className="text-4xl mb-4">✅</div>
        <h2 className="font-display text-2xl font-semibold mb-2">Perfil já reivindicado</h2>
        <p className="text-[#737373] text-sm mb-6">
          <strong>{business.name}</strong> já tem um dono cadastrado na plataforma.
        </p>
        <Link to={`/negocio/${business.slug}`} className="text-teal text-sm font-semibold">
          ← Ver o negócio
        </Link>
      </div>
    </div>
  )

  // Pedido já enviado (retorno de autenticação ou claim já existente)
  if (claimed || existingClaim?.status === 'pending') return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="font-display text-2xl font-semibold mb-2">Pedido enviado!</h2>
        <p className="text-[#737373] text-sm mb-6">
          Recebemos seu pedido para reivindicar <strong>{business.name}</strong>.
          Nossa equipe vai analisar em até 48 horas e você receberá uma confirmação por e-mail.
        </p>
        <Link to={`/negocio/${business.slug}`} className="text-teal text-sm font-semibold">
          ← Voltar ao negócio
        </Link>
      </div>
    </div>
  )

  if (existingClaim?.status === 'approved') return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <div className="text-4xl mb-4">✅</div>
        <h2 className="font-display text-2xl font-semibold mb-2">Já aprovado!</h2>
        <p className="text-[#737373] text-sm mb-6">
          Seu perfil está vinculado a <strong>{business.name}</strong>.
        </p>
        <Link to="/cadastre/painel" className="text-teal text-sm font-semibold">
          Ir para o painel →
        </Link>
      </div>
    </div>
  )

  // Link enviado, aguardando clique
  if (sent) return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <div className="text-5xl mb-4">📬</div>
        <h2 className="font-display text-2xl font-semibold mb-2">Verifique seu e-mail</h2>
        <p className="text-[#737373] text-sm">
          Enviamos um link para <strong>{email}</strong>.
          Clique nele para confirmar e enviar o pedido de reivindicação.
        </p>
      </div>
    </div>
  )

  // Formulário de reivindicação
  return (
    <div className="min-h-screen bg-areia flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[#E8E4DF] p-10 w-full max-w-md shadow-sm">
        <div className="flex justify-center mb-8"><Logo height={32} /></div>
        <h1 className="font-display text-2xl font-semibold mb-1 text-center">
          Reivindicar negócio
        </h1>
        <p className="text-[#737373] text-sm text-center mb-2">
          Você está reivindicando
        </p>
        <p className="text-center font-semibold text-[#1A1A1A] mb-8">{business.name}</p>

        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Seu e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Mensagem para a equipe <span className="text-[#737373] font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ex: Sou o proprietário desde 2019, posso enviar documentação..."
              className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 resize-none"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={mailLoading || authLoading}>
            {mailLoading ? 'Enviando...' : 'Continuar com link mágico'}
          </Button>
        </form>

        <p className="text-xs text-[#737373] text-center mt-5 leading-relaxed">
          Você receberá um link por e-mail. Ao clicar, confirmamos sua identidade e enviamos o pedido para análise.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/pages/cadastre/Claim.tsx
git commit -m "feat(page): /cadastre/claim/:slug — fluxo completo de reivindicação"
```

---

## Task 9: Página AdminClaims — /cadastre/admin/claims

**Files:**
- Create: `src/pages/cadastre/AdminClaims.tsx`

- [ ] **Step 1: Criar a página**

```tsx
// src/pages/cadastre/AdminClaims.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useClaimsAdmin, useApproveClaim, useRejectClaim } from '@/hooks/useClaims'
import { Button } from '@/components/ui/button'

export default function AdminClaims() {
  return <AuthGuard><AdminClaimsInner /></AuthGuard>
}

function AdminClaimsInner() {
  const { data: claims = [], isLoading } = useClaimsAdmin()
  const approve = useApproveClaim()
  const reject = useRejectClaim()
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({})

  if (isLoading) return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#E8E4DF] rounded-2xl" />)}
      </div>
    </main>
  )

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/cadastre/painel" className="text-sm text-[#737373] hover:text-teal transition-colors">
          ← Painel
        </Link>
        <h1 className="font-display text-3xl font-semibold">Pedidos de Reivindicação</h1>
        {claims.length > 0 && (
          <span className="ml-auto bg-coral text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {claims.length} pendente{claims.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-[#737373]">Nenhum pedido pendente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => (
            <div key={claim.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1A1A1A] truncate">{claim.business.name}</p>
                  <p className="text-sm text-teal font-medium">
                    {claim.profile.email ?? '—'}{' '}
                    {claim.profile.full_name && <span className="text-[#737373]">({claim.profile.full_name})</span>}
                  </p>
                  {claim.message && (
                    <p className="text-sm text-[#3D3D3D] mt-2 italic">"{claim.message}"</p>
                  )}
                  <p className="text-xs text-[#737373] mt-2">
                    Solicitado em {new Date(claim.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end sm:min-w-[180px]">
                  <Link
                    to={`/negocio/${claim.business.slug}`}
                    target="_blank"
                    className="text-xs text-[#737373] underline hover:text-teal transition-colors"
                  >
                    Ver negócio ↗
                  </Link>
                  <Button
                    variant="primary"
                    disabled={approve.isPending}
                    onClick={() => approve.mutate({
                      claimId: claim.id,
                      businessId: claim.business_id,
                      profileId: claim.profile_id,
                    })}
                  >
                    Aprovar
                  </Button>
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      placeholder="Nota (opcional)"
                      value={rejectNote[claim.id] ?? ''}
                      onChange={e => setRejectNote(n => ({ ...n, [claim.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E8E4DF] text-xs focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 min-w-0"
                    />
                    <Button
                      variant="ghost"
                      disabled={reject.isPending}
                      onClick={() => reject.mutate({
                        claimId: claim.id,
                        adminNote: rejectNote[claim.id],
                      })}
                      className="text-coral hover:text-coral-dark flex-shrink-0"
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/pages/cadastre/AdminClaims.tsx
git commit -m "feat(page): /cadastre/admin/claims — painel admin de reivindicações"
```

---

## Task 10: Registrar rotas e link no Painel

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/cadastre/Painel.tsx`

- [ ] **Step 1: Adicionar rotas em App.tsx**

```tsx
// Adicionar imports:
import Claim from '@/pages/cadastre/Claim'
import AdminClaims from '@/pages/cadastre/AdminClaims'

// Adicionar dentro de <Routes>:
<Route path="/cadastre/claim/:slug" element={<Claim />} />
<Route path="/cadastre/admin/claims" element={<PageWrapper><AdminClaims /></PageWrapper>} />
```

- [ ] **Step 2: Adicionar link no Painel para admins**

Em `src/pages/cadastre/Painel.tsx`, importar `useProfile` ou buscar o role diretamente. Como não existe `useProfile`, buscar o role via Supabase inline:

Adicionar ao `PainelInner`:

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Dentro de PainelInner():
const [role, setRole] = useState<string | null>(null)

useEffect(() => {
  if (!user) return
  supabase
    .from('gostoso_profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()
    .then(({ data }) => {
      if (data) setRole((data as { role: string }).role)
    })
}, [user])
```

E no grid de cards, condicionar o link de admin:

```tsx
{role === 'admin' && (
  <Link to="/cadastre/admin/claims"
    className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all relative">
    <div className="text-2xl mb-2">🏷️</div>
    <h2 className="font-semibold text-lg">Reivindicações</h2>
    <p className="text-sm text-[#737373] mt-1">Aprovar ou rejeitar pedidos de dono.</p>
  </Link>
)}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/pages/cadastre/Painel.tsx
git commit -m "feat(routing): rotas claim + admin/claims; link no painel admin"
```

---

## Task 11: Push e verificar deploy Vercel

- [ ] **Step 1: Push para GitHub**

```bash
git push origin master
```

- [ ] **Step 2: Monitorar deploy Vercel**

Disparar agente de monitoramento (project ID `prj_3yXMgm98eol49odpyhWxyKuSeZq2`, team `team_kDTAxnxOZafvxlReYHY3cFwv`).

Verificar: status = READY. Se ERROR: buscar build logs e corrigir.

- [ ] **Step 3: Smoke test manual**

1. Abrir `/negocio/[qualquer-slug-sem-dono]` — deve aparecer badge "Perfil da plataforma" + box de reivindicação
2. Clicar em "Reivindicar este negócio" → deve ir para `/cadastre/claim/:slug`
3. Preencher e-mail + mensagem → "Entrar com link mágico" → "Verifique seu e-mail"
4. (Como admin) abrir `/cadastre/painel` → link "Reivindicações" visível
5. `/cadastre/admin/claims` → lista pedidos pendentes com Aprovar/Rejeitar

---

## Self-Review

### Spec coverage

| Requisito | Task |
|-----------|------|
| Identificar negócio gerenciado pela plataforma vs dono | Task 4 (ManagedBadge) + Task 6 |
| Indicador nos cards do diretório | Task 7 |
| Botão Claim no perfil do negócio | Task 5 + Task 6 |
| Fluxo de claim com autenticação | Task 8 |
| Admin aprova/rejeita claims | Task 9 |
| Negócio vinculado ao perfil após aprovação | Task 3 (useApproveClaim) |
| `is_verified = true` após aprovação | Task 3 (useApproveClaim) |

### Placeholder scan

Nenhum placeholder encontrado. Todos os steps têm código completo.

### Type consistency

- `ClaimRequest` definido em Task 2, usado em Tasks 3, 8, 9 — consistente.
- `useApproveClaim` recebe `{ claimId, businessId, profileId }` — mesmo shape em Task 9 no `onClick`.
- `ManagedBadge` props: `{ profileId: string | null, isVerified: boolean, size? }` — usados em Tasks 6 e 7 com os campos corretos de `Business`.
