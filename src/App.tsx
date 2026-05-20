import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { InstallBanner } from '@/components/install-banner'
import { ShareFab } from '@/components/share-fab'
import { ScrollToTop } from '@/components/scroll-to-top'
import { CookieBanner } from '@/components/cookie-banner'
import { LocaleSync } from '@/components/i18n/locale-sync'

// Lazy load de páginas públicas
const Home = lazy(() => import('@/pages/Home'))
const Come = lazy(() => import('@/pages/Come'))
const Fique = lazy(() => import('@/pages/Fique'))
const Passeie = lazy(() => import('@/pages/Passeie'))
const Explore = lazy(() => import('@/pages/Explore'))
const Participe = lazy(() => import('@/pages/Participe'))
const Conheca = lazy(() => import('@/pages/Conheca'))
const Apoie = lazy(() => import('@/pages/Apoie'))
const Negocio = lazy(() => import('@/pages/Negocio'))
const Contrate = lazy(() => import('@/pages/Contrate'))
const Servicos = lazy(() => import('@/pages/Servicos'))
const Sobre = lazy(() => import('@/pages/Sobre'))
const Blog = lazy(() => import('@/pages/Blog'))
const BlogPost = lazy(() => import('@/pages/BlogPost'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Bio = lazy(() => import('@/pages/Bio'))
const Evento = lazy(() => import('@/pages/Evento'))
const Transfer = lazy(() => import('@/pages/Transfer'))

// Lazy load de páginas admin/cadastre (raramente acessadas por visitantes)
const Login = lazy(() => import('@/pages/cadastre/Login'))
const Painel = lazy(() => import('@/pages/cadastre/Painel'))
const Perfil = lazy(() => import('@/pages/cadastre/Perfil'))
const Preview = lazy(() => import('@/pages/cadastre/Preview'))
const Claim = lazy(() => import('@/pages/cadastre/Claim'))
const Admin = lazy(() => import('@/pages/cadastre/Admin'))
const MeusNegocios = lazy(() => import('@/pages/cadastre/MeusNegocios'))
const AdminClaims = lazy(() => import('@/pages/cadastre/AdminClaims'))
const AdminReviews = lazy(() => import('@/pages/cadastre/AdminReviews'))
const AdminEvents = lazy(() => import('@/pages/cadastre/AdminEvents'))
const AdminServices = lazy(() => import('@/pages/cadastre/AdminServices'))
const AdminJobs = lazy(() => import('@/pages/cadastre/AdminJobs'))
const AdminTransfers = lazy(() => import('@/pages/cadastre/AdminTransfers'))
const AdminBusinesses = lazy(() => import('@/pages/cadastre/AdminBusinesses'))
const ResetarSenha = lazy(() => import('@/pages/cadastre/ResetarSenha'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#F5F2EE]">
    <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
  </div>
)

/**
 * Public page routes — defined once as JSX element array and reused
 * under each locale prefix (/, /en, /es).
 * Paths are RELATIVE (no leading slash) so React Router nests them correctly.
 */
const PUBLIC_ROUTES = [
  <Route key="home"       index                    element={<PageWrapper><Home /></PageWrapper>} />,
  <Route key="come"       path="come"              element={<PageWrapper><Come /></PageWrapper>} />,
  <Route key="fique"      path="fique"             element={<PageWrapper><Fique /></PageWrapper>} />,
  <Route key="passeie"    path="passeie"           element={<PageWrapper><Passeie /></PageWrapper>} />,
  <Route key="explore"    path="explore"           element={<PageWrapper><Explore /></PageWrapper>} />,
  <Route key="participe"  path="participe"         element={<PageWrapper><Participe /></PageWrapper>} />,
  <Route key="conheca"    path="conheca"           element={<PageWrapper><Conheca /></PageWrapper>} />,
  <Route key="apoie"      path="apoie"             element={<PageWrapper><Apoie /></PageWrapper>} />,
  <Route key="contrate"   path="contrate"          element={<PageWrapper><Contrate /></PageWrapper>} />,
  <Route key="resolva"    path="resolva"           element={<PageWrapper><Servicos /></PageWrapper>} />,
  <Route key="sobre"      path="sobre"             element={<PageWrapper><Sobre /></PageWrapper>} />,
  <Route key="blog"       path="blog"              element={<PageWrapper><Blog /></PageWrapper>} />,
  <Route key="blog-slug"  path="blog/:slug"        element={<PageWrapper><BlogPost /></PageWrapper>} />,
  <Route key="negocio"    path="negocio/:slug"     element={<PageWrapper><Negocio /></PageWrapper>} />,
  <Route key="evento"     path="evento/:id"        element={<PageWrapper><Evento /></PageWrapper>} />,
  <Route key="transfer"   path="transfer"          element={<PageWrapper><Transfer /></PageWrapper>} />,
]

export default function App() {
  return (
    <>
      <ScrollToTop />
      <InstallBanner />
      <ShareFab />
      <CookieBanner />
      <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Portuguese (default — no locale prefix) ── */}
        <Route path="/" element={<LocaleSync lang="pt" />}>
          {PUBLIC_ROUTES}
        </Route>

        {/* ── English ── */}
        <Route path="/en" element={<LocaleSync lang="en" />}>
          {PUBLIC_ROUTES}
        </Route>

        {/* ── Spanish ── */}
        <Route path="/es" element={<LocaleSync lang="es" />}>
          {PUBLIC_ROUTES}
        </Route>

        {/* ── Cadastre / Admin — always PT, no locale prefix ── */}
        <Route path="/bio"                          element={<Bio />} />
        <Route path="/cadastre"                     element={<Login />} />
        <Route path="/cadastre/resetar-senha"       element={<ResetarSenha />} />
        <Route path="/cadastre/painel"              element={<PageWrapper><Painel /></PageWrapper>} />
        <Route path="/cadastre/perfil"              element={<PageWrapper><Perfil /></PageWrapper>} />
        <Route path="/cadastre/negocios"            element={<PageWrapper><MeusNegocios /></PageWrapper>} />
        <Route path="/cadastre/preview"             element={<PageWrapper><Preview /></PageWrapper>} />
        <Route path="/cadastre/claim/:slug"         element={<Claim />} />
        <Route path="/cadastre/admin"               element={<PageWrapper><Admin /></PageWrapper>} />
        <Route path="/cadastre/admin/claims"        element={<PageWrapper><AdminClaims /></PageWrapper>} />
        <Route path="/cadastre/admin/reviews"       element={<PageWrapper><AdminReviews /></PageWrapper>} />
        <Route path="/cadastre/admin/events"        element={<PageWrapper><AdminEvents /></PageWrapper>} />
        <Route path="/cadastre/admin/services"      element={<PageWrapper><AdminServices /></PageWrapper>} />
        <Route path="/cadastre/admin/jobs"          element={<PageWrapper><AdminJobs /></PageWrapper>} />
        <Route path="/cadastre/admin/transfers"     element={<PageWrapper><AdminTransfers /></PageWrapper>} />
        <Route path="/cadastre/admin/businesses"    element={<PageWrapper><AdminBusinesses /></PageWrapper>} />

        {/* ── 404 ── */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />

      </Routes>
      </Suspense>
    </>
  )
}
