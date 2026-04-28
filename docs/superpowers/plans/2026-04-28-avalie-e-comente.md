# Avalie e Comente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public review/comment system to each business profile page, with 1-5 star rating + text, pending manual admin approval before any review is displayed.

**Architecture:** Anonymous visitors submit reviews (stored as `approved=false`). Admin moderates from `/cadastre/admin/reviews`. Approved reviews display on the business profile below the photos section. Average star rating shows in the header area once at least one approved review exists.

**Tech Stack:** React 19 + TypeScript, TanStack Query v5, Supabase (PostgreSQL + RLS), Tailwind CSS v4

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `supabase/migrations/20260428_reviews.sql` | Table + RLS policies |
| Create | `src/types/reviews.ts` | TypeScript types for Review |
| Create | `src/hooks/useReviews.ts` | 4 hooks: list, submit, pending (admin), moderate (admin) |
| Create | `src/components/reviews/star-rating.tsx` | Reusable star display + interactive star input |
| Create | `src/components/reviews/review-form.tsx` | Submit form (stars + comment + author name optional) |
| Create | `src/components/reviews/review-list.tsx` | List of approved reviews with average |
| Modify | `src/pages/Negocio.tsx` | Import and render ReviewList + ReviewForm below photos |
| Create | `src/pages/cadastre/AdminReviews.tsx` | Admin moderation table: approve / reject |
| Modify | `src/pages/cadastre/Painel.tsx` | Add admin card linking to `/cadastre/admin/reviews` |
| Modify | `src/App.tsx` | Register route `/cadastre/admin/reviews` |

---

### Task 1: Create Supabase Migration

**Files:**
- Create: `supabase/migrations/20260428_reviews.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/20260428_reviews.sql

create table if not exists gostoso_reviews (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references gostoso_businesses(id) on delete cascade,
  author_name text,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_gostoso_reviews_business
  on gostoso_reviews(business_id, approved);

-- RLS
alter table gostoso_reviews enable row level security;

-- Public: read only approved reviews
create policy "public_read_approved_reviews"
  on gostoso_reviews for select
  using (approved = true);

-- Public: insert pending reviews (approved must be false)
create policy "public_insert_review"
  on gostoso_reviews for insert
  with check (approved = false);

-- Admin: full access via service role (used in admin hooks with supabase client that has no RLS restriction)
-- Note: admin moderation is done via supabase anon key + RLS bypass using a separate policy
-- that checks gostoso_profiles role = 'admin' for the authenticated user.
create policy "admin_full_access"
  on gostoso_reviews for all
  using (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from gostoso_profiles
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );
```

- [ ] **Step 2: Run migration in Supabase SQL Editor**

Go to Supabase Dashboard → SQL Editor → paste content of `20260428_reviews.sql` → Run.
Verify with: `select count(*) from gostoso_reviews;` — should return `0`.

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/reviews.ts`

- [ ] **Step 1: Write the types file**

```typescript
// src/types/reviews.ts

export interface Review {
  id: string
  business_id: string
  author_name: string | null
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  approved: boolean
  created_at: string
}

export interface ReviewInsert {
  business_id: string
  author_name?: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd gostoso/vive-gostoso
npx tsc --noEmit
```
Expected: no errors.

---

### Task 3: Data Hooks

**Files:**
- Create: `src/hooks/useReviews.ts`

- [ ] **Step 1: Write the hooks file**

```typescript
// src/hooks/useReviews.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Review, ReviewInsert } from '@/types/reviews'

/** Approved reviews for a business — public */
export function useReviews(businessId: string) {
  return useQuery({
    queryKey: ['reviews', businessId],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from('gostoso_reviews')
        .select('*')
        .eq('business_id', businessId)
        .eq('approved', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Review[]
    },
    enabled: !!businessId,
  })
}

/** Submit a new review — inserts with approved=false */
export function useSubmitReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (review: ReviewInsert) => {
      const { error } = await supabase
        .from('gostoso_reviews')
        .insert({ ...review, approved: false })
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['reviews', variables.business_id] })
    },
  })
}

