import { Link } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export default function Painel() {
  return <AuthGuard><PainelInner /></AuthGuard>
}

function PainelInner() {
  const { user, signOut } = useAuth()
  return (
    <main className="max-w-4xl mx-auto px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-display text-3xl font-semibold">Painel do Prestador</h1>
          <p className="text-sm text-[#737373] mt-1">{user?.email}</p>
        </div>
        <Button variant="ghost" onClick={signOut}>Sair</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/cadastre/perfil" className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="text-2xl mb-2">🏠</div>
          <h2 className="font-semibold text-lg">Meu Negócio</h2>
          <p className="text-sm text-[#737373] mt-1">Edite as informações do seu negócio.</p>
        </Link>
        <Link to="/cadastre/preview" className="bg-white border border-[#E8E4DF] rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="text-2xl mb-2">👁</div>
          <h2 className="font-semibold text-lg">Preview</h2>
          <p className="text-sm text-[#737373] mt-1">Como seu negócio aparece no diretório.</p>
        </Link>
      </div>
    </main>
  )
}
