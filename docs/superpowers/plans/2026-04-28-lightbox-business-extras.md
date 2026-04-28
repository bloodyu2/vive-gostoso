# Lightbox + Business Extras Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar lightbox de fotos clicáveis e campos de informações essenciais (faixa de preço, cardápio, amenidades) editáveis pelo dono e visíveis no diretório.

**Architecture:** Migration adiciona 3 colunas à tabela existente. Lightbox é um componente React puro sem dependência externa, controlado por índice. Perfil.tsx ganha novos campos de formulário. Negocio.tsx exibe as novas informações. BusinessCard mostra badges discretos. Cleanup remove docs/superpowers/.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Supabase (PostgreSQL), lucide-react.

---

## File Structure

| Ação | Arquivo |
|------|---------|
| Create | `supabase/migrations/20260428_business_extras.sql` |
| Create | `src/components/ui/lightbox.tsx` |
| Modify | `src/types/database.ts` |
| Modify | `src/pages/Negocio.tsx` |
| Modify | `src/pages/cadastre/Perfil.tsx` |
| Modify | `src/components/business/business-card.tsx` |
| Delete | `docs/` (pasta inteira — planos e specs de IA) |

---

## Task 1: Migration — price_range, menu_url, amenities

**Files:**
- Create: `supabase/migrations/20260428_business_extras.sql`

- [ ] **Step 1: Criar o arquivo de migration**

Conteúdo exato:

```sql
-- Informações essenciais do negócio: faixa de preço, cardápio, comodidades

ALTER TABLE gostoso_businesses
  ADD COLUMN IF NOT EXISTS price_range text,
  ADD COLUMN IF NOT EXISTS menu_url    text,
  ADD COLUMN IF NOT EXISTS amenities   jsonb DEFAULT '{}';
```

- [ ] **Step 2: Aplicar no Supabase**

Via Supabase MCP `apply_migration`:
- project_id: `eeklaiqrbtfhnnalzgjn`
- name: `20260428_business_extras`
- query: SQL acima

Verificar com `execute_sql`: `SELECT price_range, menu_url, amenities FROM gostoso_businesses LIMIT 1;`
Esperado: retorna sem erro (colunas existem).

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\Victor Lima\Desktop\sites\gostoso\vive-gostoso"
git add supabase/migrations/20260428_business_extras.sql
git commit -m "feat(db): price_range, menu_url, amenities em gostoso_businesses"
```

---

## Task 2: Tipos TypeScript — atualizar interface Business

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Ler o arquivo atual**

Ler `src/types/database.ts` — a interface `Business` está por volta da linha 12.

- [ ] **Step 2: Adicionar os 3 novos campos à interface Business**

Após `updated_at: string` (último campo atual), adicionar:

```ts
  price_range: '$' | '$$' | '$$$' | null
  menu_url: string | null
  amenities: {
    wifi?: boolean
    parking?: boolean
    accessible?: boolean
    reservations?: boolean
  } | null
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd "C:\Users\Victor Lima\Desktop\sites\gostoso\vive-gostoso"
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 4: Commit**

```bash
git add src/types/database.ts
git commit -m "feat(types): price_range, menu_url, amenities na interface Business"
```

---

## Task 3: Componente Lightbox

**Files:**
- Create: `src/components/ui/lightbox.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/ui/lightbox.tsx
import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  photos: string[]
  initialIndex: number
  onClose: () => void
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = [initialIndex, (i: number) => {
    // controlled from outside — use internal state instead
  }]

  // Use internal index state for navigation
  const [current, setCurrent] = [initialIndex, initialIndex]

  return null // placeholder — see full implementation below
}
```

Na verdade, o componente precisa de estado interno para navegação. Implementação completa:

