# Lightbox de Fotos + Informações Essenciais do Negócio

**Data:** 2026-04-28
**Status:** Aprovado

---

## Objetivo

Duas melhorias na página de negócio (`/negocio/:slug`) e no painel do dono (`/cadastre/perfil`):

1. **Lightbox** — fotos clicáveis com navegação fullscreen
2. **Informações essenciais** — faixa de preço, link do cardápio e amenidades, editáveis pelo dono e visíveis no diretório

---

## Feature 1 — Lightbox de Fotos

### Comportamento

- Clicar em qualquer foto da grade **ou** na foto de capa abre o lightbox
- Modal fullscreen com fundo escuro semitransparente (`bg-black/85`)
- Foto centralizada com `max-h-[90vh] max-w-[90vw] object-contain`
- Counter no canto superior esquerdo: "2 / 5"
- Botão X no canto superior direito para fechar
- Setas laterais para navegar (ocultas se apenas 1 foto)
- Fechar ao clicar fora da foto (no backdrop)
- Fechar com tecla Escape (event listener no `useEffect`)
- Navegação com setas do teclado (← →)
- A foto de capa entra no índice 0; fotos da galeria seguem a partir do índice 1

### Componente

**Arquivo:** `src/components/ui/lightbox.tsx`

```
Props:
  photos: string[]        — array de URLs (capa + galeria)
  initialIndex: number    — índice da foto clicada
  onClose: () => void     — callback de fechamento
```

O componente é completamente controlado — estado de índice interno, fechamento via `onClose`.

### Integração em Negocio.tsx

- Estado: `const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)`
- Foto de capa: `onClick={() => setLightboxIndex(0)}` (cursor pointer, sem alterar layout)
- Fotos da grade: cada `<div>` recebe `onClick={() => setLightboxIndex(i + 1)}` (índice +1 porque capa é 0)
- Array passado ao Lightbox: `[b.cover_url, ...b.photos].filter(Boolean)`
- `<Lightbox>` renderizado condicionalmente quando `lightboxIndex !== null`

---

## Feature 2 — Informações Essenciais

### Schema — novos campos em `gostoso_businesses`

```sql
ALTER TABLE gostoso_businesses
  ADD COLUMN IF NOT EXISTS price_range text,      -- '$' | '$$' | '$$$' | null
  ADD COLUMN IF NOT EXISTS menu_url    text,      -- URL livre (PDF, site, iFood, etc.)
  ADD COLUMN IF NOT EXISTS amenities   jsonb DEFAULT '{}'; -- { wifi, parking, accessible, reservations }
```

Migration: `supabase/migrations/20260428_business_extras.sql`

### Tipo TypeScript

Campos adicionados à interface `Business` em `src/types/database.ts`:

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

### Painel do dono — Perfil.tsx

Novos campos no formulário de edição (após os campos existentes, antes do botão Salvar):

- **Faixa de preço** — radio group horizontal: `$` / `$$` / `$$$` / (não informar)
- **Link do cardápio** — input text, placeholder "https://... ou link do WhatsApp"
- **Comodidades** — 4 checkboxes: WiFi grátis / Estacionamento / Acessível para cadeirantes / Aceita reservas

`PartialBusiness` type expandido para incluir os três novos campos.

### Página do negócio — Negocio.tsx

**Junto ao nome do negócio** (após o h1):
- Badge de faixa de preço: `$$` em cinza claro, se preenchido

**Botão "Ver cardápio"** (na sidebar, após o share button):
- Visível somente se `menu_url` preenchido
- Link externo `target="_blank"`, ícone `BookOpen`
- Cor: ocre (secundária da marca)

**Bloco de comodidades** (na sidebar, após contatos):
- Grid 2×2 com ícones pequenos: WiFi / Estacionamento / Acessível / Reservas
- Visível somente se pelo menos uma amenidade for `true`
- Ícones: `Wifi`, `Car`, `Accessibility` (ou `UserCheck`), `CalendarCheck` do lucide-react

### Card do diretório — BusinessCard

No bloco de badges abaixo do nome:
- Badge `$$` (price_range) se preenchido — cinza discreto, mesmo estilo dos outros badges
- Pílula "Cardápio" se `menu_url` preenchido — cor ocre claro

---

## Arquivos Afetados

| Ação | Arquivo |
|------|---------|
| Criar | `supabase/migrations/20260428_business_extras.sql` |
| Criar | `src/components/ui/lightbox.tsx` |
| Modificar | `src/types/database.ts` |
| Modificar | `src/pages/Negocio.tsx` |
| Modificar | `src/pages/cadastre/Perfil.tsx` |
| Modificar | `src/components/business/business-card.tsx` |

---

## Fora de Escopo (YAGNI)

- Upload de PDF de cardápio (dono fornece URL externa)
- Itens estruturados de menu (nome, preço, descrição)
- Faixa de preço automática baseada em dados reais
- Avaliações ou reviews
- Fotos adicionais pelo dono via upload (já existe `photos[]` — não expandir agora)
