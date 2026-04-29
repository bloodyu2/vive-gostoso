# Platform Fixes — 2026-04-29

## Scope
5 independent bugs and UI improvements discovered during QA.

---

## Fix 1 — Admin panel redirect (stale cache)

**Root cause:** `useProfile` has `staleTime: 5min`. After DB role update the in-memory cache still held `role: 'prestador'`, causing `AdminRoleCheck` to redirect immediately.

**Solution:** Reduce `staleTime` to `30s` in `useProfile.ts`. Fast enough for UX, won't hold stale role data.

**File:** `src/hooks/useProfile.ts`

---

## Fix 2 — Services clarification (Contrate vs business profile)

**Root cause:** Two separate systems exist:
- `gostoso_businesses.services` (JSONB) → shown on business profile page, edited in Perfil.tsx
- `gostoso_service_listings` table → shown in Contrate page, submitted via separate form, needs admin approval

User added services in Perfil.tsx and expected them in Contrate. They are architecturally separate.

**Solution:**
- Rename `ServicesSection` heading to "Serviços do negócio" with subtitle clarifying these show on the business profile
- Add a link/CTA pointing to `/contrate` for listing in the directory
- Check `gostoso_service_listings` for any pending submissions and approve them via admin

**File:** `src/pages/cadastre/Perfil.tsx`

---

## Fix 3 — Opening hours editor

**Root cause:** `Perfil.tsx` loads `opening_hours` but has no UI to edit or save it.

**Schema:** `Record<'dom'|'seg'|'ter'|'qua'|'qui'|'sex'|'sab', { open: string; close: string; closed: boolean }>`

**Solution:** Add `OpeningHoursSection` component to Perfil.tsx:
- 7 rows, one per day (dom → sab) with full Portuguese name
- Each row: "Fechado" checkbox + open/close time inputs
- When `opening_hours` is null → show all rows empty (closed state, no times)
- When editing → load existing values
- Include `opening_hours` in the save payload (update and insert)

**File:** `src/pages/cadastre/Perfil.tsx`

---

## Fix 4 — "Aberto" badge position in Hoje

**Root cause:** Badge uses `ml-auto flex-shrink-0` pushing it to the far right. On narrow screens the name gets truncated badly.

**Solution:** Move badge inside the text block, below the name, left-aligned alongside category.

Layout becomes:
```
[thumb]  Nome do negócio
         ● Aberto  ·  Categoria
```

**File:** `src/components/home/hoje.tsx`

---

## Fix 5 — Explore sidebar: jump pills for categories

**Root cause:** Sidebar lists all businesses sequentially. To navigate from Restaurantes to Hospedagem on mobile requires scrolling through all items.

**Solution:** Add horizontal sticky pill bar at the top of sidebar. Each pill uses `scrollIntoView` on a `ref` attached to each verb section header.

Also fix Contrate category filter: change from `flex flex-wrap` to horizontal `overflow-x-auto` scroll row.

**Files:** `src/components/map/explore-map.tsx`, `src/pages/Contrate.tsx`

---

## Verification plan
1. TS build passes (`tsc --noEmit`)
2. Open `/cadastre/admin` → should load without redirect
3. Open `/cadastre/perfil?bizId=...` → opening hours section visible and saveable
4. Open `/explore` on mobile → pill nav visible at top of sidebar, tapping pill scrolls to section
5. Open `/contrate` on mobile → category pills scroll horizontally
6. "Agora em Gostoso" → badge appears below name on narrow viewport