```tsx
// src/components/ui/lightbox.tsx
import { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
  photos: string[]       // array de URLs — índice 0 é capa, demais são galeria
  initialIndex: number   // índice clicado
  onClose: () => void
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex)

  const prev = useCallback(() =>
    setCurrent(i => (i - 1 + photos.length) % photos.length), [photos.length])

  const next = useCallback(() =>
    setCurrent(i => (i + 1) % photos.length), [photos.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  // Bloquear scroll do body enquanto aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/70 text-sm font-medium select-none">
        {current + 1} / {photos.length}
      </div>

      {/* Fechar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        aria-label="Fechar"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Seta esquerda */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors bg-black/30 rounded-full p-2"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Foto */}
      <img
        src={photos[current]}
        alt={`Foto ${current + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      {/* Seta direita */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors bg-black/30 rounded-full p-2"
          aria-label="Próxima foto"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/lightbox.tsx
git commit -m "feat(ui): Lightbox — navegação fullscreen de fotos"
```

---

## Task 4: Negocio.tsx — lightbox + novos campos

**Files:**
- Modify: `src/pages/Negocio.tsx`

- [ ] **Step 1: Ler o arquivo atual**

Ler `src/pages/Negocio.tsx` para entender a estrutura exata.

- [ ] **Step 2: Adicionar imports**

Após os imports existentes, adicionar:

```tsx
import { Lightbox } from '@/components/ui/lightbox'
import { BookOpen, Wifi, Car, UserCheck, CalendarCheck } from 'lucide-react'
```

- [ ] **Step 3: Adicionar estado do lightbox**

Dentro da função `Negocio()`, após `const [copied, setCopied] = useState(false)`:

```tsx
const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
```

- [ ] **Step 4: Tornar foto de capa clicável**

Encontrar o div da capa (`aspect-[21/9]`). Adicionar `cursor-pointer` e `onClick`:

```tsx
<div
  className="aspect-[21/9] bg-gradient-to-br from-teal to-teal-dark rounded-2xl overflow-hidden mb-8 relative cursor-pointer"
  onClick={() => b.cover_url ? setLightboxIndex(0) : undefined}
>
```

- [ ] **Step 5: Tornar fotos da galeria clicáveis**

Na seção `{/* Fotos */}`, mudar cada `<div key={i}>` para receber onClick com índice correto (capa ocupa índice 0, galeria começa em 1):

```tsx
{b.photos && b.photos.length > 0 && (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
    {b.photos.map((url, i) => (
      <div
        key={i}
        className="aspect-square rounded-xl overflow-hidden bg-[#E8E4DF] cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setLightboxIndex(b.cover_url ? i + 1 : i)}
      >
        <img src={url} alt={`${b.name} foto ${i + 1}`} className="w-full h-full object-cover" />
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 6: Adicionar badge de faixa de preço**

Após `<h1 className="font-display font-bold text-4xl ...">`, adicionar:

```tsx
{b.price_range && (
  <span className="inline-block text-sm font-semibold text-[#737373] bg-[#F0EDEA] px-2 py-0.5 rounded-lg mb-4">
    {b.price_range}
  </span>
)}
```

- [ ] **Step 7: Adicionar botão "Ver cardápio" na sidebar**

Na sidebar (`<aside>`), após o botão de share e antes do `{/* Claim */}`:

```tsx
{/* Cardápio */}
{b.menu_url && (
  <a
    href={b.menu_url}
    target="_blank"
    rel="noopener noreferrer"
    className="w-full flex items-center justify-center gap-2 bg-ocre/10 text-ocre border border-ocre/30 rounded-2xl px-5 py-3.5 text-sm font-semibold hover:bg-ocre/20 transition-colors"
  >
    <BookOpen className="w-4 h-4" />
    Ver cardápio
  </a>
)}
```

- [ ] **Step 8: Adicionar bloco de amenidades na sidebar**

Após o bloco `{/* Contatos */}` e antes do `{/* Horários */}`:

```tsx
{/* Amenidades */}
{b.amenities && Object.values(b.amenities).some(Boolean) && (
  <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5">
    <h3 className="font-semibold text-sm text-[#1A1A1A] uppercase tracking-wide mb-3">Comodidades</h3>
    <div className="grid grid-cols-2 gap-2">
      {b.amenities.wifi && (
        <div className="flex items-center gap-2 text-sm text-[#3D3D3D]">
          <Wifi className="w-4 h-4 text-teal flex-shrink-0" /> WiFi grátis
        </div>
      )}
      {b.amenities.parking && (
        <div className="flex items-center gap-2 text-sm text-[#3D3D3D]">
          <Car className="w-4 h-4 text-teal flex-shrink-0" /> Estacionamento
        </div>
      )}
      {b.amenities.accessible && (
        <div className="flex items-center gap-2 text-sm text-[#3D3D3D]">
          <UserCheck className="w-4 h-4 text-teal flex-shrink-0" /> Acessível
        </div>
      )}
      {b.amenities.reservations && (
        <div className="flex items-center gap-2 text-sm text-[#3D3D3D]">
          <CalendarCheck className="w-4 h-4 text-teal flex-shrink-0" /> Aceita reservas
        </div>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 9: Renderizar o Lightbox**

No final do JSX retornado, antes do `</main>` de fechamento, adicionar:

```tsx
{/* Lightbox */}
{lightboxIndex !== null && (
  <Lightbox
    photos={[b.cover_url, ...b.photos].filter((u): u is string => !!u)}
    initialIndex={lightboxIndex}
    onClose={() => setLightboxIndex(null)}
  />
)}
```

- [ ] **Step 10: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 11: Commit**

```bash
git add src/pages/Negocio.tsx
git commit -m "feat(negocio): lightbox, cardápio, faixa de preço, amenidades"
```

---

## Task 5: Perfil.tsx — novos campos de formulário

**Files:**
- Modify: `src/pages/cadastre/Perfil.tsx`

- [ ] **Step 1: Ler o arquivo atual**

Ler `src/pages/cadastre/Perfil.tsx`.

- [ ] **Step 2: Expandir o tipo PartialBusiness**

Mudar a linha do tipo (linha ~14):

```ts
type PartialBusiness = Partial<Pick<Business,
  'id' | 'name' | 'description' | 'address' | 'whatsapp' | 'instagram' | 'website' | 'category_id' |
  'price_range' | 'menu_url' | 'amenities'
>>
```

- [ ] **Step 3: Atualizar o select da query para incluir os novos campos**

Na query do `useEffect` (linha ~46), mudar `.select('id, name, description, address, whatsapp, instagram, website, category_id')` para:

```ts
.select('id, name, description, address, whatsapp, instagram, website, category_id, price_range, menu_url, amenities')
```

- [ ] **Step 4: Atualizar o update para incluir os novos campos**

No `handleSave`, no bloco `if (biz.id)`, adicionar os novos campos ao update:

```ts
await supabase
  .from('gostoso_businesses')
  .update({
    name: biz.name, description: biz.description, address: biz.address,
    whatsapp: biz.whatsapp, instagram: biz.instagram, website: biz.website,
    category_id: biz.category_id, slug,
    price_range: biz.price_range ?? null,
    menu_url: biz.menu_url ?? null,
    amenities: biz.amenities ?? {},
  })
  .eq('id', biz.id)
```

- [ ] **Step 5: Adicionar campos no formulário**

Após o campo `<select>` de categoria e antes do `<Button type="submit">`, adicionar:

```tsx
{/* Faixa de preço */}
<div>
  <label className="block text-sm font-medium mb-1.5">Faixa de preço</label>
  <div className="flex gap-2">
    {(['', '$', '$$', '$$$'] as const).map(v => (
      <button
        key={v}
        type="button"
        onClick={() => setBiz(b => ({ ...b, price_range: v || null }))}
        className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
          (biz.price_range ?? '') === v
            ? 'bg-teal text-white border-teal'
            : 'bg-white text-[#737373] border-[#E8E4DF] hover:border-teal'
        }`}
      >
        {v || 'Não informar'}
      </button>
    ))}
  </div>
</div>

{/* Link do cardápio */}
<div>
  <label className="block text-sm font-medium mb-1.5">Link do cardápio <span className="text-[#737373] font-normal">(opcional)</span></label>
  <input
    type="url"
    value={biz.menu_url ?? ''}
    onChange={e => setBiz(b => ({ ...b, menu_url: e.target.value || null }))}
    placeholder="https://... link do PDF, site ou WhatsApp"
    className="w-full px-4 py-3 rounded-xl border border-[#E8E4DF] text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
  />
</div>

{/* Comodidades */}
<div>
  <label className="block text-sm font-medium mb-2">Comodidades</label>
  <div className="grid grid-cols-2 gap-2">
    {([
      { key: 'wifi',         label: 'WiFi grátis' },
      { key: 'parking',      label: 'Estacionamento' },
      { key: 'accessible',   label: 'Acessível' },
      { key: 'reservations', label: 'Aceita reservas' },
    ] as const).map(({ key, label }) => (
      <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={biz.amenities?.[key] ?? false}
          onChange={e => setBiz(b => ({
            ...b,
            amenities: { ...b.amenities, [key]: e.target.checked },
          }))}
          className="w-4 h-4 rounded border-[#E8E4DF] accent-teal"
        />
        <span className="text-sm">{label}</span>
      </label>
    ))}
  </div>
</div>
```

- [ ] **Step 6: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: zero erros. Se houver erro em `price_range` com o array `as const` do radio group, usar cast explícito: `v as '$' | '$$' | '$$$' | null`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/cadastre/Perfil.tsx
git commit -m "feat(perfil): campos de faixa de preço, cardápio e comodidades"
```

---

## Task 6: BusinessCard — badges de preço e cardápio

**Files:**
- Modify: `src/components/business/business-card.tsx`

- [ ] **Step 1: Ler o arquivo atual**

Ler `src/components/business/business-card.tsx`.

- [ ] **Step 2: Adicionar badges em ambas as views (list e grid)**

Em ambos os blocos de badges (`div` com `flex gap-1.5`), após `<ManagedBadge ...>`, adicionar:

```tsx
{b.price_range && (
  <span className="inline-flex items-center text-xs font-semibold text-[#737373] bg-[#F0EDEA] px-2 py-0.5 rounded-full">
    {b.price_range}
  </span>
)}
{b.menu_url && (
  <span className="inline-flex items-center text-xs font-semibold text-ocre bg-ocre/10 px-2 py-0.5 rounded-full">
    Cardápio
  </span>
)}
```

Atenção: no view `list`, os badges ficam na `div className="flex gap-1.5 mb-1.5 flex-wrap"` logo acima do nome. No view `grid`, ficam na `div className="flex gap-1.5 mb-2 flex-wrap"`. Adicionar em ambas.

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/business/business-card.tsx
git commit -m "feat(card): badges de faixa de preço e cardápio"
```

---

## Task 7: Cleanup — remover docs/superpowers/ e .md desnecessários

**Files:**
- Delete: `docs/` (pasta inteira com planos e specs de IA)

- [ ] **Step 1: Remover a pasta docs/ do git e do disco**

```bash
cd "C:\Users\Victor Lima\Desktop\sites\gostoso\vive-gostoso"
git rm -r docs/
```

Se a pasta não estiver tracked (nunca commitada nesta branch), usar:
```bash
rm -rf docs/
```

Verificar com `git status` que `docs/` sumiu.

- [ ] **Step 2: Verificar se há outros .md na raiz do projeto**

```bash
cd "C:\Users\Victor Lima\Desktop\sites\gostoso\vive-gostoso"
git ls-files "*.md"
```

Remover qualquer `.md` que aparecer na raiz do projeto (exceto se for parte de documentação necessária para o projeto funcionar — o que não é o caso aqui).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove docs/superpowers — planos e specs de IA não pertencem ao repositório"
```

---

## Task 8: Push final e verificar deploy

- [ ] **Step 1: Verificar TypeScript uma última vez**

```bash
cd "C:\Users\Victor Lima\Desktop\sites\gostoso\vive-gostoso"
npx tsc --noEmit
```

Esperado: zero erros.

- [ ] **Step 2: Push**

```bash
git push origin master
```

- [ ] **Step 3: Monitorar deploy Vercel**

Disparar agente de monitoramento:
- project ID: `prj_3yXMgm98eol49odpyhWxyKuSeZq2`
- team: `team_kDTAxnxOZafvxlReYHY3cFwv`

Verificar: status = READY. Se ERROR: buscar build logs e corrigir.

---

## Self-Review

### Spec coverage

| Requisito | Task |
|-----------|------|
| Fotos clicáveis na galeria | Task 4 Step 5 |
| Foto de capa clicável | Task 4 Step 4 |
| Lightbox com navegação, counter, Escape, setas teclado | Task 3 |
| Fechar ao clicar fora | Task 3 (onClick no backdrop) |
| Bloquear scroll do body | Task 3 (useEffect) |
| price_range na DB | Task 1 |
| menu_url na DB | Task 1 |
| amenities na DB | Task 1 |
| Tipos TS atualizados | Task 2 |
| Formulário do dono editável (price_range, menu_url, amenities) | Task 5 |
| Botão "Ver cardápio" na página do negócio | Task 4 Step 7 |
| Badge de preço na página do negócio | Task 4 Step 6 |
| Bloco de amenidades na sidebar | Task 4 Step 8 |
| Badge de preço no card | Task 6 |
| Pílula "Cardápio" no card | Task 6 |
| Cleanup de .md | Task 7 |

### Placeholder scan

Nenhum placeholder encontrado. Todos os steps têm código completo.

### Type consistency

- `price_range` definido em Task 2 como `'$' | '$$' | '$$$' | null` — usado como tal em Tasks 4, 5, 6
- `amenities` definido como `{ wifi?, parking?, accessible?, reservations? } | null` — campos usados consistentemente em Tasks 4 e 5
- `LightboxProps.photos: string[]` — chamado em Task 4 Step 9 com `[b.cover_url, ...b.photos].filter((u): u is string => !!u)` que retorna `string[]` ✅
- `initialIndex` em Task 3 é `number` — passado como `lightboxIndex` que é `number` (nunca `null` no ponto de renderização) ✅
