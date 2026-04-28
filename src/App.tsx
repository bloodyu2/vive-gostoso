import { Routes, Route } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { InstallBanner } from '@/components/install-banner'
import { ScrollToTop } from '@/components/scroll-to-top'
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

export default function App() {
  return (
    <>
    <ScrollToTop />
    <InstallBanner />
    <Routes>
      <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
      <Route path="/come" element={<PageWrapper><Come /></PageWrapper>} />
      <Route path="/fique" element={<PageWrapper><Fique /></PageWrapper>} />
      <Route path="/passeie" element={<PageWrapper><Passeie /></PageWrapper>} />
      <Route path="/explore" element={<PageWrapper><Explore /></PageWrapper>} />
      <Route path="/participe" element={<PageWrapper><Participe /></PageWrapper>} />
      <Route path="/conheca" element={<PageWrapper><Conheca /></PageWrapper>} />
      <Route path="/apoie" element={<PageWrapper><Apoie /></PageWrapper>} />
      <Route path="/contrate" element={<PageWrapper><Contrate /></PageWrapper>} />
      <Route path="/resolva" element={<PageWrapper><Servicos /></PageWrapper>} />
      <Route path="/sobre" element={<PageWrapper><Sobre /></PageWrapper>} />
      <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
      <Route path="/blog/:slug" element={<PageWrapper><BlogPost /></PageWrapper>} />
      <Route path="/negocio/:slug" element={<PageWrapper><Negocio /></PageWrapper>} />
      <Route path="/cadastre" element={<Login />} />
      <Route path="/cadastre/painel" element={<PageWrapper><Painel /></PageWrapper>} />
      <Route path="/cadastre/perfil" element={<PageWrapper><Perfil /></PageWrapper>} />
      <Route path="/cadastre/preview" element={<PageWrapper><Preview /></PageWrapper>} />
      <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
    </Routes>
    </>
  )
}
