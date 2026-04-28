import { Routes, Route } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/page-wrapper'
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
import NotFound from '@/pages/NotFound'
import Login from '@/pages/cadastre/Login'
import Painel from '@/pages/cadastre/Painel'
import Perfil from '@/pages/cadastre/Perfil'
import Preview from '@/pages/cadastre/Preview'

export default function App() {
  return (
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
      <Route path="/negocio/:slug" element={<PageWrapper><Negocio /></PageWrapper>} />
      <Route path="/cadastre" element={<Login />} />
      <Route path="/cadastre/painel" element={<PageWrapper><Painel /></PageWrapper>} />
      <Route path="/cadastre/perfil" element={<PageWrapper><Perfil /></PageWrapper>} />
      <Route path="/cadastre/preview" element={<PageWrapper><Preview /></PageWrapper>} />
      <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
    </Routes>
  )
}
