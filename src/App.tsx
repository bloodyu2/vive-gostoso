import { Routes, Route } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { InstallBanner } from '@/components/install-banner'
import { ShareFab } from '@/components/share-fab'
import { ScrollToTop } from '@/components/scroll-to-top'
import { CookieBanner } from '@/components/cookie-banner'
import { LocaleSync } from '@/components/i18n/locale-sync'
import Home from '@/pages/Home'
import Come from '@/pages/Come'
import Fique from '@/pages/Fique'
import Passeie from '@/pages/Passeie'
import Explore from '@/pages/Explore'
import Participe from '@/pages/Participe'
import Conheca from '@/pages/Conheca'
import Apoie from '@/pages/Apoie'
import Negocio from '@/pages/Negocio'
import Contrate from '@/pages/Contrate'
import Servicos from '@/pages/Servicos'
import Sobre from '@/pages/Sobre'
import Blog from '@/pages/Blog'
import BlogPost from '@/pages/BlogPost'
import NotFound from '@/pages/NotFound'
import Login from '@/pages/cadastre/Login'
import Painel from '@/pages/cadastre/Painel'
import Perfil from '@/pages/cadastre/Perfil'
import Preview from '@/pages/cadastre/Preview'
import Claim from '@/pages/cadastre/Claim'
import Admin from '@/pages/cadastre/Admin'
import MeusNegocios from '@/pages/cadastre/MeusNegocios'
import AdminClaims from '@/pages/cadastre/AdminClaims'
import AdminReviews from '@/pages/cadastre/AdminReviews'
import AdminEvents from '@/pages/cadastre/AdminEvents'
import AdminServices from '@/pages/cadastre/AdminServices'
import AdminJobs from '@/pages/cadastre/AdminJobs'
import AdminTransfers from '@/pages/cadastre/AdminTransfers'
import AdminBusinesses from '@/pages/cadastre/AdminBusinesses'
import ResetarSenha from '@/pages/cadastre/ResetarSenha'
import Bio from '@/pages/Bio'
import Evento from '@/pages/Evento'
import Transfer from '@/pages/Transfer'

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
    </>
  )
}
