import { Link } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'

export default function Painel() {
  return <AuthGuard><PainelInner /></AuthGuard>
}

function PainelInner() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile()
  const role = profile?.role ?? null

  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-display text-3xl font-semibold">Painel do Prestador</h1>
          <p className="text-sm text-[#737373] mt-1">{user?.email}</p>
        </div>
        <Button variant="ghost" onClick={signOut}>Sair</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/cadastre/negocios" className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="text-2xl mb-2">🏪</div>
          <h2 className="font-semibold text-lg">Gerenciar negócios</h2>
          <p className="text-sm text-[#737373] mt-1">Veja, edite e publique seus negócios cadastrados.</p>
        </Link>
        <Link to="/cadastre/perfil" className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="text-2xl mb-2">➕</div>
          <h2 className="font-semibold text-lg">Adicionar novo negócio</h2>
          <p className="text-sm text-[#737373] mt-1">Cadastre mais um negócio na plataforma.</p>
        </Link>
        <Link to="/cadastre/preview" className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="text-2xl mb-2">👁</div>
          <h2 className="font-semibold text-lg">Preview</h2>
          <p className="text-sm text-[#737373] mt-1">Como seu negócio aparece no diretório.</p>
        </Link>
        {role === 'admin' && (
          <Link
            to="/cadastre/admin"
            className="bg-teal/10 border border-teal/20 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all col-span-full"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <h2 className="font-semibold text-lg text-teal">Painel Admin</h2>
            <p className="text-sm text-[#737373] mt-1">Moderar avaliações, reivindicações, serviços e vagas.</p>
          </Link>
        )}
      </div>
    </main>
  )
}
