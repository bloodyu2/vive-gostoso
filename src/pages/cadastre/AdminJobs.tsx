import { Link } from 'react-router-dom'
import { AdminGuard } from '@/components/auth/admin-guard'

export default function AdminJobs() {
  return <AdminGuard><AdminJobsInner /></AdminGuard>
}

function AdminJobsInner() {
  return (
    <main className="max-w-4xl mx-auto px-5 md:px-8 py-12">
      <Link to="/cadastre/admin" className="text-sm text-[#737373] hover:text-teal transition-colors inline-block mb-6">
        ← Admin
      </Link>
      <h1 className="font-display text-3xl font-semibold mb-2">Vagas CONTRATE</h1>
      <p className="text-sm text-[#737373] mb-8">Publicar ou rejeitar vagas de emprego.</p>
      <div className="text-center py-16 border-2 border-dashed border-[#E8E4DF] rounded-2xl">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-[#737373] text-sm">Em breve — moderação de vagas.</p>
      </div>
    </main>
  )
}