/** All pending reviews — admin only (relies on admin_full_access RLS policy) */
export function useAdminPendingReviews() {
  return useQuery({
    queryKey: ['reviews', 'admin', 'pending'],
    queryFn: async (): Promise<(Review & { business_name?: string })[]> => {
      const { data, error } = await supabase
        .from('gostoso_reviews')
        .select('*, business:gostoso_businesses(name)')
        .eq('approved', false)
        .order('created_at', { ascending: true })
      if (error) throw error
      return ((data ?? []) as unknown as (Review & { business: { name: string } })[]).map(r => ({
        ...r,
        business_name: r.business?.name,
      }))
    },
  })
}

/** Approve or reject a review — admin only */
export function useModerateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      if (approve) {
        const { error } = await supabase
          .from('gostoso_reviews')
          .update({ approved: true })
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('gostoso_reviews')
          .delete()
          .eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', 'admin', 'pending'] })
    },
  })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

---

### Task 4: StarRating Component

**Files:**
- Create: `src/components/reviews/star-rating.tsx`

- [ ] **Step 1: Write the component**

```typescript
// src/components/reviews/star-rating.tsx
import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

export function StarRating({ value, onChange, size = 'md', readonly = false }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5'
  const active = readonly ? value : (hovered || value)

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n as 1 | 2 | 3 | 4 | 5)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${sz} flex-shrink-0 transition-transform ${!readonly ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          aria-label={readonly ? `${n} estrelas` : `Avaliar ${n} estrelas`}
        >
          <svg viewBox="0 0 20 20" fill={n <= active ? '#C97D2A' : 'none'} stroke={n <= active ? '#C97D2A' : '#D1C9BF'} strokeWidth="1.5" className="w-full h-full">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

---

### Task 5: ReviewForm Component

**Files:**
- Create: `src/components/reviews/review-form.tsx`

- [ ] **Step 1: Write the component**

```typescript
// src/components/reviews/review-form.tsx
import { useState } from 'react'
import { StarRating } from './star-rating'
import { useSubmitReview } from '@/hooks/useReviews'

interface ReviewFormProps {
  businessId: string
}

export function ReviewForm({ businessId }: ReviewFormProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | 0>(0)
  const [comment, setComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { mutate, isPending } = useSubmitReview()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) return
    mutate(
      { business_id: businessId, rating: rating as 1 | 2 | 3 | 4 | 5, comment: comment.trim() || undefined, author_name: authorName.trim() || undefined },
      { onSuccess: () => setSubmitted(true) }
    )
  }

  if (submitted) {
    return (
      <div className="bg-teal-light border border-teal/20 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">🙏</div>
        <p className="font-semibold text-teal">Avaliação enviada!</p>
        <p className="text-sm text-[#737373] mt-1">Ela aparece aqui após aprovação.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E8E4DF] rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-[#1A1A1A]">Deixe sua avaliação</h3>

      <div>
        <label className="text-sm text-[#737373] block mb-1.5">Sua nota *</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="text-sm text-[#737373] block mb-1.5">Comentário (opcional)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Conte sua experiência..."
          rows={3}
          maxLength={500}
          className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition"
        />
        <p className="text-xs text-[#B0A99F] text-right mt-0.5">{comment.length}/500</p>
      </div>

      <div>
        <label className="text-sm text-[#737373] block mb-1.5">Seu nome (opcional)</label>
        <input
          type="text"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder="Como quer ser identificado?"
          maxLength={80}
          className="w-full border border-[#E8E4DF] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition"
        />
      </div>

      <button
        type="submit"
        disabled={!rating || isPending}
        className="w-full bg-teal text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-teal-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

---

### Task 6: ReviewList Component

**Files:**
- Create: `src/components/reviews/review-list.tsx`

- [ ] **Step 1: Write the component**

```typescript
// src/components/reviews/review-list.tsx
import { StarRating } from './star-rating'
import { useReviews } from '@/hooks/useReviews'

interface ReviewListProps {
  businessId: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ReviewList({ businessId }: ReviewListProps) {
  const { data: reviews = [], isLoading } = useReviews(businessId)

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="animate-pulse bg-[#E8E4DF] rounded-2xl h-20" />
      ))}
    </div>
  )

  if (!reviews.length) return (
    <p className="text-sm text-[#B0A99F] text-center py-4">
      Nenhuma avaliação ainda. Seja o primeiro a avaliar!
    </p>
  )

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-3xl text-[#1A1A1A]">{avg.toFixed(1)}</span>
        <div>
          <StarRating value={Math.round(avg)} readonly size="sm" />
          <p className="text-xs text-[#737373] mt-0.5">{reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</p>
        </div>
      </div>

      {reviews.map(r => (
        <div key={r.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="font-semibold text-sm text-[#1A1A1A]">{r.author_name ?? 'Visitante'}</p>
              <p className="text-xs text-[#B0A99F]">{formatDate(r.created_at)}</p>
            </div>
            <StarRating value={r.rating} readonly size="sm" />
          </div>
          {r.comment && <p className="text-sm text-[#3D3D3D] leading-relaxed">{r.comment}</p>}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

---

### Task 7: Wire Up in Negocio.tsx

**Files:**
- Modify: `src/pages/Negocio.tsx`

- [ ] **Step 1: Add imports at top of file**

Find the import block at the top of `src/pages/Negocio.tsx` (after line 9 — the `Lightbox` import) and add:

```typescript
import { ReviewList } from '@/components/reviews/review-list'
import { ReviewForm } from '@/components/reviews/review-form'
```

- [ ] **Step 2: Add reviews section after photos in the main column**

Find this block in `Negocio.tsx` (around line 122-124) that closes the photos section:

```tsx
          )}
        </div>

        {/* Sidebar */}
