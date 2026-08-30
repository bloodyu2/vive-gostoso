// SSR, fetchers de build-time SSG/ISR, e hooks client-side alcancaveis por visitante
// anonimo). Deliberadamente exclui stripe_customer_id / stripe_subscription_id -- ver F3,
// docs/security-audit/relatorio-auditoria-seguranca.pdf (2026-08-29). NAO adicione essas
// duas colunas de volta aqui; se uma tela futura de admin/dono precisar delas, faca um
// select explicito proprio dessa tela, sem alargar esta constante compartilhada.
export const PUBLIC_BUSINESS_COLUMNS =
  'id, name, slug, description, category_id, profile_id, address, lat, lng, phone, whatsapp, ' +
  'website, instagram, cover_url, photos, opening_hours, is_verified, is_featured, plan, active, ' +
  'display_order, created_at, updated_at, price_range, menu_url, amenities, is_published, ' +
  'business_type, services'

export const PUBLIC_BUSINESS_COLUMNS_WITH_CATEGORY =
  `${PUBLIC_BUSINESS_COLUMNS}, category:gostoso_categories(*)`