```

Replace it with:

```tsx
          )}

          {/* Avaliações */}
          <div className="mt-8">
            <h2 className="font-display font-semibold text-2xl mb-5">Avaliações</h2>
            <ReviewList businessId={b.id} />
          </div>

          {/* Avaliar */}
          <div className="mt-6">
            <ReviewForm businessId={b.id} />
          </div>
        </div>

        {/* Sidebar */}
```

- [ ] **Step 3: Verify TypeScript and check no regressions**

```bash
npx tsc --noEmit
```
Expected: no errors.

---

### Task 8: AdminReviews Page

**Files:**
- Create: `src/pages/cadastre/AdminReviews.tsx`

- [ ] **Step 1: Write the page**

```typescript
// src/pages/cadastre/AdminReviews.tsx
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { StarRating } from '@/components/reviews/star-rating'
import { useAdminPendingReviews, useModerateReview } from '@/hooks/useReviews'

export default function AdminReviews() {
  return <AuthGuard><AdminReviewsInner /></AuthGuard>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function AdminReviewsInner() {
  const { data: reviews = [], isLoading } = useAdminPendingReviews()
  const { mutate: moderate, isPending } = useModerateReview()

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <Link to="/cadastre/painel" className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-teal transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
      </Link>

      <h1 className="font-display text-3xl font-semibold mb-2">Avaliações Pendentes</h1>
      <p className="text-sm text-[#737373] mb-8">Aprove ou rejeite avaliações antes de publicar.</p>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-[#E8E4DF] rounded-2xl h-24" />)}
        </div>
      )}

      {!isLoading && !reviews.length && (
        <div className="text-center py-16 text-[#B0A99F]">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-semibold">Nenhuma avaliação pendente</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <p className="font-semibold text-sm text-[#1A1A1A]">{r.author_name ?? 'Anônimo'}</p>
                <p className="text-xs text-[#B0A99F]">{r.business_name} · {formatDate(r.created_at)}</p>
              </div>
              <StarRating value={r.rating} readonly size="sm" />
            </div>
            {r.comment && <p className="text-sm text-[#3D3D3D] leading-relaxed mt-2 mb-4">{r.comment}</p>}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => moderate({ id: r.id, approve: true })}
                disabled={isPending}
                className="flex-1 bg-teal text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-teal-dark transition-colors disabled:opacity-50"
              >
                Aprovar
              </button>
              <button
                onClick={() => moderate({ id: r.id, approve: false })}
                disabled={isPending}
                className="flex-1 bg-[#F5F2EE] text-[#737373] rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#E8E4DF] transition-colors disabled:opacity-50"
              >
                Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

---

### Task 9: Update Painel.tsx — Add Admin Card

**Files:**
- Modify: `src/pages/cadastre/Painel.tsx`

- [ ] **Step 1: Add the reviews admin card**

Find this block in `Painel.tsx` (around lines 48-57):

```tsx
        {role === 'admin' && (
          <Link
            to="/cadastre/admin/claims"
            className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-2xl mb-2">🏷️</div>
            <h2 className="font-semibold text-lg">Reivindicações</h2>
            <p className="text-sm text-[#737373] mt-1">Aprovar ou rejeitar pedidos de dono.</p>
          </Link>
        )}
```

Replace with:

```tsx
        {role === 'admin' && (
          <Link
            to="/cadastre/admin/claims"
            className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-2xl mb-2">🏷️</div>
            <h2 className="font-semibold text-lg">Reivindicações</h2>
            <p className="text-sm text-[#737373] mt-1">Aprovar ou rejeitar pedidos de dono.</p>
          </Link>
        )}
        {role === 'admin' && (
          <Link
            to="/cadastre/admin/reviews"
            className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-2xl mb-2">⭐</div>
            <h2 className="font-semibold text-lg">Avaliações</h2>
            <p className="text-sm text-[#737373] mt-1">Moderar avaliações pendentes de aprovação.</p>
          </Link>
        )}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

---

### Task 10: Register Route in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add import**

Find this line at the top of `src/App.tsx`:

```typescript
import AdminClaims from '@/pages/cadastre/AdminClaims'
```

Replace with:

```typescript
import AdminClaims from '@/pages/cadastre/AdminClaims'
import AdminReviews from '@/pages/cadastre/AdminReviews'
```

- [ ] **Step 2: Add route**

Find this line in `src/App.tsx`:

```tsx
      <Route path="/cadastre/admin/claims" element={<PageWrapper><AdminClaims /></PageWrapper>} />
```

Replace with:

```tsx
      <Route path="/cadastre/admin/claims" element={<PageWrapper><AdminClaims /></PageWrapper>} />
      <Route path="/cadastre/admin/reviews" element={<PageWrapper><AdminReviews /></PageWrapper>} />
```

- [ ] **Step 3: Final TypeScript check + commit**

```bash
npx tsc --noEmit
```
Expected: no errors.

```bash
git add -A
git commit -m "feat: add Avalie e Comente with manual moderation

- gostoso_reviews table with RLS (anon insert pending, public read approved, admin full)
- StarRating, ReviewForm, ReviewList components
- useReviews, useSubmitReview, useAdminPendingReviews, useModerateReview hooks
- Reviews section wired into /negocio/:slug page
- Admin moderation page at /cadastre/admin/reviews
- Admin card added to Painel"
git push
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Public can submit star + comment → `ReviewForm` + `useSubmitReview`
- [x] Submitted reviews default to `approved=false` → enforced at RLS level AND in hook
- [x] Admin sees pending reviews → `AdminReviews` + `useAdminPendingReviews`
- [x] Admin can approve (set `approved=true`) or reject (delete row) → `useModerateReview`
- [x] Approved reviews display on business page → `ReviewList` in `Negocio.tsx`
- [x] Average rating displayed when reviews exist → in `ReviewList` header
- [x] No authentication required for submitting → anon insert via RLS
- [x] Admin card added to Painel → Task 9

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:**
- `Review.id` used in `useModerateReview({ id, approve })` — matches
- `business_id` (snake_case) used consistently across `ReviewInsert`, `useReviews(businessId)`, and form submit
- `StarRating` accepts `value: number` (not constrained to 1-5) — acceptable for display; `rating` stored as `1|2|3|4|5` strictly typed
